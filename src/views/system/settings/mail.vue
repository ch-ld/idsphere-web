<template>
  <div>
    <h3>发件服务器</h3>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" status-icon label-position="top" label-width="100px">
      <el-form-item label="SMTP 服务器地址" prop="mailAddress">
        <el-input v-model="form.mailAddress" autocomplete="off" size="small" clearable style="width: 600px" />
      </el-form-item>
      <el-form-item label="SMTP 端口" prop="mailPort">
        <el-input v-model="form.mailPort" autocomplete="off" size="small" clearable style="width: 600px" />
        <div class="help-block" style="color: #999; font-size: 12px">默认端口号为 25，如果使用 SSL 通讯则为 465，如果使用 TLS 通讯则为 587。</div>
      </el-form-item>
      <el-form-item label="发件邮箱账号" prop="mailForm">
        <el-input v-model="form.mailForm" autocomplete="off" size="small" clearable style="width: 600px" />
      </el-form-item>
      <el-form-item label="发件邮箱密码" prop="mailPassword">
        <el-input v-if="showPassword" v-model="form.mailPassword" type="password" show-password autocomplete="off" size="small" clearable style="width: 600px" />
        <el-button v-else type="primary" size="mini" @click="handlePasswordUpdate">点击设置密码</el-button>
      </el-form-item>
      <el-form-item>
        <div>
          <el-button size="mini" @click="handleTest">发件邮件测试</el-button>
          <el-button type="primary" size="mini" @click="handleSubmit">确 定</el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 发件测试 -->
    <el-dialog
      v-if="testDialog"
      :title="formTitle"
      :visible.sync="testDialog"
      :show-close="false"
      width="500px"
      :close-on-click-modal="false"
      @closed="handleClose"
    >
      <!-- 表单组件 -->
      <mail-test-form
        ref="form"
        :form="currentValue"
        @close="handleClose"
      />
    </el-dialog>
  </div>
</template>
<script>
import MailTestForm from './mail-test'

export default {
  name: 'MailForm',
  components: {
    MailTestForm
  },
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
      testDialog: false,
      formTitle: '',
      currentValue: undefined,
      showPassword: false,
      rules: {
        mailAddress: [
          { required: true, message: '请输入SMTP 地址', trigger: 'change' }
        ],
        mailPort: [
          { required: true, message: '请输入SMTP 端口', trigger: 'change' }
        ],
        mailForm: [
          { required: true, message: '请输入发件邮箱地址', trigger: 'change' }
        ],
        mailPassword: [
          { required: false, message: '请输入发件邮箱密码', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    'showPassword'(val) {
      if (val) {
        this.rules.mailPassword[0].required = true
      } else {
        this.rules.mailPassword[0].required = false
        this.$refs.form.clearValidate()
      }
    }
  },
  methods: {

    /* 发件测试 */
    handleTest() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formTitle = '发件测试'
        this.testDialog = true
      })
    },

    /* 更新密码按钮 */
    handlePasswordUpdate() {
      this.showPassword = true
    },

    /* 提交表单 */
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const { mailAddress, mailForm, mailPort, mailPassword } = this.form
        const data = {
          mailAddress: mailAddress,
          mailForm: mailForm,
          mailPort: String(mailPort)
        }
        if (mailPassword) {
          data.mailPassword = mailPassword
        }
        this.$emit('submit', data, (result) => {
          if (result.code === 0) {
            this.showPassword = false
          }
        })
      })
    },

    /* 关闭表单 */
    handleClose() {
      this.testDialog = false
      this.currentValue = undefined
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
</style>
