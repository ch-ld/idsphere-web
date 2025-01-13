<template>
  <div class="ssh-terminal">
    <div ref="terminal" class="terminal-container" />
    <div class="toolbar">
      <el-button-group>
        <el-button type="primary" :disabled="!isConnected" @click="sendCommand('clear')">
          清屏
        </el-button>
        <el-button type="primary" :disabled="!isConnected" @click="sendCommand('sudo su')">
          切换到 root
        </el-button>
        <el-button type="primary" :disabled="!isConnected" @click="sendCommand('exit')">
          退出 root
        </el-button>
        <el-button type="primary" :disabled="!isConnected" @click="sendCommand('ls -l')">
          列出文件
        </el-button>
        <el-button type="primary" :disabled="!isConnected" @click="sendCommand('cd ~')">
          返回家目录
        </el-button>
      </el-button-group>

      <el-dropdown trigger="click" :disabled="!isConnected">
        <el-button type="primary">
          历史命令
          <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="cmd in historyCommands"
            :key="cmd"
            @click.native="sendCommand(cmd)"
          >
            {{ cmd }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import { FitAddon } from 'xterm-addon-fit'
import { getWebSSHUrl } from '@/api/host/ssh/ssh'
import { ElMessage } from 'element-ui'

export default {
  name: 'SshTerminal',
  props: {
    host: {
      type: Object,
      required: true,
      validator: function(value) {
        return value.privateIp || value.publicIp
      }
    },
    // 添加新的 prop 来指定使用哪个 IP
    selectedType: {
      type: String,
      default: 'private',
      validator: function(value) {
        return ['private', 'public'].includes(value)
      }
    }
  },

  data() {
    return {
      currentIp: null, // 存储当前使用的 IP
      terminal: null,
      websocket: null,
      fitAddon: null,
      isConnected: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 3,
      historyCommands: [],
      currentPrompt: '',
      currentCommand: '',
      terminalConfig: {
        cols: 150,
        rows: 30,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        cursorBlink: true,
        cursorStyle: 'block',
        cursorWidth: 1,
        scrollback: 1000,
        convertEol: true,
        rendererType: 'canvas',
        theme: {
          background: '#1e1e1e',
          foreground: '#ffffff',
          cursor: '#ffffff'
        }
      }
    }
  },
  // 添加监听 prop 变化
  watch: {
    selectedType: {
      handler(newType) {
        this.currentIp = newType === 'public'
          ? this.host.publicIp
          : this.host.privateIp

        // 如果已连接，则重新连接
        if (this.isConnected) {
          this.destroyTerminal()
          this.initTerminal()
          this.connectWebSocket()
        }
      },
      immediate: true
    }
  },

  created() {
    // 初始化时确定使用的 IP
    this.currentIp = this.selectedType === 'public'
      ? this.host.publicIp
      : this.host.privateIp
  },

  mounted() {
    this.initTerminal()
    this.$nextTick(() => {
      this.connectWebSocket()
    })
  },

  beforeDestroy() {
    this.destroyTerminal()
  },
  methods: {
    initTerminal() {
      this.terminal = new Terminal(this.terminalConfig)
      this.fitAddon = new FitAddon()
      this.terminal.loadAddon(this.fitAddon)
      this.terminal.open(this.$refs.terminal)

      this.$nextTick(() => {
        this.fitAddon.fit()
        this.updateTerminalSize()
      })

      window.addEventListener('resize', this.onResize)
      this.setupTerminalDataHandler()
    },

    setupTerminalDataHandler() {
      this.terminal.onData(data => {
        if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
          // 添加日志查看发送的数据
          console.log('Sending data:', data)
          this.websocket.send(data)
          this.handleTerminalInput(data)
        }
      })
    },

    handleTerminalInput(data) {
      if (data === '\r' || data === '\n') {
        if (this.currentCommand.trim()) {
          this.addToHistory(this.currentCommand.trim())
        }
        this.currentCommand = ''
      } else if (data === '\u007f') { // Backspace
        this.currentCommand = this.currentCommand.slice(0, -1)
      } else {
        this.currentCommand += data
      }
    },

    addToHistory(command) {
      if (!this.historyCommands.includes(command)) {
        this.historyCommands.push(command)
        // 限制历史命令数量
        if (this.historyCommands.length > 50) {
          this.historyCommands.shift()
        }
      }
    },

    updateTerminalSize() {
      const dimensions = this.fitAddon.proposeDimensions()
      if (dimensions) {
        this.terminalConfig.cols = dimensions.cols
        this.terminalConfig.rows = dimensions.rows
        this.terminal.resize(dimensions.cols, dimensions.rows)
      }
    },

    async connectWebSocket() {
      try {
        const params = {
          ip: this.currentIp, // 使用存储的 IP
          port: this.host.sshPort || 22,
          username: this.host.sshUser,
          password: this.host.sshPassword,
          authmodel: this.host.sshAuthType || 'PASSWORD',
          cols: this.terminalConfig.cols,
          rows: this.terminalConfig.rows
        }

        console.log('Connecting with params:', params)
        const wsUrl = await getWebSSHUrl(params)
        this.websocket = new WebSocket(wsUrl)
        this.setupWebSocketHandlers()
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error)
        this.handleConnectionError('连接SSH服务器失败')
      }
    },

    setupWebSocketHandlers() {
      this.websocket.onopen = () => {
        this.isConnected = true
        this.reconnectAttempts = 0
        this.terminal.write('\r\n*** Connected to SSH server ***\r\n')
      }

      this.websocket.onmessage = (event) => {
        this.terminal.write(event.data)
        this.updatePrompt(event.data)
      }

      this.websocket.onerror = (event) => {
        console.error('WebSocket error:', event)
        this.terminal.write('\r\n*** WebSocket error occurred ***\r\n')
        this.tryReconnect()
      }

      this.websocket.onclose = (event) => {
        this.isConnected = false
        this.terminal.write('\r\n*** Connection closed ***\r\n')
        if (event.code !== 1000) {
          this.tryReconnect()
        }
      }
    },

    handleConnectionError(message) {
      this.terminal.write(`\r\n*** ${message} ***\r\n`)
      ElMessage.error(message)
    },

    tryReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        this.terminal.write(
          `\r\n*** Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) ***\r\n`
        )
        // 使用延时确保状态正确
        setTimeout(() => {
          console.log('Reconnecting with IP:', this.currentIp)
          this.connectWebSocket()
        }, 2000)
      } else {
        this.handleConnectionError('重连失败，请检查网络或重新打开终端')
      }
    },

    onResize() {
      if (this.fitAddon) {
        this.fitAddon.fit()
        this.updateTerminalSize()

        if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(JSON.stringify({
            type: 'resize',
            cols: this.terminalConfig.cols,
            rows: this.terminalConfig.rows
          }))
        }
      }
    },

    sendCommand(command) {
      if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
        this.addToHistory(command)
        this.websocket.send(command + '\n')
      }
    },

    updatePrompt(data) {
      this.currentPrompt = data.includes('#') ? '#' : '$'
    },

    destroyTerminal() {
      window.removeEventListener('resize', this.onResize)

      if (this.websocket) {
        this.websocket.close(1000, 'Terminal destroyed')
      }

      if (this.terminal) {
        this.terminal.dispose()
      }

      this.terminal = null
      this.websocket = null
      this.fitAddon = null
      this.isConnected = false
    }
  }
}
</script>

<style lang="scss" scoped>
.ssh-terminal {
  height: 600px;
  background: #1e1e1e;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .terminal-container {
    flex: 1;
    overflow: hidden;
    position: relative;
    border-radius: 4px;

    :deep(.xterm) {
      height: 100%;
      padding: 5px;

      .xterm-viewport {
        overflow-y: auto;
        background-color: inherit;
      }
    }
  }

  .toolbar {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding: 5px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;

    .el-button-group {
      margin-right: 10px;
    }

    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>
