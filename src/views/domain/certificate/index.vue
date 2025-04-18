
<template>
  <div class="app-container">

    <!-- 表格搜索 -->
    <el-form :inline="true">
      <el-form-item label="域名：">
        <el-input v-model="queryParams.name" placeholder="域名关键字" size="small" prefix-icon="el-icon-search" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="searchList">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格头 -->
    <el-row :gutter="10">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-upload2" size="mini" @click="handleUpload">本地上传</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleRequest">免费申请</el-button>
      </el-col>
    </el-row>

    <!-- 表格组件 -->
    <certificate-list-table
      v-loading="loading"
      :table-data="tableData"
      @delete="handleDelete"
      @download="handleDownload"
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

    <!-- 上传证书 -->
    <el-dialog
      v-if="uploadDialog"
      :title="formTitle"
      :visible.sync="uploadDialog"
      :show-close="false"
      width="800px"
      :close-on-click-modal="false"
      @closed="handleClose"
    >
      <!-- 表单组件 -->
      <certificate-upload-form
        ref="form"
        :form="currentValue"
        :loading="loading"
        @close="handleClose"
        @submit="submitUpload"
      />
    </el-dialog>

    <!-- 申请证书 -->
    <el-dialog
      v-if="requestDialog"
      :title="formTitle"
      :visible.sync="requestDialog"
      :show-close="false"
      width="800px"
      :close-on-click-modal="false"
      @closed="handleClose"
    >
      <!-- 表单组件 -->
      <certificate-request-form
        ref="form"
        :form="currentValue"
        :provider="providers"
        :loading="loading"
        @close="requestDialog = false"
        @submit="submitRequest"
      />
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { uploadCertificate, deleteCertificate, getCertificateList, downloadCertificate, requestCertificate } from '@/api/domain/certificate'
import { getDomainServiceProviderList } from '@/api/domain/domain'
import CertificateListTable from './table'
import CertificateUploadForm from './upload'
import CertificateRequestForm from './create'

export default {
  components: {
    CertificateListTable,
    CertificateUploadForm,
    CertificateRequestForm
  },
  data() {
    return {
      loading: true,
      tableData: [],
      total: 0,
      formTitle: '',
      providers: [],
      currentValue: undefined,
      queryParams: {
        name: '',
        page: 1,
        limit: 15
      },
      uploadDialog: false,
      requestDialog: false
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
      getCertificateList(this.queryParams).then((res) => {
        this.tableData = res.data.items
        this.total = res.data.total
        this.loading = false
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

    /* 上传证书 */
    handleUpload() {
      // 显示弹框
      this.uploadDialog = true
      // 更改弹框标题
      this.formTitle = '证书上传'
    },

    /* 申请证书 */
    handleRequest() {
      // 获取域名服务提供商
      getDomainServiceProviderList().then((res) => {
        this.providers = res.data
      })
      // 显示弹框
      this.requestDialog = true
      // 更改弹框标题
      this.formTitle = '证书申请'
    },

    /* 删除定时任务 */
    handleDelete(rowData) {
      this.$confirm('点击确认当前证书将从本系统中永久删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            deleteCertificate(rowData).then((res) => {
              if (res.code === 0) {
                Message({
                  message: res.msg,
                  type: 'success',
                  duration: 1000
                })
                instance.confirmButtonLoading = false
                done()
                // 获取最新数据
                this.getList()
              }
            }).finally(() => {
              instance.confirmButtonLoading = false
              instance.confirmButtonText = '确定'
            })
          } else {
            done()
          }
        }
      }).then(() => {}).catch(() => {})
    },

    /* 证书下载 */
    handleDownload(value, callback) {
      downloadCertificate(value).then((res) => {
        // 创建 blob
        const blob = new Blob([res.data], { type: 'application/zip' })

        // 读取 filename
        const disposition = res.headers && res.headers['content-disposition']
        let filename = 'download.zip'
        if (disposition) {
          const match = disposition.match(/filename="?(.+?)"?$/)
          if (match && match[1]) {
            try {
              filename = decodeURIComponent(match[1])
            } catch (e) {
              filename = match[1]
            }
          }
        }

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()

        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        Message({
          message: '下载完成',
          type: 'success',
          duration: 1000
        })
        callback(true)
      }).catch((res) => {
        callback(false)
      }).finally((res) => {
        callback(false)
      })
    },

    /* 证书上传 */
    submitUpload(formData) {
      this.loading = true
      uploadCertificate(formData).then((res) => {
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
    },

    /* 证书申请 */
    submitRequest(formData) {
      requestCertificate(formData).then((res) => {}, (res) => {
        this.handleClose()
      })
    },

    /* 表单关闭 */
    handleClose() {
      // 关闭所有Dialog
      this.uploadDialog = false
      this.requestDialog = false
      // 清空表单及空梭框数据
      this.currentValue = undefined
      // 清空校验规则
      this.$refs.form.$refs.form.resetFields()
      // 获取最新数据
      this.getList()
    }
  }
}
</script>
