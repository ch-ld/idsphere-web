<template>
  <div class="app-container">

    <!-- 表格搜索 -->
    <el-form :inline="true">
      <el-form-item label="关键字">
        <el-input v-model="queryParams.name" placeholder="支持名称和域名" size="small" prefix-icon="el-icon-search" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="searchList">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格头 -->
    <el-row :gutter="10">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <url-table
      v-loading="loading"
      :table-data="tableData"
      @edit="handleEdit"
      @delete="handleDelete"
      @check="handleCheck"
    />

    <!-- 分页 -->
    <el-pagination
      background
      :current-page="queryParams.page"
      :page-sizes="[15, 20, 50, 100, 500]"
      :page-size="queryParams.limit"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
    />

    <!-- 编辑 -->
    <el-dialog
      v-if="urlAddDialog"
      :title="formTitle"
      :visible.sync="urlAddDialog"
      :show-close="false"
      width="700px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <!-- 表单组件 -->
      <url-add-form
        ref="form"
        :form="currentValue"
        @close="handleClose"
        @submit="handleSubmit"
      />
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getUrlList, deleteUrl, changeUrl, addUrl, certificateCheck } from '@/api/domain/monitor'
import UrlTable from './table'
import UrlAddForm from './form'

export default {
  components: {
    UrlTable,
    UrlAddForm
  },
  data() {
    return {
      loading: true,
      total: 0,
      formTitle: undefined,
      currentValue: undefined,
      tableData: [],
      queryParams: {
        name: '',
        page: 1,
        limit: 15
      },
      urlAddDialog: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /* 查找数据 */
    searchList() {
      this.queryParams.page = 1
      this.getList()
    },

    /* 获取表格数据 */
    getList() {
      this.loading = true
      getUrlList(this.queryParams).then((res) => {
        this.tableData = res.data.items
        this.total = res.data.total
        this.loading = false
      })
    },

    /* 监听page size变化 */
    handlePageSizeChange(newSize) {
      this.queryParams.limit = newSize
      this.getList()
    },

    /* 监听page number的变化 */
    handlePageChange(newPage) {
      this.queryParams.page = newPage
      this.getList()
    },

    /* page size的变化 */
    handleCurrentChange(newPage) {
      this.queryParams.limit = newPage
      this.getList()
    },

    /* 新增 */
    handleAdd() {
      // 打开Dialog
      this.urlAddDialog = true
      // 更改Dialog标题
      this.formTitle = '新增'
    },

    /* 修改 */
    handleEdit(rowData) {
      // 显示弹框
      this.urlAddDialog = true
      // 更改弹框标题
      this.formTitle = '修改'
      // 将行数据赋值给表单
      this.currentValue = JSON.parse(JSON.stringify(rowData))
    },

    /* 删除账号 */
    handleDelete(rowData) {
      this.$confirm('点击确认当前URL将从系统中永久删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false
      }).then(() => {
        deleteUrl(rowData).then((res) => {
          if (res.code === 0) {
            Message({
              message: res.msg,
              type: 'success',
              duration: 1000
            })
            if (this.tableData.length === 1 && this.queryParams.page !== 1) {
              this.queryParams.page--
            }
            this.getList()
          }
        })
      }).catch(() => {})
    },

    /* 证书检查 */
    handleCheck(value, callback) {
      certificateCheck(value).then((res) => {
        if (res.code === 0) {
          Message({
            message: res.msg,
            type: 'success',
            duration: 1000
          })
        }
        this.getList()
        callback(true)
      }).catch((res) => {
        callback(false)
      }).finally((res) => {
        callback(false)
      })
    },

    /* 新增修改 */
    handleSubmit(formData) {
      // 对id进行判断，有id表示修改，没有表示新增
      if (formData.id) {
        changeUrl(formData).then((res) => {
          if (res.code === 0) {
            Message({
              message: res.msg,
              type: 'success',
              duration: 1000
            })
            this.loading = false
            this.handleClose()
          }
        }, () => {
          this.loading = false
        })
      } else {
        addUrl(formData).then((res) => {
          if (res.code === 0) {
            Message({
              message: res.msg,
              type: 'success',
              duration: 1000
            })
            this.loading = false
            this.handleClose()
          }
        }, () => {
          this.loading = false
        })
      }
    },
    /* 表单关闭 */
    handleClose() {
      // 关闭所有Dialog
      this.urlAddDialog = false
      // 清空表单数据
      this.currentValue = undefined
      // 清空校验规则
      this.$refs.form.$refs.form.resetFields()
      // 获取最新数据
      this.getList()
    }
  }
}
</script>
