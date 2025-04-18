<template>
  <div>
    <h3>密钥证书管理</h3>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" status-icon label-position="top" label-width="100px">
      <el-alert
        title="警告"
        type="error"
        show-icon
        description="更换证书后需要对使用 SAML2 协议对接的站点手动进行证书替换，在更换过程中会自动对数据库中使用了密钥加密的数据进行更新，为防止意外，请在在更换前请务必手工完成旧证书、密钥和数据库的备份，证书更换完成后务必进行相关功能验证。"
        style="margin-bottom: 10px;"
      />
      <el-alert
        title="重要提示"
        type="warning"
        show-icon
        style="margin-bottom: 10px;"
      >
        <slot name="description">
          证书和密钥将用于数据库敏感信息加密和 SAML2 SP 认证，为避免敏感信息泄露，生产环境强烈建议使用自定义的证书和密钥，建议使用《<a href="https://www.qvdv.net/tools/qvdv-csrpfx.html" target="_blank" style="color: red">在线生成工具</a>》制作自定义证书及密钥。也可以使用命令生成，命令如下：
          <div class="gray-bg1">
            <div>
              创建私钥：openssl genpkey -algorithm RSA -out private.key -pkeyopt rsa_keygen_bits:2048 -outform PEM
            </div>
            <div>
              创建证书：openssl req -new -x509 -key private.key -out certificate.crt -days 3650
            </div>
            <div>
              从证书中提取公钥：openssl rsa -in private.key -pubout -out public.key
            </div>
          </div>
        </slot>
      </el-alert>
      <el-form-item label="证书" prop="certificate">
        <div style="display: flex; align-items: flex-end;">
          <el-input v-model="form.certificate" type="textarea" :rows="7" autocomplete="off" clearable style="width: 660px;padding-right: 10px;" />
          <el-upload
            ref="certUpload"
            class="upload-demo"
            action=""
            accept=".pem,.crt,.cer"
            :multiple="false"
            :limit="1"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleCertificateUpload"
          >
            <el-button slot="trigger" icon="el-icon-upload2" size="mini" type="primary">选取证书</el-button>
          </el-upload>
        </div>
        <div class="help-block" style="color: #999; font-size: 12px">证书文件通常以<span class="gray-bg">-----BEGIN CERTIFICATE-----</span>开头，以<span class="gray-bg">-----END CERTIFICATE-----</span>结尾。</div>
      </el-form-item>
      <el-form-item label="私钥（不能外泄的私有密钥）" prop="privateKey">
        <div style="display: flex; align-items: flex-end;">
          <el-input v-model="form.privateKey" type="textarea" :rows="7" autocomplete="off" clearable style="width: 660px;padding-right: 10px;" />
          <el-upload
            ref="keyUpload"
            class="upload-demo"
            action=""
            accept=".key,.pem"
            :multiple="false"
            :limit="1"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handlePrivateKeyUpload"
          >
            <el-button slot="trigger" icon="el-icon-upload2" size="mini" type="primary">选取私钥</el-button>
          </el-upload>
        </div>
        <div class="help-block" style="color: #999; font-size: 12px">私钥文件通常以<span class="gray-bg">-----BEGIN PRIVATE KEY-----</span>开头，以<span class="gray-bg">-----END PRIVATE KEY-----</span>结尾。</div>
      </el-form-item>
      <el-form-item label="公钥（对外公开的密钥）" prop="publicKey">
        <div style="display: flex; align-items: flex-end;">
          <el-input v-model="form.publicKey" type="textarea" :rows="7" autocomplete="off" clearable style="width: 660px;padding-right: 10px;" />
          <el-upload
            ref="keyUpload"
            class="upload-demo"
            action=""
            accept=".pub,.pem"
            :multiple="false"
            :limit="1"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handlePublicKeyUpload"
          >
            <el-button slot="trigger" icon="el-icon-upload2" size="mini" type="primary">选取公钥</el-button>
          </el-upload>
        </div>
        <div class="help-block" style="color: #999; font-size: 12px">公钥文件通常以<span class="gray-bg">-----BEGIN PUBLIC KEY-----</span>开头，以<span class="gray-bg">-----END PUBLIC KEY-----</span>结尾。</div>
      </el-form-item>
      <el-form-item>
        <div>
          <el-button size="mini" :loading="loading" @click="handleTest">密钥及证书测试</el-button>
          <el-button type="primary" size="mini" @click="handleSubmit">确 定</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { certTest } from '@/api/system/settings'

export default {
  name: 'CertificateForm',
  props: {
    form: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      loading: false,
      rules: {
        certificate: [
          { required: true, message: '请上传证书', trigger: 'change' }
        ],
        publicKey: [
          { required: true, message: '请上传私钥', trigger: 'change' }
        ],
        privateKey: [
          { required: true, message: '请上传公钥', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    /* 密钥测试 */
    handleTest() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true // 开启加载状态
        const { certificate, publicKey, privateKey } = this.form
        certTest({ certificate: certificate, publicKey: publicKey, privateKey: privateKey }).then(res => {
          if (res.code === 0) {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1000
            })
          }
        }).catch(res => {}).finally(() => {
          this.loading = false
        })
      })
    },

    /* 读取证书文件 */
    handleCertificateUpload(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.form.certificate = e.target.result.trim()
      }
      reader.readAsText(file.raw)
      this.$refs.certUpload.clearFiles()
      return false
    },

    /* 读取私钥文件 */
    handlePrivateKeyUpload(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.form.privateKey = e.target.result.trim()
      }
      reader.readAsText(file.raw)
      this.$refs.keyUpload.clearFiles()
      return false
    },

    /* 读取公钥文件 */
    handlePublicKeyUpload(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.form.publicKey = e.target.result.trim()
      }
      reader.readAsText(file.raw)
      this.$refs.keyUpload.clearFiles()
      return false
    },

    /* 提交表单 */
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const { certificate, publicKey, privateKey } = this.form
        this.$emit('sub', { certificate: certificate, publicKey: publicKey, privateKey: privateKey }, (result) => {})
      })
    }
  }
}
</script>
<style scoped>
.help-block {
  margin-top: 4px;
  margin-bottom: 4px;
  line-height: 1.5;
}
.gray-bg1 {
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 4px;
  margin: 2px;
}
.gray-bg {
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 0 2px;
  margin: 2px;
}
</style>
