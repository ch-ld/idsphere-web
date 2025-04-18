<template>
  <div>
    <h3>企业微信应用</h3>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" status-icon label-position="top" label-width="100px">
      <el-form-item label="Corp ID" prop="wechatCorpId">
        <el-input v-model="form.wechatCorpId" autocomplete="off" size="small" clearable style="width: 600px;" />
        <div class="help-block" style="color: #999; font-size: 12px">登录《<a href="https://work.weixin.qq.com" target="_blank" style="color: #66b1ff">企业微信管理后台</a>》，在上方【我的企业】中获取。</div>
      </el-form-item>
      <el-form-item label="Agent ID" prop="wechatAgentId">
        <el-input v-model.number="form.wechatAgentId" autocomplete="off" size="small" clearable style="width: 600px;" />
        <div class="help-block" style="color: #999; font-size: 12px">登录《<a href="https://work.weixin.qq.com" target="_blank" style="color: #66b1ff">企业微信管理后台</a>》，在创建的企业自建应用详情页中获取。</div>
      </el-form-item>
      <el-form-item label="Secret" prop="wechatSecret">
        <el-input v-if="showPassword" v-model="form.wechatSecret" type="password" show-password autocomplete="off" size="small" clearable style="width: 600px;" />
        <el-button v-else type="primary" size="mini" @click="handlePasswordUpdate">点击设置 AppSecret</el-button>
        <div class="help-block" style="color: #999; font-size: 12px">登录《<a href="https://work.weixin.qq.com" target="_blank" style="color: #66b1ff">企业微信管理后台</a>》，在创建的企业自建应用详情页中获取。</div>
      </el-form-item>
      <el-form-item>
        <div>
          <el-button type="primary" size="mini" @click="handleSubmit">确 定</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'WechatForm',
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
      showPassword: false,
      rules: {
        wechatCorpId: [
          { required: true, message: '请输入企业微信应用 CorpId', trigger: 'change' }
        ],
        wechatAgentId: [
          { required: true, message: '请输入企业微信应用 AgentId', trigger: 'change' },
          { type: 'number', message: '请输入正确的 AgentId', trigger: 'change' }
        ],
        wechatSecret: [
          { required: false, message: '请输入企业微信应用 Secret', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    'showPassword'(val) {
      if (val) {
        this.rules.wechatSecret[0].required = true
      } else {
        this.rules.wechatSecret[0].required = false
        this.$refs.form.clearValidate()
      }
    }
  },
  methods: {

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
        const { wechatCorpId, wechatAgentId, wechatSecret } = this.form
        const data = {
          wechatCorpId: wechatCorpId,
          wechatAgentId: String(wechatAgentId)
        }
        if (wechatSecret) {
          data.wechatSecret = wechatSecret
        }
        this.$emit('submit', data, (result) => {
          if (result.code === 0) {
            this.showPassword = false
          }
        })
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
</style>
