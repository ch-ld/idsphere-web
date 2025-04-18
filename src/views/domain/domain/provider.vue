<template>
  <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" size="mini" label-position="right" label-width="120px" style="width: 95%">
    <el-form-item label="服务商名称：" prop="name">
      <el-input v-model="form.name" placeholder="请输入服务商名称，此名称不具备实际的意义，仅用于显示" autocomplete="off" clearable />
    </el-form-item>
    <el-form-item label="服务商类型：" prop="type">
      <el-radio-group v-model="form.type">
        <el-radio :label="1">阿里云</el-radio>
        <el-radio :label="2">华为云</el-radio>
        <el-radio :label="3">腾讯云</el-radio>
        <el-radio :label="4">其它</el-radio>
      </el-radio-group>
      <div class="help-block" style="color: #999; font-size: 12px">请按实际选择，没有对应的服务商则选项其它</div>
    </el-form-item>
    <el-form-item label="AccessKey：" prop="access_key">
      <el-input v-if="showAccessKey || form.id === undefined" v-model="form.access_key" show-password placeholder="请输入 AccessKey 或 SecretId（腾讯云）" autocomplete="off" type="password" clearable />
      <el-button v-else type="primary" size="mini" @click="handleAccessKey">点击更新</el-button>
      <div class="help-block" style="color: #999; font-size: 12px">用于 SDK 对接，实现域名同步和 DNS 记录管理，支持阿里云、华为云和腾讯云</div>
    </el-form-item>
    <el-row>
      <el-col :span="12">
        <el-form-item label="SecretKey：" prop="secret_key">
          <el-input v-if="showSecretKey || form.id === undefined" v-model="form.secret_key" show-password placeholder="请输入 SecretKey" autocomplete="off" type="password" clearable />
          <el-button v-else type="primary" size="mini" @click="handleSecretKey">点击更新</el-button>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="自动同步：" prop="auto_sync">
          <el-switch
            v-model="form.auto_sync"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
          <div class="help-block" style="color: #999; font-size: 12px">需要配合定时任务完成自动同步</div>
        </el-form-item>
      </el-col>
    </el-row>
    <el-divider>华为云专属配置，用于域名同步</el-divider>
    <el-row>
      <el-col :span="12">
        <el-form-item label="账号名：" prop="account_name ">
          <el-input v-model="form.account_name" autocomplete="off" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="IAM 用户名：" prop="iam_username">
          <el-input v-model="form.iam_username" autocomplete="off" clearable />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="IAM 用户密码：" prop="iam_password">
      <el-input v-if="showIamPassword || form.id === undefined" v-model="form.iam_password" show-password autocomplete="off" type="password" clearable />
      <el-button v-else type="primary" size="mini" @click="handleIamPassword">点击更新</el-button>
    </el-form-item>
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
  name: 'DomainProviderAddForm',
  props: {
    form: {
      type: Object,
      default() {
        return {
          name: '',
          type: 1,
          access_key: null,
          secret_key: null,
          auto_sync: false,
          account_name: null,
          iam_username: null,
          iam_password: null
        }
      }
    },
    loading: {
      type: Boolean
    }
  },
  data() {
    return {
      showAccessKey: false,
      showSecretKey: false,
      showIamPassword: false,
      rules: {
        name: [
          { required: true, message: '请输入服务商名称', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择服务商类型', trigger: 'change' }
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

    /* 修改 AccessKey */
    handleAccessKey() {
      this.showAccessKey = true
    },

    /* 修改 SecretKey */
    handleSecretKey() {
      this.showSecretKey = true
    },

    /* 修改 IamPassword */
    handleIamPassword() {
      this.showIamPassword = true
    },

    /* 关闭表单 */
    cancel() {
      this.$emit('close')
    }
  }
}
</script>
