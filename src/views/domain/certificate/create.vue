<template>
  <div>
    <el-alert
      type="warning"
      show-icon
    >
      <slot name="title">
        IDSphere 统一认证平台申请免费证书高度依赖自动化，目前仅支持域名服务提供商为阿里云、腾讯云和华为云的域名申请，不受支持的服务商无法完成 DNS-01 挑战，后续版本中可能会增加其它服务商或手动完成 DNS-01 挑战。
      </slot>
    </el-alert>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" size="small" label-position="right" label-width="120px" style="width: 95%;padding-top: 20px;">
      <el-row>
        <el-col :span="12">
          <el-form-item label="证书平台：" prop="platform">
            <el-select v-model="form.platform" placeholder="请选择证书平台" clearable style="width: 100%;">
              <el-option v-for="item in platform" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="加密算法：" prop="encrypt">
            <el-select v-model="form.encrypt" placeholder="请选择加密算法" clearable style="width: 100%;">
              <el-option v-for="item in encrypt" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="域名提供商：" prop="provider_id">
        <el-select v-model="form.provider_id" placeholder="请选择域名服务提供商" clearable style="width: 100%" @change="handleProviderChange">
          <el-option v-for="item in provider" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请域名：" prop="rr">
        <el-input v-model="form.rr" placeholder="请输入域名DNS记录" class="input-with-select">
          <el-select slot="append" v-model="form.domain" placeholder="先选择域名提供商，再选择域名" style="width: 250px;">
            <el-option v-for="item in domains" :key="item.id" :label="'.' + item.name" :value="item.name" />
          </el-select>
        </el-input>
        <div class="help-block" style="color: #999; font-size: 12px">泛域名证书记录值为：*，多域名证书中间使用英文逗号分隔，如：doc,www</div>
      </el-form-item>
      <el-form-item label="邮箱地址：">
        <el-input v-model="form.email" placeholder="请输入邮箱地址" autocomplete="off" clearable />
        <div class="help-block" style="color: #999; font-size: 12px">如果为空，则默认使用当前用户邮箱，用于注册 ACME 账户</div>
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
import { getDomainList } from '@/api/domain/domain'

export default {
  name: 'CertificateRequestForm',
  props: {
    form: {
      type: Object,
      default() {
        return {
          platform: 1,
          rr: null,
          domain: null,
          encrypt: 1,
          email: '',
          provider_id: null
        }
      }
    },
    loading: {
      type: Boolean
    },
    provider: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    const validateRrAndDomain = (rule, value, callback) => {
      if (!this.form.rr) {
        callback(new Error('请输入域名DNS记录'))
      } else if (!this.form.domain) {
        callback(new Error('请选择域名'))
      } else {
        callback()
      }
    }
    return {
      domains: [],
      platform: [{
        value: 1,
        label: 'Let\'s Encrypt '
      }],
      encrypt: [{
        value: 1,
        label: 'RSA-2048'
      }],
      rules: {
        platform: [
          { required: true, message: '请选择证书注册平台', trigger: 'change' }
        ],
        rr: [
          { validator: validateRrAndDomain, trigger: 'change' }
        ],
        encrypt: [
          { required: true, message: '请选择证书加密算法', trigger: 'change' }
        ],
        provider_id: [
          { required: true, message: '请选择域名DNS服务提供商', trigger: 'change' }
        ]
      }
    }
  },
  methods: {

    /* 获取域名列表 */
    handleProviderChange() {
      getDomainList({ provider_id: this.form.provider_id }).then((res) => {
        this.domains = res.data.items
      })
    },

    /* 提交表单 */
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.$emit('submit', this.form)
        this.$emit('close')
      })
    },

    /* 关闭表单 */
    cancel() {
      this.$emit('close')
    }
  }
}
</script>
