
<template>
  <div class="app-container">

    <!-- 表格搜索 -->
    <el-form :inline="true">
      <el-form-item label="菜单名称：">
        <el-input v-model="queryParams.title" placeholder="一级菜单名称" size="small" prefix-icon="el-icon-search" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="searchList">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格头 -->
    <el-row :gutter="10">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAddMenu">新增</el-button>
      </el-col>
    </el-row>

    <!-- 表格组件 -->
    <menu-list-table
      :table-data="tableData"
      @edit="handleEditMenu"
      @refresh="getList"
    />

    <!-- 分页 -->
    <el-pagination
      background
      :current-page="queryParams.page"
      :page-sizes="[10, 15, 20, 30, 40]"
      :page-size="queryParams.limit"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
    />

    <!-- 菜单编辑 -->
    <el-dialog
      :title="formTitle"
      :visible.sync="menuAddDialog"
      :show-close="false"
      width="700px"
      :close-on-click-modal="false"
      @closed="handleClose"
    >
      <!-- 修改这里，添加 @submit 事件监听 -->
      <menu-add-form
        ref="form"
        :form="currentValue"
        :menus="menus"
        @submit="handleSubmit"
        @close="handleClose"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  getMenuList,
  createMenu,
  updateMenu,
  updateMenuSort,
  createSubMenu,
  updateSubMenu,
  updateSubMenuSort
} from '@/api/system/menu'
import MenuListTable from './table'
import MenuAddForm from './form'

export default {
  components: {
    MenuListTable,
    MenuAddForm
  },
  data() {
    return {
      loading: true,
      tableData: [],
      total: 0,
      formTitle: '',
      currentValue: undefined,
      menus: [],
      queryParams: {
        title: '',
        page: 1,
        limit: 15
      },
      menuAddDialog: false
    }
  },
  created() {
    this.getList()
  },
  methods: {

    /* 查找数据 */
    searchList() {
      this.queryParams.page = 1
      this.loading = true
      this.getList()
    },

    /* 获取数据 */
    getList() {
      getMenuList(this.queryParams).then((res) => {
        this.tableData = res.data.items
        this.total = res.data.total
        this.loading = false

        //  获取一级菜单列表
        const menus = []
        this.tableData.forEach(function(value, index) {
          menus.push({
            id: value.id,
            title: value.title
          })
        })
        this.menus = menus
      })
    },

    /* page size变化 */
    handlePageSizeChange(newSize) {
      this.queryParams.limit = newSize
      this.getList()
    },

    /* page number的变化 */
    handlePageChange(newPage) {
      this.queryParams.page = newPage
      this.getList()
    },

    /* 新增菜单 */
    handleAddMenu() {
      // 显示弹框
      this.menuAddDialog = true
      // 更改弹框标题
      this.formTitle = '新增菜单'
      // 清空当前值
      this.currentValue = null
    },

    /* 编辑菜单 */
    handleEditMenu(rowData) {
      // 打开Dialog
      this.menuAddDialog = true
      // 更改Dialog标题
      this.formTitle = rowData.type === 0 ? '修改一级菜单' : '修改二级菜单'
      // 将当前行数据赋值给currentValue
      this.currentValue = JSON.parse(JSON.stringify(rowData))
    },
    /* 提交表单 */
    handleSubmit(formData) {
      // 创建一个新对象，移除不需要的字段
      const submitData = {
        title: formData.title,
        name: formData.name,
        icon: formData.icon,
        path: formData.path,
        component: formData.component,
        sort: parseInt(formData.sort) || 0,
        redirect: formData.redirect || ''
      }
      // 如果是二级菜单，添加 menu_id
      if (formData.type === 1) {
        submitData.menu_id = formData.menu_id
      }

      if (formData.id) {
        // 更新
        if (formData.type === 0) {
          // 更新一级菜单
          updateMenu(formData.id, submitData).then(res => {
            this.$message.success('更新成功')
            this.handleClose()
          }).catch(err => {
            console.error('更新失败:', err)
            this.$message.error('更新失败')
          })
        } else {
          // 更新二级菜单
          updateSubMenu(formData.id, submitData).then(res => {
            this.$message.success('更新成功')
            this.handleClose()
          }).catch(err => {
            console.error('更新失败:', err)
            this.$message.error('更新失败')
          })
        }
      } else {
        // 新增
        if (formData.type === 0) {
          // 创建一级菜单
          createMenu(submitData).then(res => {
            this.$message.success('创建成功')
            this.handleClose()
          }).catch(err => {
            console.error('创建失败:', err)
            this.$message.error('创建失败')
          })
        } else {
          // 创建二级菜单
          createSubMenu(submitData).then(res => {
            this.$message.success('创建成功')
            this.handleClose()
          }).catch(err => {
            console.error('创建失败:', err)
            this.$message.error('创建失败')
          })
        }
      }
    },

    /* 更新排序 */
    handleSort(id, sort, isSubMenu = false) {
      const data = { sort: sort }
      if (isSubMenu) {
        updateSubMenuSort(id, data).then(res => {
          this.$message.success('排序更新成功')
          this.getList()
        })
      } else {
        updateMenuSort(id, data).then(res => {
          this.$message.success('排序更新成功')
          this.getList()
        })
      }
    },
    /* 表单关闭 */
    handleClose() {
      // 关闭所有Dialog
      this.menuAddDialog = false
      // 清空表单及空梭框数据
      this.currentValue = null
      // 清空校验规则
      this.$refs.form.$refs.form.resetFields()
      // 获取最新数据
      this.getList()
    }
  }
}
</script>
