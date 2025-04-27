<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" label-position="right" label-width="100px" size="small" style="width: 95%">
      <el-row>
        <el-col :span="10">
          <el-form-item label="任务名称：" prop="name">
            <el-input v-model="form.name" placeholder="请输入任务名称" autocomplete="off" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item v-if="form.type === 2" label="表达式：" prop="cron_expr">
            <el-input v-model="form.cron_expr" placeholder="分 时 日 月 周" />
            <div class="help-block" style="color: #999; font-size: 12px">计划任务表达式《<el-link type="primary" style="font-size: 12px" :underline="false" @click="openDescribe">填写说明</el-link>》</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="任务类型：" prop="type">
            <el-radio-group v-model="form.type" size="small">
              <el-radio-button :label="1" disabled>调用URL</el-radio-button>
              <el-radio-button :label="2">系统内置方法</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="状态：">
            <el-switch
              v-model="form.enabled"
              active-text="启用"
              inactive-text="禁用"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item v-if="form.type === 2" label="内置方法：" prop="built_in_method">
        <el-select v-model="form.built_in_method" placeholder="请输入或选择" allow-create filterable clearable style="width: 100%">
          <el-option v-for="item in methods" :key="item.value" :label="item.name" :value="item.value" />
        </el-select>
        <div class="help-block" style="color: #999; font-size: 12px">注意：仅以 * 开头项目支持通知，需要完成下方通知配置</div>
      </el-form-item>
      <el-form-item label="通知方式：">
        <el-radio-group v-model="form.notify_type">
          <el-radio :label="1">邮件</el-radio>
          <el-radio :label="2">钉钉机器人</el-radio>
          <el-radio :label="3">飞书机器人</el-radio>
          <el-radio :label="4">企业机器人</el-radio>
        </el-radio-group>
        <div v-if="form.notify_type === 1" class="help-block" style="color: #999; font-size: 12px">请确保已完成《<a :href="baseUrl() + '/system/conf'" target="_blank" style="color: red">发件服务器</a>》相关配置</div>
        <div v-if="form.notify_type === 2" class="help-block" style="color: #999; font-size: 12px">可参考《<a href="https://open.dingtalk.com/document/orgapp/custom-bot-creation-and-installation" target="_blank" style="color: red">创建自定义机器人</a>》官方文档，关键字可以使用【系统配置】-【安全设置】中的提供商名称</div>
        <div v-if="form.notify_type === 3" class="help-block" style="color: #999; font-size: 12px">可参考《<a href="https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot" target="_blank" style="color: red">自定义机器人使用指南</a>》官方文档，关键字可以使用【系统配置】-【安全设置】中的提供商名称</div>
        <div v-if="form.notify_type === 4" class="help-block" style="color: #999; font-size: 12px">可参考《<a href="https://open.work.weixin.qq.com/help2/pc/14931" target="_blank" style="color: red">如何设置群机器人</a>》官方文档</div>
      </el-form-item>
      <el-form-item label="接收地址：">
        <el-input v-model="form.receiver" placeholder="请在此输入邮箱地址或 WebhookURL" autocomplete="off" clearable />
        <div class="help-block" style="color: #999; font-size: 12px">注意：多个邮箱中间使用使用英文逗号分隔，用户密码过期通知只支持邮件，不需要输指定收件人，默认通知到个人</div>
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
  name: 'CronAddForm',
  props: {
    form: {
      type: Object,
      default() {
        return {
          type: 2,
          name: '',
          cron_expr: '',
          built_in_method: '',
          enabled: true,
          notify_type: 1,
          receiver: ''
        }
      }
    },
    loading: {
      type: Boolean
    }
  },
  data() {
    return {
      baseUrl() {
        const port = window.location.port ? `:${window.location.port}` : ''
        return `${window.location.protocol}//${window.location.hostname}${port}`
      },
      // 请务随意更改value，该值用于后端任务执行逻辑判断
      methods: [
        { value: 'password_expire_notify', name: '* 用户密码过期提醒' },
        { value: 'user_sync', name: '用户同步，同时支持Windows AD 和 OpenLDAP' },
        { value: 'domain_sync', name: '域名服务提供商域名同步' },
        { value: 'domain_expire_notify', name: '* 过期和即将过期（有效期小于30天）域名提醒' },
        { value: 'certificate_expire_notify', name: '* 过期和即将过期（有效期小于30天）证书提醒' },
        { value: 'url_certificate_expire_notify', name: '* HTTPS 站点证书异常（检查异常、过期，即将过期）提醒' }
      ],
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: 'change' }
        ],
        cron_expr: [
          { required: true, message: '请填写计划任务表达式', trigger: 'change' }
        ],
        built_in_method: [
          { required: true, message: '请选择内置方法', trigger: 'change' }
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

    /* 计划任务填写说明 */
    openDescribe() {
      this.$emit('describe')
    },

    /* 关闭表单 */
    cancel() {
      this.$emit('close')
    }
  }
}
</script>
