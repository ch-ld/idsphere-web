<template>
  <div class="ssh-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">SSH终端管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>运维工具</el-breadcrumb-item>
        <el-breadcrumb-item>SSH终端</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 搜索和过滤区域 -->
    <el-card class="search-card">
      <el-form ref="searchForm" :inline="true" :model="searchForm">
        <el-form-item label="主机组">
          <el-select v-model="searchForm.hostGroupId" placeholder="请选择主机组" clearable>
            <el-option
              v-for="group in hostGroups"
              :key="group.ID"
              :label="group.name"
              :value="group.ID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="主机名/IP"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="主机状态" clearable>
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="未知" value="unknown" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主机列表 -->
    <el-card class="table-card">
      <div slot="header" class="clearfix">
        <span class="card-title">SSH主机列表</span>
        <el-button-group style="float: right">
          <el-button
            size="small"
            type="success"
            icon="el-icon-plus"
            @click="handleNewTerminal"
          >
            新建终端
          </el-button>
          <!-- 新增批量执行命令按钮 -->
          <el-button
            size="small"
            type="warning"
            icon="el-icon-video-play"
            :disabled="!selectedHosts.length"
            @click="handleBatchCommand"
          >
            批量执行命令({{ selectedHosts.length }})
          </el-button>
          <el-button
            size="small"
            type="primary"
            icon="el-icon-refresh"
            @click="fetchHosts"
          >
            刷新
          </el-button>
        </el-button-group>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        @selection-change="handleSelectionChange"
      >
        <!-- 添加多选列 -->
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column label="主机名" prop="hostname" min-width="120">
          <template slot-scope="{ row }">
            <el-link type="primary" @click="handleOpenTerminal(row)">
              {{ row.hostname }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="IP地址" min-width="200">
          <template slot-scope="{ row }">
            <div class="ip-info">
              <div v-if="row.privateIp" class="ip-item">
                <i class="el-icon-office-building" />
                <span class="ip-text">{{ row.privateIp }}</span>
              </div>
              <div v-if="row.publicIp" class="ip-item">
                <i class="el-icon-connection" />
                <span class="ip-text">{{ row.publicIp }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="SSH信息" min-width="180">
          <template slot-scope="{ row }">
            <el-tag size="small">端口: {{ row.sshPort }}</el-tag>
            <el-tag size="small" type="success">用户: {{ row.sshUser }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="主机组" min-width="100">
          <template slot-scope="{ row }">
            {{ formatHostGroupName(row) }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="400" fixed="right">
          <template slot-scope="{ row }">
            <el-button-group>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-terminal"
                @click="handleOpenTerminal(row)"
              >
                终端
              </el-button>
              <el-button
                size="mini"
                type="success"
                icon="el-icon-video-play"
                @click="handleCommand(row)"
              >
                命令
              </el-button>
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-document"
                @click="handleFile(row)"
              >
                SFTP
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 批量执行命令对话框 -->
    <el-dialog
      title="批量执行命令"
      :visible.sync="batchCmdVisible"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-form :model="batchCmdForm" label-width="80px">
        <el-form-item label="目标主机">
          <div class="selected-hosts">
            <el-tag
              v-for="host in selectedHosts"
              :key="host.id"
              size="small"
              closable
              @close="removeSelectedHost(host)"
            >
              {{ host.hostname }}
              <span class="host-ip">({{ host.privateIp || host.publicIp }})</span>
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="命令">
          <el-input
            v-model="batchCmdForm.command"
            type="textarea"
            :rows="3"
            placeholder="请输入要执行的命令"
            @keyup.ctrl.enter.native="submitBatchCommand"
          />
          <div class="form-tip">提示：按 Ctrl + Enter 快捷执行</div>
        </el-form-item>

        <!-- 批量执行结果显示区域 -->
        <el-form-item v-if="batchCmdResults.length" label="执行结果">
          <div class="batch-results">
            <div
              v-for="result in batchCmdResults"
              :key="result.hostId"
              class="batch-result-item"
            >
              <div class="result-header">
                <span class="host-info">
                  {{ result.hostname }}
                  <span class="host-ip">({{ result.ip }})</span>
                </span>
                <span :class="['status-dot', result.success ? 'success' : 'error']" />
                <span class="status-text">{{ result.success ? '执行成功' : '执行失败' }}</span>
              </div>
              <pre class="result-content" v-html="formatResult(result.output)" />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="handleCloseBatchCmdDialog">关 闭</el-button>
        <el-button
          type="primary"
          :loading="batchCmdLoading"
          @click="submitBatchCommand"
        >
          执 行
        </el-button>
      </div>
    </el-dialog>

    <!-- SSH终端对话框 -->
    <el-dialog
      title="SSH终端"
      :visible.sync="terminalVisible"
      width="85%"
      :before-close="handleCloseTerminal"
      custom-class="ssh-terminal-dialog"
      top="5vh"
    >
      <div class="terminal-header">
        <span class="terminal-title">
          <i class="el-icon-monitor" />
          {{ currentHost ? currentHost.hostname : '' }}
          <el-tag size="small" type="success" style="margin-left: 10px">
            {{ currentHost ? getDisplayIp(currentHost) : '' }}
          </el-tag>
        </span>
      </div>
      <ssh-terminal
        v-if="terminalVisible && currentHost"
        :host="currentHost"
        :selected-type="selectedType"
        :websocket-url="getWebSocketUrl(currentHost)"
        @close="handleCloseTerminal"
        @connection-status="handleConnectionStatus"
      />
    </el-dialog>

    <!-- 新建终端对话框 -->
    <el-dialog
      title="新建终端连接"
      :visible.sync="newTerminalVisible"
      width="500px"
      @close="resetNewTerminalForm"
    >
      <el-form
        ref="newTerminalForm"
        :model="newTerminalForm"
        :rules="newTerminalRules"
        label-width="100px"
      >
        <el-form-item label="主机地址" prop="host">
          <el-input v-model="newTerminalForm.host" placeholder="请输入主机IP或域名" />
        </el-form-item>
        <el-form-item label="SSH端口" prop="port">
          <el-input-number
            v-model="newTerminalForm.port"
            :min="1"
            :max="65535"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newTerminalForm.username" placeholder="请输入SSH用户名" />
        </el-form-item>
        <el-form-item label="认证方式" prop="authType">
          <el-radio-group v-model="newTerminalForm.authType">
            <el-radio label="password">密码认证</el-radio>
            <el-radio label="key">密钥认证</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="newTerminalForm.authType === 'password'"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="newTerminalForm.password"
            type="password"
            show-password
            placeholder="请输入SSH密码"
          />
        </el-form-item>
        <el-form-item
          v-if="newTerminalForm.authType === 'key'"
          label="私钥"
          prop="privateKey"
        >
          <el-input
            v-model="newTerminalForm.privateKey"
            type="textarea"
            :rows="4"
            placeholder="请输入SSH私钥内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="newTerminalVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="connecting"
          @click="handleNewTerminalSubmit"
        >
          连 接
        </el-button>
      </div>
    </el-dialog>

    <!-- 命令执行对话框 -->
    <el-dialog
      title="执行命令"
      :visible.sync="cmdVisible"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form :model="cmdForm" label-width="80px">
        <el-form-item label="目标主机">
          <el-tag>{{ currentHost ? currentHost.hostname : '' }}</el-tag>
          <el-tag type="info" style="margin-left: 10px">
            {{ currentHost ? (currentHost.privateIp || currentHost.publicIp) : '' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="命令">
          <el-input
            v-model="cmdForm.command"
            type="textarea"
            :rows="3"
            placeholder="请输入要执行的命令"
            @keyup.ctrl.enter.native="submitCommand"
          />
          <div class="form-tip">提示：按 Ctrl + Enter 快捷执行</div>
        </el-form-item>

        <!-- 新增：命令执行结果显示区域 -->
        <el-form-item v-if="cmdResult" label="执行结果">
          <div class="cmd-result-container">
            <div class="cmd-result-header">
              <span :class="['status-dot', cmdSuccess ? 'success' : 'error']" />
              <span class="status-text">{{ cmdSuccess ? '执行成功' : '执行失败' }}</span>
              <el-button
                type="text"
                size="small"
                icon="el-icon-copy-document"
                @click="copyResult"
              >
                复制结果
              </el-button>
            </div>
            <pre class="cmd-result-content" v-html="formatResult(cmdResult)" />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="handleCloseCmdDialog">关 闭</el-button>
        <el-button
          type="primary"
          :loading="cmdLoading"
          @click="submitCommand"
        >
          执 行
        </el-button>
      </div>
    </el-dialog>
    <!-- IP选择对话框 -->
    <el-dialog
      title="选择连接方式"
      :visible.sync="ipSelectVisible"
      width="400px"
      :close-on-click-modal="false"
      @close="handleIpDialogClose"
    >
      <div v-if="currentHost" class="ip-select-content">
        <div class="host-info mb-4">
          <span class="host-name">{{ currentHost.hostname }}</span>
        </div>
        <el-radio-group v-model="selectedType" class="ip-options">
          <el-radio
            v-if="currentHost.privateIp"
            label="private"
            class="ip-option"
          >
            <div class="ip-detail">
              <i class="el-icon-office-building" />
              <span>内网IP: {{ currentHost.privateIp }}</span>
              <el-tag size="mini" type="success">推荐</el-tag>
            </div>
          </el-radio>
          <el-radio
            v-if="currentHost.publicIp"
            label="public"
            class="ip-option"
          >
            <div class="ip-detail">
              <i class="el-icon-connection" />
              <span>公网IP: {{ currentHost.publicIp }}</span>
            </div>
          </el-radio>
        </el-radio-group>
      </div>
      <div slot="footer">
        <el-button @click="handleIpDialogClose">取 消</el-button>
        <el-button type="primary" @click="handleIpConfirm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- SFTP文件管理对话框 -->
    <el-dialog
      title="SFTP文件管理"
      :visible.sync="sftpVisible"
      width="80%"
      :before-close="handleCloseSftp"
      custom-class="sftp-dialog"
      top="5vh"
    >
      <div class="sftp-header">
        <span class="sftp-title">
          <i class="el-icon-folder" />
          {{ currentHost ? currentHost.hostname : '' }}
          <el-tag size="small" type="success" style="margin-left: 10px">
            {{ currentHost ? getDisplayIp(currentHost) : '' }}
          </el-tag>
        </span>
      </div>
      <sftp-manager
        v-if="sftpVisible && currentHost"
        :host="currentHost"
        @close="handleCloseSftp"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getHosts } from '@/api/host/host/host'
import { getHostGroups } from '@/api/host/hostGroup/hostGroup'
import { executeCommand, getWebSSHUrl } from '@/api/host/ssh/ssh'
import SshTerminal from './components/Terminal'
import SftpManager from './components/SftpManager.vue'

export default {
  name: 'SshManager',
  components: {
    SshTerminal,
    SftpManager
  },
  data() {
    return {
      selectedType: 'private',
      ipSelectVisible: false,
      selectedIp: '',
      actionType: '', // 'terminal' 或 'sftp'
      selectedHosts: [], // 选中的主机列表
      batchCmdVisible: false, // 批量命令对话框显示状态
      batchCmdLoading: false, // 批量命令执行loading状态
      batchCmdForm: {
        command: ''
      },
      batchCmdResults: [], // 批量命令执行结果
      // 主机组相关
      hostGroups: [],
      hostGroupsLoading: false,
      hostGroupsQuery: {
        page: 1,
        limit: 100 // 获取较多的主机组数据用于选择
      },
      // 搜索表单
      searchForm: {
        hostGroupId: '',
        keyword: '',
        status: ''
      },
      // 表格数据
      loading: false,
      tableData: [],
      page: 1,
      pageSize: 10,
      total: 0,

      sftpVisible: false,

      // 终端相关
      terminalVisible: false,
      currentHost: null,
      connecting: false,

      // 新建终端相关
      newTerminalVisible: false,
      newTerminalForm: {
        host: '',
        port: 22,
        username: 'root',
        authType: 'password',
        password: '',
        privateKey: ''
      },
      newTerminalRules: {
        host: [
          { required: true, message: '请输入主机地址', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '请输入SSH端口', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        privateKey: [
          { required: true, message: '请输入私钥', trigger: 'blur' }
        ]
      },

      // 命令执行相关
      cmdVisible: false,
      cmdLoading: false,
      cmdForm: {
        command: ''
      },
      cmdResult: '', // 新增：存储命令执行结果
      cmdSuccess: true // 新增：命令执行状态

    }
  },
  // 在组件中添加监听器
  watch: {
    selectedType: {
      handler(newVal) {
        console.log('selectedType changed:', newVal)
      },
      immediate: true
    },
    currentHost: {
      handler(newVal) {
        console.log('currentHost changed:', newVal)
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.fetchHostGroups()
    this.fetchHosts()
  },
  beforeDestroy() {
  // 清理状态
    this.currentHost = null
    this.selectedType = null
    this.terminalVisible = false
    this.ipSelectVisible = false
  },
  methods: {
    handleConnectionStatus(status) {
      console.log('SSH连接状态:', status)
    },
    // 构建 WebSocket 连接参数
    getWebSocketParams() {
      // 确保所有必要参数都存在
      const params = {
        ip: this.selectedIp,
        port: this.currentHost?.port || 22,
        username: this.currentHost?.username,
        // 其他必要参数
        id: this.currentHost?.id,
        hostname: this.currentHost?.hostname,
        cols: 102, // 终端列数
        rows: 32 // 终端行数
      }

      console.log('WebSocket params before connection:', params)
      return params
    },
    // 1. 修改 handleIpConfirm 方法
    handleIpConfirm() {
      if (!this.currentHost) return

      // 根据选择类型设置 IP
      const selectedIp = this.selectedType === 'public'
        ? this.currentHost.publicIp
        : this.currentHost.privateIp

      // 更新当前主机信息
      this.currentHost = {
        ...this.currentHost,
        selectedIp: selectedIp
      }

      // 保存选择的 IP 类型
      this.selectedIp = selectedIp

      if (this.actionType === 'terminal') {
        this.terminalVisible = true
      } else if (this.actionType === 'sftp') {
        this.sftpVisible = true
      }
      this.ipSelectVisible = false
    },

    handleOpenTerminal(row) {
      if (!row) return

      console.log('handleOpenTerminal called with:', row)

      // 重置状态
      this.terminalVisible = false

      const host = { ...row }

      if (host.privateIp && host.publicIp) {
        // 双IP情况
        this.currentHost = host
        this.selectedType = 'private' // 默认使用内网IP
        this.actionType = 'terminal'
        this.ipSelectVisible = true

        console.log('Opening IP selection dialog:', {
          selectedType: this.selectedType,
          currentHost: this.currentHost
        })
      } else {
        // 单IP情况
        const ipType = host.privateIp ? 'private' : 'public'
        const selectedIp = host.privateIp || host.publicIp

        this.selectedType = ipType
        this.currentHost = {
          ...host,
          selectedIp: selectedIp
        }

        console.log('Direct terminal opening:', {
          selectedType: this.selectedType,
          selectedIp: selectedIp
        })

        this.terminalVisible = true
      }
    },
    handleIpDialogClose() {
      this.ipSelectVisible = false
      if (!this.terminalVisible && !this.sftpVisible) {
        this.currentHost = null
        this.actionType = ''
        this.selectedIp = '' // 重置选择的 IP
      }
    },
    handleFile(row) {
      if (!row) return

      const host = { ...row }
      if (host.privateIp && host.publicIp) {
        this.currentHost = host
        this.actionType = 'sftp'
        this.selectedType = 'private' // 默认选择内网IP
        this.ipSelectVisible = true
      } else {
        // 如果只有一个IP，自动判断使用哪个
        const ipType = host.privateIp ? 'private' : 'public'
        const selectedIp = host.privateIp || host.publicIp

        this.currentHost = {
          ...host,
          selectedIp: selectedIp,
          ipType: ipType
        }
        this.selectedType = ipType // 设置选择类型
        this.sftpVisible = true
      }
    },
    // 处理表格多选
    handleSelectionChange(selection) {
      this.selectedHosts = selection
    },
    // 打开批量执行命令对话框
    handleBatchCommand() {
      if (!this.selectedHosts.length) {
        this.$message.warning('请先选择要执行命令的主机')
        return
      }
      this.batchCmdVisible = true
      this.batchCmdResults = []
    },

    // 移除选中的主机
    removeSelectedHost(host) {
      this.$refs.table.toggleRowSelection(host, false)
    },

    // 关闭批量命令对话框
    handleCloseBatchCmdDialog() {
      this.batchCmdVisible = false
      this.batchCmdForm.command = ''
      this.batchCmdResults = []
    },
    // 提交批量命令
    async submitBatchCommand() {
      if (!this.batchCmdForm.command) {
        this.$message.error('请输入要执行的命令')
        return
      }
      this.batchCmdLoading = true
      this.batchCmdResults = []
      try {
      // 并行执行命令
        const promises = this.selectedHosts.map(host =>
          executeCommand({
            hostId: host.id,
            command: this.batchCmdForm.command
          }).then(response => ({
            hostId: host.id,
            hostname: host.hostname,
            ip: host.privateIp || host.publicIp,
            success: true,
            output: response.data
          })).catch(error => ({
            hostId: host.id,
            hostname: host.hostname,
            ip: host.privateIp || host.publicIp,
            success: false,
            output: error.message
          }))
        )
        this.batchCmdResults = await Promise.all(promises)
        // 统计成功和失败数量
        const successCount = this.batchCmdResults.filter(r => r.success).length
        const failCount = this.batchCmdResults.length - successCount

        if (failCount === 0) {
          this.$message.success(`命令在 ${successCount} 台主机上执行成功`)
        } else {
          this.$message.warning(`命令执行完成: ${successCount} 台成功, ${failCount} 台失败`)
        }
      } finally {
        this.batchCmdLoading = false
      }
    },

    // 处理 IP 选择结果
    handleIpSelected(ipInfo) {
      if (!this.currentHost) return

      // 创建新的主机对象，保留原有信息并更新 IP
      this.currentHost = {
        ...this.currentHost,
        selectedIp: ipInfo.ip,
        ipType: ipInfo.type
      }

      // 根据动作类型打开相应的功能
      if (this.actionType === 'terminal') {
        this.terminalVisible = true
        this.ipSelectVisible = false
      } else if (this.actionType === 'sftp') {
        this.sftpVisible = true
        this.ipSelectVisible = false
      }
    },

    // 关闭SFTP管理器
    handleCloseSftp() {
      this.sftpVisible = false
      this.currentHost = null
      this.actionType = ''
    },
    // 格式化命令执行结果
    formatResult(result) {
      if (!result) return ''
      // 将 <br> 转换为换行符，同时处理其他可能的 HTML 转义字符
      return result
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
    },

    // 复制结果到剪贴板
    copyResult() {
      const text = this.formatResult(this.cmdResult)
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('已复制到剪贴板')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    },

    // 关闭命令对话框
    handleCloseCmdDialog() {
      this.cmdVisible = false
      this.cmdForm.command = ''
      this.cmdResult = ''
      this.cmdSuccess = true
    },

    // 提交命令
    async submitCommand() {
      if (!this.cmdForm.command) {
        this.$message.error('请输入要执行的命令')
        return
      }

      this.cmdLoading = true
      try {
        const { data } = await executeCommand({
          hostId: this.currentHost.id,
          command: this.cmdForm.command
        })

        // 更新命令执行结果
        this.cmdSuccess = true
        this.cmdResult = data
        this.$message.success('命令执行成功')
      } catch (error) {
        this.cmdSuccess = false
        this.cmdResult = error.message || '命令执行失败'
        this.$message.error('命令执行失败')
      } finally {
        this.cmdLoading = false
      }
    },

    // 2. 修改 getWebSocketUrl 方法
    getWebSocketUrl(host) {
      if (!host) return ''

      // 确保每次都基于当前的 selectedType 获取正确的 IP
      const ip = this.selectedType === 'public' ? host.publicIp : host.privateIp

      console.log('getWebSocketUrl called:', {
        selectedType: this.selectedType,
        chosenIp: ip,
        host: host
      })

      const params = {
        ip,
        port: host.sshPort,
        username: host.sshUser,
        password: host.sshPassword,
        authmodel: 'password',
        cols: 102,
        rows: 32
      }

      return getWebSSHUrl(params)
    },
    // 修改终端和SFTP的显示IP
    getDisplayIp(host) {
      return host.selectedIp || host.privateIp || host.publicIp
    },
    // 获取主机组列表
    async fetchHostGroups() {
      try {
        const { data } = await getHostGroups(this.hostGroupsQuery)
        this.hostGroups = data || []
      } catch (error) {
        this.$message.error('获取主机组失败')
      }
    },

    // 获取主机列表
    async fetchHosts() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          page: this.page,
          pageSize: this.pageSize
        }
        const { data } = await getHosts(params)
        this.tableData = data.list || []
        this.total = data.total || 0
      } catch (error) {
        this.$message.error('获取主机列表失败')
      } finally {
        this.loading = false
      }
    },

    // 格式化主机组名称
    formatHostGroupName(row) {
      if (!row.hostGroupId) return '-'
      const group = this.hostGroups.find(g => g.ID === row.hostGroupId)
      return group ? group.name : '-'
    },

    // 处理搜索
    handleSearch() {
      this.page = 1
      this.fetchHosts()
    },

    // 重置搜索
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.handleSearch()
    },

    // 处理分页
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchHosts()
    },
    handleCurrentChange(val) {
      this.page = val
      this.fetchHosts()
    },

    // 新建终端相关方法
    handleNewTerminal() {
      this.newTerminalVisible = true
    },
    resetNewTerminalForm() {
      if (this.$refs.newTerminalForm) {
        this.$refs.newTerminalForm.resetFields()
      }
      this.newTerminalForm = {
        host: '',
        port: 22,
        username: 'root',
        authType: 'password',
        password: '',
        privateKey: ''
      }
    },
    async handleNewTerminalSubmit() {
      this.$refs.newTerminalForm.validate(async valid => {
        if (!valid) return

        this.connecting = true
        try {
          // 创建新的终端连接
          this.currentHost = {
            hostname: this.newTerminalForm.host,
            sshPort: this.newTerminalForm.port,
            sshUser: this.newTerminalForm.username,
            sshPassword: this.newTerminalForm.password,
            sshKey: this.newTerminalForm.privateKey
          }
          this.newTerminalVisible = false
          this.terminalVisible = true
        } catch (error) {
          this.$message.error('连接失败: ' + error.message)
        } finally {
          this.connecting = false
        }
      })
    },

    handleCloseTerminal() {
      this.terminalVisible = false
      this.currentHost = null
      this.actionType = '' // 重置选择的IP
    },

    // 命令执行相关方法
    handleCommand(row) {
      this.currentHost = row
      this.cmdVisible = true
    },

    // 工具方法
    getStatusType(status) {
      const map = {
        online: 'success',
        offline: 'danger',
        unknown: 'info'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        online: '在线',
        offline: '离线',
        unknown: '未知'
      }
      return map[status] || '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.selected-hosts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .el-tag {
    display: flex;
    align-items: center;

    .host-ip {
      margin-left: 4px;
      color: #909399;
    }
  }
}
.batch-results {
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  .batch-result-item {
    &:not(:last-child) {
      border-bottom: 1px solid #dcdfe6;
    }

    .result-header {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background-color: #f5f7fa;

      .host-info {
        flex: 1;
        font-weight: 500;

        .host-ip {
          color: #909399;
          margin-left: 4px;
        }
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;

        &.success {
          background-color: #67c23a;
        }

        &.error {
          background-color: #f56c6c;
        }
      }

      .status-text {
        font-size: 14px;
        color: #606266;
      }
    }
  }
    .result-content {
      margin: 0;
      padding: 12px;
      background-color: #fafafa;
      color: #606266;
      font-family: Menlo, Monaco, Consolas, Courier New, monospace;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
    }
  }
.ssh-manager {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .page-title {
      margin: 0 0 10px;
      font-size: 20px;
      font-weight: 500;
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .ip-info {
      .ip-item {
        display: flex;
        align-items: center;
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        i {
          margin-right: 8px;
          font-size: 14px;
          color: #909399;
        }

        .ip-text {
          color: #606266;
        }
      }
    }
  }

  .terminal-header {
    padding: 10px;
    background: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
    margin-bottom: 10px;

    .terminal-title {
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }

  .ssh-terminal-dialog {
    .el-dialog__body {
      padding: 0;
    }
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .cmd-result-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    .cmd-result-header {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #dcdfe6;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;

        &.success {
          background-color: #67c23a;
        }

        &.error {
          background-color: #f56c6c;
        }
      }

      .status-text {
        flex: 1;
        font-size: 14px;
        color: #606266;
      }
    }

    .cmd-result-content {
      margin: 0;
      padding: 12px;
      background-color: #fafafa;
      color: #606266;
      font-family: Menlo, Monaco, Consolas, Courier New, monospace;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 300px;
      overflow-y: auto;
    }
  }
}
.sftp-dialog {
  // 保持对话框body无内边距
  .el-dialog__body {
    padding: 0;
  }

  // 添加响应式设计
  @media screen and (max-width: 768px) {
    .el-dialog {
      width: 95% !important;
      margin: 10px auto !important;
    }
  }
}

.sftp-header {
  padding: 12px 16px; // 稍微增加内边距提升视觉体验
  background: var(--el-bg-color-page, #f5f7fa); // 使用 Element Plus 变量
  border-bottom: 1px solid var(--el-border-color-light, #dcdfe6);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between; // 为可能的右侧操作预留空间

  .sftp-title {
    display: flex;
    align-items: center;
    gap: 8px; // 使用 gap 替代 margin-right
    font-weight: 500; // 标题稍微加粗
    color: var(--el-text-color-primary, #303133);

    i {
      font-size: 16px;
      color: var(--el-text-color-secondary, #909399);

      // 添加过渡效果
      transition: color 0.3s ease;

      &:hover {
        color: var(--el-text-color-primary, #303133);
      }
    }
  }

  // 添加操作区域样式
  .sftp-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
.ip-select-content {
  padding: 10px;

  .host-info {
    margin-bottom: 20px;
    text-align: center;

    .host-name {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .ip-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .ip-option {
    width: 100%;
    margin: 0;
    padding: 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }

  .ip-detail {
    display: flex;
    align-items: center;
    gap: 10px;

    i {
      font-size: 18px;
      color: #909399;
    }
  }
}
</style>

