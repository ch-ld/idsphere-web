<template>
  <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" label-position="right" label-width="110px" style="width: 95%" size="small">
    <el-form-item label="站点名称：" prop="name">
      <el-input v-model="form.name" autocomplete="off" clearable />
    </el-form-item>
    <el-form-item label="域名：" prop="domain">
      <el-input v-model="form.domain" autocomplete="off" clearable>
        <template slot="prepend">https://</template>
      </el-input>
    </el-form-item>
    <el-row :gutter="2">
      <el-col :span="8">
        <el-form-item label="HTTPS 端口：">
          <el-input v-model.number="form.port" autocomplete="off" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="16">
        <el-form-item label="自定义 IP：">
          <el-input v-model="form.ip_address" autocomplete="off" clearable />
          <div class="help-block" style="color: #999; font-size: 12px">提供后可强制域名向此 IP 发起请求</div>
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item>
      <div>
        <el-button size="mini" @click="cancel">取 消</el-button>
        <el-button type="primary" size="mini" :loading="loading" @click="handleSubmit">确 定</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'UrlAddForm',
  props: {
    form: {
      type: Object,
      default() {
        return {
          name: '',
          ip_address: null,
          domain: '',
          port: 443
        }
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
          { required: true, message: '请输入站点名称', trigger: 'change' }
        ],
        domain: [
          { required: true, message: '请输入站点域名', trigger: 'change' }
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
