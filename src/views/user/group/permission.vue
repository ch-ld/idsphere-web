<template>
  <div>
    <el-form ref="form" :validate-on-rule-change="false" label-position="right" label-width="100px" style="width: 95%" size="small">
      <el-form-item>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-card class="box-card" shadow="hover">
              <div slot="header" class="clearfix">
                <span>菜单权限</span>
              </div>
              <!-- 树形菜单 -->
              <div class="down-tree">
                <el-tree
                  ref="tree"
                  show-checkbox
                  default-expand-all
                  node-key="name"
                  highlight-current
                  :default-checked-keys="form.menus"
                  :expand-on-click-node="false"
                  :check-on-click-node="false"
                  :data="menus"
                  @node-click="handleNodeClick"
                />
              </div>
            </el-card>
          </el-col>
          <el-col :span="16">
            <el-card class="box-card" shadow="hover">
              <div slot="header" class="clearfix">
                <span>接口权限</span>
              </div>
              <div class="down-tree">
                <div v-if="filteredPaths == undefined" class="help-block" style="color: #999; font-size: 14px">请点击左侧菜单显示对应接口权限</div>
                <ul class="item">
                  <li v-for="(item, index) in filteredPaths" :key="index">
                    <el-checkbox v-model="item.flag" :indeterminate="isIndeterminate(item)" @change="(val) => handleCheckAll(val, item)">{{ item.menu_name }}</el-checkbox>
                    <el-checkbox-group v-model="form.paths" class="checkbox-group" @change="() => handleChange(item)">
                      <el-checkbox v-for="path in item.paths" :key="path.id" :label="path.name" class="checkbox-group-item">{{ path.description }}</el-checkbox>
                    </el-checkbox-group>
                  </li>
                </ul>
              </div>
            </el-card>
          </el-col>
        </el-row>
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
  name: 'AddPermissionTree',
  props: {
    form: {
      type: Object,
      default() {
        return {}
      }
    },
    menus: {
      type: Array,
      default() {
        return []
      }
    },
    paths: {
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
      filteredPaths: undefined
    }
  },
  created() {
    this.setNodes()
    this.updateCheckDataFlags()
  },
  methods: {

    /* 接口权限过滤 */
    handleNodeClick(data) {
      let result = []
      if (data.children && data.children.length > 0) {
        result = data.children.map(child => child.label)
      } else {
        result = [data.label]
      }
      this.filteredPaths = this.paths.filter(item => result.includes(item.menu_name))
    },

    /* 设置节点选中状态 */
    setNodes() {
      this.$nextTick(() => {
        // 获取当前选中的所有节点
        const checkedNodes = this.$refs.tree.getCheckedKeys(false)
        // 如果当前选中的节点用户没有权限，则取消选中（在渲染组件时子节点如果选中，默认会选中同级所有节点，导致显示会出错，所以需要重置设置）
        for (const i of checkedNodes) {
          if (!this.form.menus.includes(i)) {
            this.$refs.tree.setChecked(i, false)
          }
        }
      })
    },

    /* 判断全选按钮的状态是否为全选或全不选 */
    isAllChecked(item) {
      const infoLists = item.paths.map(ite => ite.name)
      return infoLists.every(v => this.form.paths.indexOf(v) > -1)
    },

    /* 判断是全选按钮否为半选状态 */
    isIndeterminate(item) {
      const infoLists = item.paths.map(ite => ite.name)
      return (
        infoLists.some((v) => this.form.paths.indexOf(v) > -1) &&
        !infoLists.every((v) => this.form.paths.indexOf(v) > -1)
      )
    },

    /* 全选按钮点击时 */
    handleCheckAll(val, item) {
      const next = item.paths.map(path => path.name)
      const filterArr = this.form.paths.filter(v => next.indexOf(v) === -1)
      this.form.paths = val ? filterArr.concat(next) : filterArr
      this.updateCheckDataFlags()
    },

    /* 分组按钮点击时 */
    handleChange(item) {
      this.$set(item, 'flag', this.isAllChecked(item))
      this.updateCheckDataFlags()
    },

    /* 更新全选按钮状态 */
    updateCheckDataFlags() {
      this.paths.forEach(item => {
        this.$set(item, 'flag', this.isAllChecked(item))
      })
    },

    /* 提交表单 */
    handleSubmit() {
      const data = {
        'id': this.form.id,
        'menu_permissions': this.$refs.tree.getHalfCheckedKeys().concat(this.$refs.tree.getCheckedKeys()),
        'path_permissions': this.form.paths
      }
      this.$emit('submit', data)
    },

    /* 关闭表单 */
    cancel() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.down-tree{
  height: 350px;
  display: block;
  overflow-y: auto;
}
.item{
  list-style-type: none; /* 不显示圆点 */
  padding-left: 20px;
}
.checkbox-group{
  /* 指定分组中元素缩进像素 */
  padding-left: 30px;
}
.checkbox-group-item{
  /* 指定分组中每个筛选框的宽度 */
  width: 150px;
}
</style>
