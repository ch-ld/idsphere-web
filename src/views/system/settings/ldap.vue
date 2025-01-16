<template>
  <div>
    <h3>LDAP 设置</h3>
    <el-alert
      title="重要提示"
      type="warning"
      show-icon
      style="margin-bottom: 10px;"
    >
      <slot name="description">
        LDAP 配置完成后需要建议手工执行 1 次《<a :href="baseUrl() + '/user/user'" target="_blank" style="color: red">用户同步</a>》，或配置《<a :href="baseUrl() + '/system/corn'" target="_blank" style="color: red">定时任务</a>》将用户同步到本地，在此之前用户无还法正常登录和使用系统。
      </slot>
    </el-alert>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" status-icon label-position="top" label-width="100px">
      <el-form-item label="服务器地址" prop="ldapAddress">
        <el-input v-model="form.ldapAddress" autocomplete="off" size="small" clearable />
        <div class="help-block" style="color: #999; font-size: 12px">访问地址，格式为：ldap[s]://&lt;host&gt;:&lt;port&gt;，如果使用 Windows AD，建议使用 ldaps 协议连接，否则无法通过 IDSphere 平台更改 Windows AD 用户密码。</div>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="14">
          <el-form-item label="用户查找范围" prop="ldapSearchDn">
            <el-input v-model="form.ldapSearchDn" autocomplete="off" size="small" clearable />
            <div class="help-block" style="color: #999; font-size: 12px">设置允许登录的 OU 范围，如果你需要配置多个 OU，不同 OU 之间需要使用 & 间隔。</div>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="密码过期时间" prop="ldapUserPasswordExpireDays">
            <el-input v-model="form.ldapUserPasswordExpireDays" autocomplete="off" size="small" clearable>
              <template slot="append">单位（天）</template>
            </el-input>
            <div class="help-block" style="color: #999; font-size: 12px">仅针对 Windows AD，需与 AD 中实际设置的策略保持一致。</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="14">
          <el-form-item label="Bind 用户" prop="ldapBindDn">
            <el-input v-model="form.ldapBindDn" autocomplete="off" size="small" clearable />
            <div class="help-block" style="color: #999; font-size: 12px">格式如：cn=admin,dc=idsphere,dc=cn，请确保该用户具有足够的权限。</div>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="用户属性" prop="ldapFilterAttribute">
            <el-input v-model="form.ldapFilterAttribute" autocomplete="off" size="small" clearable />
            <div class="help-block" style="color: #999; font-size: 12px">如果是 OpenLDAP 则属性为 uid，如果是 Windows AD 则属于为 sAMAccountName。</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Bind 用户密码" prop="ldapBindPassword">
        <el-input v-if="showPassword" v-model="form.ldapBindPassword" type="password" show-password autocomplete="off" size="small" clearable />
        <el-button v-else type="primary" size="mini" @click="handlePasswordUpdate">点击设置密码</el-button>
      </el-form-item>
      <el-form-item>
        <div>
          <el-button size="mini" @click="handleTest">用户登录测试</el-button>
          <el-button type="primary" size="mini" @click="handleSubmit">确 定</el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 登录测试 -->
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
      <login-form
        ref="form"
        :form="currentValue"
        @close="handleClose"
      />
    </el-dialog>
  </div>
</template>
<script>
import LoginForm from './ldap-test'

export default {
  name: 'LdapForm',
  components: {
    LoginForm
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
      baseUrl() {
        const port = window.location.port ? `:${window.location.port}` : ''
        return `${window.location.protocol}//${window.location.hostname}${port}`
      },
      showPassword: false,
      testDialog: false,
      formTitle: '',
      currentValue: undefined,
      rules: {
        ldapAddress: [
          { required: true, message: '请输入服务器访问地址', trigger: 'change' }
        ],
        ldapBindDn: [
          { required: true, message: '请输入绑定的用户 DN', trigger: 'change' }
        ],
        ldapBindPassword: [
          { required: false, message: '请输入绑定用户的密码', trigger: 'change' }
        ],
        ldapSearchDn: [
          { required: true, message: '请输入查找范围', trigger: 'change' }
        ],
        ldapFilterAttribute: [
          { required: true, message: '请输入用户过滤属性', trigger: 'change' }
        ],
        ldapUserPasswordExpireDays: [
          { required: true, message: '请输入密码过期天数', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    'showPassword'(val) {
      if (val) {
        this.rules.ldapBindPassword[0].required = true
      } else {
        this.rules.ldapBindPassword[0].required = false
        this.$refs.form.clearValidate()
      }
    }
  },
  methods: {
    /* 打开表单 */
    handleTest() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formTitle = '登录测试'
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
        const { ldapAddress, ldapSearchDn, ldapBindDn, ldapBindPassword, ldapFilterAttribute, ldapUserPasswordExpireDays } = this.form
        const data = {
          ldapAddress: ldapAddress,
          ldapSearchDn: ldapSearchDn,
          ldapBindDn: ldapBindDn,
          ldapFilterAttribute: ldapFilterAttribute,
          ldapUserPasswordExpireDays: String(ldapUserPasswordExpireDays)
        }
        if (ldapBindPassword) {
          data.ldapBindPassword = ldapBindPassword
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
