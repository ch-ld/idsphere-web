<template>
  <el-form ref="form" :model="form" :rules="rules" :validate-on-rule-change="false" size="small" label-position="right" label-width="120px" style="width: 95%">
    <el-form-item label="记录类型：" prop="type">
      <el-select v-model="form.type" clearable style="width: 100%">
        <el-option v-for="item in rr_type" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <div class="help-block" style="color: #999; font-size: 12px">仅支持创建类型为A、CNAME、TXT和MX的记录，其它记录登录至服务商处创建</div>
    </el-form-item>
    <el-form-item label="主机记录：" prop="rr">
      <el-input v-model="form.rr" autocomplete="off" clearable>
        <template slot="append">.{{ domainName }}</template>
      </el-input>
    </el-form-item>
    <el-form-item label="记录值：" prop="value">
      <el-input v-model="form.value" autocomplete="off" clearable />
      <div class="help-block" style="color: #999; font-size: 12px">华为云：如果有多个值请使用英文逗号分割，MX和TXT记录书写格式参考官方</div>
    </el-form-item>
    <el-form-item label="优先级：" prop="priority">
      <el-input v-model.number="form.priority" :disabled="form.type !== 'MX'" autocomplete="off" clearable />
      <div class="help-block" style="color: #999; font-size: 12px">当记录类型为MX时必填（除华为云），数值越小优先级越高，0表示不使用权重</div>
    </el-form-item>
    <el-form-item label="TTL：" prop="ttl">
      <el-input v-model.number="form.ttl" autocomplete="off" clearable>
        <template slot="append">单位（秒）</template>
      </el-input>
    </el-form-item>
    <el-form-item label="权重：">
      <el-input v-model.number="form.weight" :disabled="form.type === 'MX'" autocomplete="off" clearable />
      <div class="help-block" style="color: #999; font-size: 12px">负载均衡权重，范围0-100，数值越大权重越高，仅华为云和腾讯云支持本地修改</div>
    </el-form-item>
    <el-form-item label="备注：" prop="remark">
      <el-input v-model="form.remark" autocomplete="off" clearable />
      <div class="help-block" style="color: #999; font-size: 12px">仅腾讯云支持本地修改</div>
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
  name: 'DnsAddForm',
  props: {
    form: {
      type: Object,
      default() {
        return {
          value: '',
          ttl: 600,
          type: 'A',
          rr: '',
          priority: null,
          weight: null
        }
      }
    },
    domainName: {
      type: String,
      default: ''
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
      rr_type: [{
        value: 'A',
        label: 'A 记录'
      }, {
        value: 'CNAME',
        label: 'CNAME 记录'
      }, {
        value: 'TXT',
        label: 'TXT 记录'
      }, {
        value: 'MX',
        label: 'MX 记录'
      }],
      rules: {
        type: [
          { required: true, message: '请选择记录类型', trigger: 'change' }
        ],
        rr: [
          { required: true, message: '请输入主机记录', trigger: 'change' }
        ],
        value: [
          { required: true, message: '请输入主机记录指向值', trigger: 'change' }
        ],
        ttl: [
          { required: true, message: '请输入主机记录缓存时间', trigger: 'change' }
        ],
        priority: [
          { required: false, message: '请输入记录优先级', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    'form.type'(val) {
      if (val === 'MX') {
        this.rules.priority[0].required = true
      } else {
        this.rules.priority[0].required = false
      }
      this.$refs.form.clearValidate()
    }
  },
  methods: {

    /* 提交表单 */
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }

        // 如果权重为空，则传 null
        if (this.form.weight === '' || this.form.weight === undefined || this.form.weight === null) {
          this.form.weight = null
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
