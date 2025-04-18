<template>
  <div>
    <el-alert
      type="warning"
      show-icon
    >
      <slot name="title">
        如果域名是从域名服务商处同步过来的，请忽在此处进行修改，请使用《同步》功能将域名信息与本地保持同步。
      </slot>
    </el-alert>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" size="small" label-position="right" label-width="120px" style="width: 95%;padding-top: 20px;">
      <el-form-item label="域名：" prop="name">
        <el-input v-model="form.name" autocomplete="off" clearable />
        <div class="help-block" style="color: #999; font-size: 12px">建议从域名服务端同步域名，如果不支持同步则手动新增</div>
      </el-form-item>
      <el-form-item label="注册时间：" prop="registration_at">
        <el-date-picker
          v-model="form.registration_at"
          type="datetime"
          placeholder="选择日期时间"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="到期时间：" prop="expiration_at">
        <el-date-picker
          v-model="form.expiration_at"
          type="datetime"
          placeholder="选择日期时间"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="服务提供商：" prop="domain_service_provider_id">
        <el-select v-model="form.domain_service_provider_id" placeholder="请选择域名服务提供商" clearable style="width: 100%">
          <el-option v-for="item in provider" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
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
  name: 'DomainAddForm',
  props: {
    form: {
      type: Object,
      default() {
        return {
          name: '',
          registration_at: null,
          expiration_at: null,
          domain_service_provider_id: ''
        }
      }
    },
    provider: {
      type: Array,
      default() {
        return []
      }
    },
    loading: {
      type: Boolean
    }
  },
  data() {
    return {
      rules: {
        name: [
          { required: true, message: '请输入域名名称', trigger: 'change' }
        ],
        registration_at: [
          { required: true, message: '请选择注册时间', trigger: 'change' }
        ],
        expiration_at: [
          { required: true, message: '请选择到期时间', trigger: 'change' }
        ],
        domain_service_provider_id: [
          { required: true, message: '请选择绑定的域名服务提供商', trigger: 'change' }
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

    /* 关闭表单 */
    cancel() {
      this.$emit('close')
    }
  }
}
</script>
