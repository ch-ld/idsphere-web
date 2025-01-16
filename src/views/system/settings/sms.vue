<template>
  <div>
    <h3>短信配置</h3>
    <el-alert
      title="重要提示"
      type="warning"
      show-icon
      style="margin-bottom: 10px;"
    >
      <slot name="description">
        <div>IDSphere 平台短信功能在用户重置密码和获取敏感数据时使用，是可选的，推荐短信模板如下：</div>
        <div>华为云：您的验证码为：${1}，验证码在5分钟内有效，请勿泄漏他人！</div>
        <div>阿里云：您的验证码为：${code}，验证码在5分钟内有效，请勿泄漏他人！</div>
      </slot>
    </el-alert>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" status-icon label-position="top" label-width="100px">
      <el-form-item label="短信提供商" prop="smsProvider">
        <el-radio-group v-model="form.smsProvider">
          <el-radio label="huawei">华为云</el-radio>
          <el-radio label="aliyun">阿里云</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="短信签名" prop="smsSignature">
            <el-input v-model="form.smsSignature" autocomplete="off" size="small" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="接入地址" prop="smsEndpoint">
            <el-input v-model="form.smsEndpoint" autocomplete="off" size="small" clearable />
            <div class="help-block" style="color: #999; font-size: 12px">华为云参考《<a href="https://support.huaweicloud.com/api-msgsms/sms_05_0000.html#section1" target="_blank" style="color: #66b1ff">API 请求地址</a>》配置，阿里云参考《<a href="https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-endpoint" target="_blank" style="color: #66b1ff">短信服务接入点</a>》配置。</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="通道号" prop="smsSender">
            <el-input v-model="form.smsSender" autocomplete="off" size="small" clearable />
            <div class="help-block" style="color: #999; font-size: 12px">当短信提供商为华为云时此项需要配置。</div>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="模板 ID" prop="smsTemplateId">
            <el-input v-model="form.smsTemplateId" autocomplete="off" size="small" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="App Key（AccessKey ID）" prop="smsAppKey">
            <el-input v-model="form.smsAppKey" autocomplete="off" size="small" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="App Secret（AccessKey Secret）" prop="smsAppSecret">
            <el-input v-if="showPassword" v-model="form.smsAppSecret" type="password" show-password autocomplete="off" size="small" clearable />
            <el-button v-else type="primary" size="mini" @click="handlePasswordUpdate">点击设置 AppSecret</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="回调地址" prop="smsCallbackUrl">
        <el-input v-model="form.smsCallbackUrl" autocomplete="off" size="small" clearable />
        <div class="help-block" style="color: #999; font-size: 12px">用于接收短信发送状态，当短信提供商为华为云时此项需要配置，API 接口路径为：/api/v1/sms/huawei/callback，点击《<el-link :underline="false" style="color: #66b1ff" @click="getCallbackUrl()">获取完整回调地址</el-link>》。</div>
      </el-form-item>
      <el-form-item>
        <div>
          <el-button size="mini" @click="handleTest">发送短信测试</el-button>
          <el-button type="primary" size="mini" @click="handleSubmit">确 定</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { Message } from 'element-ui'
import { sendSms } from '@/api/system/settings'

export default {
  name: 'SmsForm',
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
      baseUrl() {
        const port = window.location.port ? `:${window.location.port}` : ''
        return `${window.location.protocol}//${window.location.hostname}${port}`
      },
      showPassword: false,
      rules: {
        smsProvider: [
          { required: true, message: '请选择短信提供商', trigger: 'change' }
        ],
        smsSignature: [
          { required: true, message: '请输入短信签名', trigger: 'change' }
        ],
        smsEndpoint: [
          { required: true, message: '请输入短信接口地址', trigger: 'change' }
        ],
        smsSender: [
          { required: true, message: '请输入短信通道号', trigger: 'change' }
        ],
        smsTemplateId: [
          { required: true, message: '请输入短信模板 ID', trigger: 'change' }
        ],
        smsAppKey: [
          { required: true, message: '请输入短信 AppKey', trigger: 'change' }
        ],
        smsAppSecret: [
          { required: false, message: '请输入短信 AppSecret', trigger: 'change' }
        ],
        smsCallbackUrl: [
          { required: true, message: '请输入短信接口回调地址', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    'form.SmsProvider'(val) {
      if (val === 'huawei') {
        this.rules.smsCallbackUrl[0].required = true
        this.rules.smsSender[0].required = true
      } else {
        this.rules.smsCallbackUrl[0].required = false
        this.rules.smsSender[0].required = false
        this.$refs.form.clearValidate()
      }
    },
    'showPassword'(val) {
      if (val) {
        this.rules.smsAppSecret[0].required = true
      } else {
        this.rules.smsAppSecret[0].required = false
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
        this.$confirm('点击确认短信默认发送至当前配置的手机号，短信发送状态请移步至【日志审计】-【短信记录】中查看', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          showClose: false,
          closeOnClickModal: false
        }).then(() => {
          sendSms().then((res) => {
            if (res.code === 0) {
              Message({
                message: res.msg,
                type: 'success',
                duration: 1000
              })
            }
          })
        }).catch(() => {})
      })
    },

    /* 获取回调接口 */
    getCallbackUrl() {
      this.form.smsCallbackUrl = `${this.baseUrl()}/api/v1/sms/huawei/callback`
    },

    /* 更新AppSecret */
    handlePasswordUpdate() {
      this.showPassword = true
    },

    /* 提交表单 */
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const { smsProvider, smsSignature, smsEndpoint, smsSender, smsTemplateId, smsAppKey, smsCallbackUrl, smsAppSecret } = this.form
        const data = {
          smsProvider: smsProvider,
          smsSignature: smsSignature,
          smsEndpoint: smsEndpoint,
          smsSender: smsSender,
          smsTemplateId: smsTemplateId,
          smsAppKey: smsAppKey,
          smsCallbackUrl: smsCallbackUrl
        }
        if (smsAppSecret) {
          data.smsAppSecret = smsAppSecret
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
