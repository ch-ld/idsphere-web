<template>
  <div>
    <h3>安全设置</h3>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" status-icon label-position="top" label-width="100px">
      <el-form-item label="双因素认证" prop="mfa">
        <el-switch v-model="form.mfa" />
        <div class="help-block" style="color: #999; font-size: 12px;">建议开启，开启后登录时需要使用身份验证器验证的验证码, 也可以通过该验证码重置自己的密码和获取账号资产密码信息。</div>
      </el-form-item>
      <el-form-item label="提供商名称" prop="issuer">
        <el-input v-model="form.issuer" autocomplete="off" size="small" clearable style="width: 600px" />
        <div class="help-block" style="color: #999; font-size: 12px">身份验证器扫码后显示的名称。</div>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="14">
          <el-form-item label="安全密钥" prop="secret">
            <el-input v-model="form.secret" autocomplete="off" size="small" clearable />
            <div class="help-block" style="color: #999; font-size: 12px">建议更改，用于 CAS 3.0 票据签名，可使用其它任务字符串。</div>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="Token 有效期" prop="tokenExpiresTime">
            <el-input v-model="form.tokenExpiresTime" autocomplete="off" size="small" clearable>
              <template slot="append">单位（小时）</template>
            </el-input>
            <div class="help-block" style="color: #999; font-size: 12px">作用于用户登录成功后 JWT Token 的有效期。</div>
          </el-form-item>
        </el-col>
      </el-row>
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
  name: 'SecurityForm',
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
      rules: {
        mfa: [
          { required: true, message: '请选择双因素认证是否开启', trigger: 'change' }
        ],
        issuer: [
          { required: true, message: '请输入提供商名称', trigger: 'change' }
        ],
        tokenExpiresTime: [
          { required: true, message: '请输入 Token 有效期', trigger: 'change' }
        ],
        secret: [
          { required: true, message: '请输入安全密钥', trigger: 'change' }
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
        const { mfa, issuer, secret, tokenExpiresTime } = this.form
        const data = {
          mfa: mfa ? 'true' : 'false',
          issuer: issuer,
          secret: secret,
          tokenExpiresTime: String(tokenExpiresTime)
        }
        this.$emit('submit', data, (result) => {})
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
