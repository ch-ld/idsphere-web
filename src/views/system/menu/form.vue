<template>
  <el-form ref="form" :model="localForm" :rules="rules" :validate-on-rule-change="false" label-position="right" label-width="100px" style="width: 95%">
    <el-form-item label="菜单类型：" prop="type">
      <el-radio-group v-model="localForm.type" size="small" :disabled="localForm.id !== undefined" @change="handleTypeChange">
        <el-radio-button :label="0">一级菜单</el-radio-button>
        <el-radio-button :label="1">二级菜单</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="localForm.type === 1" label="一级菜单：" prop="menu_id">
      <el-select v-model="localForm.menu_id" placeholder="请选择一级菜单" style="width:100%" filterable>
        <el-option v-for="item in menus" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-row>
      <el-col :span="12">
        <el-form-item label="标题：" prop="title">
          <el-input v-model="localForm.title" autocomplete="off" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="名称：" prop="name">
          <el-input v-model="localForm.name" autocomplete="off" clearable />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-form-item label="PATH路径：" prop="path">
          <el-input v-model="localForm.path" autocomplete="off" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="排序：" prop="sort">
          <el-input v-model="localForm.sort" autocomplete="off" clearable />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="Icon名称：" prop="icon">
      <el-input v-model="localForm.icon" autocomplete="off" clearable />
      <div class="help-block" style="color: #999; font-size: 12px">此名称的图标需要在前端项目的<b>src/icons/svg</b>目录中存在</div>
    </el-form-item>
    <el-form-item label="组件：" prop="component">
      <el-input v-model="localForm.component" autocomplete="off" clearable />
      <div class="help-block" style="color: #999; font-size: 12px">组件的路径，需要在前端项目中的<b>src/views</b>目录中存在，如果包含子菜单则此处为Layout</div>
    </el-form-item>
    <el-form-item>
      <div>
        <el-button size="mini" @click="cancel">取 消</el-button>
        <el-button type="primary" size="mini" @click="handleSubmit">确 定</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'MenuAddForm',
  props: {
    form: {
      type: Object,
      default() {
        return null
      }
    },
    menus: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      localForm: {
        title: '',
        name: '',
        icon: '',
        path: '',
        component: 'Layout',
        sort: '',
        type: 0,
        menu_id: undefined
      },
      rules: {
        name: [
          { required: true, message: '请输入菜单显示名称', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入菜单名称', trigger: 'change' }
        ],
        icon: [
          { required: true, message: '请输入菜单的Icon图标名称', trigger: 'change' }
        ],
        path: [
          { required: true, message: '请输入菜单的Path路径', trigger: 'change' }
        ],
        component: [
          { required: true, message: '请输入菜单的组件路径', trigger: 'change' }
        ],
        sort: [
          { required: true, message: '请输入菜单的顺序', trigger: 'change' }
        ],
        menu_id: [
          { required: true, message: '请选择一级菜单', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    form: {
      immediate: true,
      handler(val) {
        if (val) {
        // 深拷贝并确保类型正确
          const formData = JSON.parse(JSON.stringify(val))
          formData.type = parseInt(formData.type || 0)
          formData.menu_id = parseInt(formData.menu_id) || undefined
          formData.sort = parseInt(formData.sort) || 0
          this.localForm = formData
        } else {
          this.resetForm()
        }
      }
    }
  },
  methods: {
    resetForm() {
      this.localForm = {
        title: '',
        name: '',
        icon: '',
        path: '',
        component: 'Layout',
        sort: '',
        type: 0,
        menu_id: undefined
      }
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    handleTypeChange(value) {
      // 切换菜单类型时重置部分字段
      if (value === 1) {
        this.localForm.component = '' // 二级菜单默认清空组件
      } else {
        this.localForm.component = 'Layout' // 一级菜单默认Layout
        this.localForm.menu_id = undefined // 清除一级菜单选择
      }
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const submitData = { ...this.localForm }
        // 确保数字类型字段正确
        submitData.sort = parseInt(submitData.sort) || 0
        submitData.type = parseInt(submitData.type)
        if (submitData.menu_id) {
          submitData.menu_id = parseInt(submitData.menu_id)
        }

        console.log('提交的表单数据:', submitData)
        this.$emit('submit', submitData)
      })
    },
    cancel() {
      this.$emit('close')
    }
  }
}
</script>
