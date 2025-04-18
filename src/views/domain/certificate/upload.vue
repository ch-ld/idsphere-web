<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" size="small" label-position="right" label-width="120px" style="width: 95%;padding-top: 20px;">
      <el-form-item label="证书类型：" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :label="1">DV 证书</el-radio>
          <el-radio :label="2">OV 证书</el-radio>
          <el-radio :label="3">EV 证书</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="服务器类型：" prop="server_type">
        <el-select v-model="form.server_type" placeholder="请选择服务器类型" clearable style="width: 500px;padding-right: 10px;">
          <el-option v-for="item in server" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="证书" prop="certificate">
        <div style="display: flex; align-items: flex-end;">
          <el-input v-model="form.certificate" type="textarea" :rows="5" placeholder="请将证书内容粘贴在此或通过文件上传，注意删除首尾空行" autocomplete="off" clearable style="width: 500px;padding-right: 10px;" />
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
            <el-button slot="trigger" icon="el-icon-upload2" size="mini" type="primary">选取文件</el-button>
          </el-upload>
        </div>
        <div class="help-block" style="color: #999; font-size: 12px">证书文件通常以<span class="gray-bg">-----BEGIN CERTIFICATE-----</span>开头，以<span class="gray-bg">-----END CERTIFICATE-----</span>结尾</div>
      </el-form-item>
      <el-form-item label="私钥" prop="private_key">
        <div style="display: flex; align-items: flex-end;">
          <el-input v-model="form.private_key" type="textarea" :rows="5" placeholder="请将私钥内容粘贴在此或通过文件上传，注意删除首尾空行" autocomplete="off" clearable style="width: 500px;padding-right: 10px;" />
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
            <el-button slot="trigger" icon="el-icon-upload2" size="mini" type="primary">选取文件</el-button>
          </el-upload>
        </div>
        <div class="help-block" style="color: #999; font-size: 12px">私钥文件通常以<span class="gray-bg">-----BEGIN PRIVATE KEY-----</span>开头，以<span class="gray-bg">-----END PRIVATE KEY-----</span>结尾</div>
      </el-form-item>
      <el-form-item>
        <div>
          <el-button size="mini" @click="cancel">取 消</el-button>
          <el-button type="primary" size="mini" :loading="loading" @click="handleSubmit">确 定</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'CertificateUploadForm',
  props: {
    form: {
      type: Object,
      default() {
        return {
          certificate: '',
          private_key: '',
          type: 1,
          server_type: 1
        }
      }
    },
    loading: {
      type: Boolean
    }
  },
  data() {
    return {
      server: [{
        value: 1,
        label: 'NGINX'
      }],
      rules: {
        certificate: [
          { required: true, message: '请上传证书', trigger: 'change' }
        ],
        private_key: [
          { required: true, message: '请上传私钥', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择证书类型', trigger: 'change' }
        ],
        server_type: [
          { required: true, message: '请选择服务器类型', trigger: 'change' }
        ]
      }
    }
  },
  methods: {

    /* 提交表单 */
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.$emit('submit', this.form)
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
        this.form.private_key = e.target.result.trim()
      }
      reader.readAsText(file.raw)
      this.$refs.keyUpload.clearFiles()
      return false
    },

    /* 关闭表单 */
    cancel() {
      this.$emit('close')
    }
  }
}
</script>
