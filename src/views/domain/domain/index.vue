<template>
  <div class="settings-wrapper">
    <el-alert
      type="info"
    >
      <slot name="title">
        域名需要绑定在域名服务提供商下，支持从阿里云、华为云和腾讯云域名服务提供商自动同步域名信息到本地和对域名解析记录管理，另外还可配置《<a :href="baseUrl() + '/system/corn'" target="_blank" style="color: red">定时任务</a>》实现域名定期自动同步以及域名过期提醒。
      </slot>
    </el-alert>
    <div class="settings-container">
      <el-row class="equal-height-row">
        <el-col :span="6">
          <el-tree
            :data="treeData"
            :props="defaultProps"
            :default-expand-all="true"
            :expand-on-click-node="false"
            :render-content="renderContent"
            style="height: auto;"
            @node-click="handleNodeClick"
          />
          <span v-if="treeData[0].children.length === 0" class="empty-message">请先添加至少一个域名服务提供商</span>
        </el-col>
        <el-col :span="18" class="content-container">
          <!-- 表格搜索 -->
          <el-form :inline="true">
            <el-form-item label="域名：">
              <el-input v-model="queryParams.name" placeholder="名称" size="small" prefix-icon="el-icon-search" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="searchList">查询</el-button>
            </el-form-item>
          </el-form>

          <!-- 表格头 -->
          <el-row :gutter="10">
            <el-col :span="1.5">
              <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAddDomain">新增</el-button>
            </el-col>
          </el-row>

          <!-- 表格组件 -->
          <domain-list-table
            v-loading="loading"
            :table-data="tableData"
            @edit="handleEditDomain"
            @delete="handleDelete"
            @dns="handleDomainDns"
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

          <!-- 新增域名 -->
          <el-dialog
            v-if="domainAddDialog"
            :title="formTitle"
            :visible.sync="domainAddDialog"
            :show-close="false"
            width="500px"
            :close-on-click-modal="false"
            @closed="handleClose"
          >
            <!-- 表单组件 -->
            <domain-add-form
              ref="form"
              :form="currentValue"
              :provider="treeData[0].children"
              :loading="loading"
              @close="handleClose"
              @submit="handleDomainSubmit"
            />
          </el-dialog>

          <!-- 新增服务商 -->
          <el-dialog
            v-if="domainProviderAddDialog"
            :title="formTitle"
            :visible.sync="domainProviderAddDialog"
            :show-close="false"
            width="650px"
            :close-on-click-modal="false"
            @closed="handleClose"
          >
            <!-- 表单组件 -->
            <domain-provider-add-form
              ref="form"
              :form="currentValue"
              :loading="loading"
              @close="handleClose"
              @submit="handleProviderSubmit"
            />
          </el-dialog>
        </el-col>
      </el-row>
    </div>

    <!-- 域名同步规则 -->
    <el-dialog
      title="域名同步规则"
      :visible.sync="domainSyncRuleDialog"
      :show-close="true"
      width="700px"
      :close-on-click-modal="true"
    >
      <!-- 表单组件 -->
      <rule-describe />
    </el-dialog>

    <!-- 域名解析设置 -->
    <el-dialog
      v-if="domainDnsDialog"
      title="域名解析列表"
      :visible.sync="domainDnsDialog"
      :show-close="true"
      width="1200px"
      :close-on-click-modal="true"
      @closed="handleClose"
    >
      <!-- 表格组件 -->
      <dns-list-table
        ref="form"
        v-loading="loading"
        :form="dnsQueryParams"
        :table-data="dnsTableData"
        @search="handleDnsSearch"
        @edit="handleEditDns"
        @add="handleAddDns"
        @delete="handleDeleteDns"
        @pause="handlePauseDns"
      />
      <!-- 分页 -->
      <el-pagination
        background
        :current-page="dnsQueryParams.page"
        :page-sizes="[10, 15, 20, 30, 40]"
        :page-size="dnsQueryParams.limit"
        :total="dnsTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleDnsPageSizeChange"
        @current-change="handleDnsPageChange"
      />
    </el-dialog>

    <!-- DNS解析修改 -->
    <el-dialog
      v-if="dnsAddDialog"
      :title="formTitle"
      :visible.sync="dnsAddDialog"
      :show-close="false"
      width="700px"
      :close-on-click-modal="false"
      @closed="handleClose2"
    >
      <!-- 表单组件 -->
      <dns-add-form :loading="loading2" :form="currentValue" :domain-name="currentDomainName" @close="handleClose2" @submit="handleDNsSubmit" />
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getDomainServiceProviderList, addDomainServiceProvider, deleteDomainServiceProvider, changeDomainServiceProvider } from '@/api/domain/domain'
import { getDomainList, addDomain, changeDomain, deleteDomain } from '@/api/domain/domain'
import { syncDomain, getDomainDnsList, addDns, changeDns, deleteDns, changeDnsStatus } from '@/api/domain/domain'
import RuleDescribe from './rule'
import DomainListTable from './table'
import DnsListTable from './dns'
import DomainAddForm from './form'
import DnsAddForm from './form-dns'
import DomainProviderAddForm from './provider'

export default {
  components: {
    DomainListTable,
    DomainAddForm,
    RuleDescribe,
    DnsListTable,
    DnsAddForm,
    DomainProviderAddForm
  },
  data() {
    return {
      baseUrl() {
        const port = window.location.port ? `:${window.location.port}` : ''
        return `${window.location.protocol}//${window.location.hostname}${port}`
      },
      treeData: [{
        id: 1,
        name: '域名服务提供商',
        children: []
      }],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      loading: false,
      loading2: false,
      tableData: [],
      total: 0,
      formTitle: '',
      currentValue: undefined,
      currentDomainName: '',
      queryParams: {
        name: '',
        provider_id: '',
        page: 1,
        limit: 10
      },
      dnsTableData: [],
      dnsTotal: 0,
      dnsQueryParams: {
        keyWord: '',
        id: '',
        page: 1,
        limit: 10
      },
      domainAddDialog: false,
      domainProviderAddDialog: false,
      domainDnsDialog: false,
      domainSyncRuleDialog: false,
      dnsAddDialog: false
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
      this.getDomains()
    },

    /* 查找DNS记录 */
    handleDnsSearch() {
      this.dnsQueryParams.page = 1
      this.getDns()
    },

    /* 获取域名DNS解析列表 */
    handleDomainDns(data) {
      // 打开Dialog
      this.domainDnsDialog = true
      // 将当域名赋值给currentDomainName
      this.currentDomainName = data.name
      // 赋值
      this.dnsQueryParams.id = data.id
      this.getDns()
    },

    /* 获取域名服务商和域名 */
    getList() {
      getDomainServiceProviderList().then((res) => {
        this.treeData[0].children = res.data
      })
      this.getDomains()
    },

    // 获取域名列表
    getDomains() {
      getDomainList(this.queryParams).then((res) => {
        this.tableData = res.data.items
        this.total = res.data.total
        this.loading = false
      }).finally(() => {
        this.loading = false
      })
    },

    // 获取域名DNS解析列表
    getDns() {
      this.loading = true
      // 获取域名DNS解析列表
      getDomainDnsList(this.dnsQueryParams).then((res) => {
        this.dnsTableData = res.data.items
        this.dnsTotal = res.data.total
        this.loading = false
      }).finally(() => {
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

    /* DNS 解析列表 page size变化 */
    handleDnsPageSizeChange(newSize) {
      this.dnsQueryParams.limit = newSize
      this.getDns()
    },

    /* DNS 解析列表 page number的变化 */
    handleDnsPageChange(newPage) {
      this.dnsQueryParams.page = newPage
      this.getDns()
    },

    /* 点击节点树时 */
    handleNodeClick(data, node) {
      if (node.level === 1) {
        this.queryParams.provider_id = ''
      } else {
        this.queryParams.provider_id = data.id
      }
      this.queryParams.page = 1
      this.queryParams.limit = 10
      this.queryParams.name = ''
      this.getDomains()
    },

    /* 节点树右边按钮渲染 */
    renderContent(h, { node, data, store }) {
      return (
        <span class='custom-tree-node'>
          <span>{node.label}</span>
          {node.level === 1 && (
            <span>
              <el-button size='mini' type='text' on-click={ (event) => {
                event.stopPropagation()
                this.append(data)
              }}>新增</el-button>
            </span>
          )}
          {node.level === 2 && (
            <span>
              <el-button size='mini' type='text' on-click={ (event) => {
                event.stopPropagation()
                this.delete(data)
              }}>删除</el-button>
              <el-button size='mini' type='text' on-click={ (event) => {
                event.stopPropagation()
                this.update(data)
              }}>修改</el-button>
              <el-button size='mini' type='text' on-click={ (event) => {
                event.stopPropagation()
                this.sync(data)
              }}>同步</el-button>
            </span>
          )}
        </span>
      )
    },

    /* 新增域名服务商 */
    append() {
      // 打开Dialog
      this.domainProviderAddDialog = true
      // 更改Dialog标题
      this.formTitle = '新增域名服务商'
    },

    /* 修改DNS解析状态 */
    handlePauseDns(data, callback) {
      data['domain_id'] = this.dnsQueryParams.id
      changeDnsStatus(data).then((res) => {
        Message({
          message: res.msg,
          type: 'success',
          duration: 1000
        })
        callback(true)
      }).catch(() => {
        callback(false)
      }).finally(() => {
        callback(false)
      })
    },

    /* 新增DNS解析 */
    handleAddDns(data) {
      // 打开Dialog
      this.dnsAddDialog = true
      // 更改Dialog标题
      this.formTitle = '新增DNS解析'
    },

    /* 修改DNS解析 */
    handleEditDns(data) {
      // 打开Dialog
      this.dnsAddDialog = true
      // 更改Dialog标题
      this.formTitle = 'DNS解析修改'
      // 将当节点数据赋值给currentValue
      this.currentValue = JSON.parse(JSON.stringify(data))
    },

    /* 同步域名服务商 */
    sync(data) {
      this.$confirm('点击确认将从服务商处同步域名信息到本地，点击了解详细<a href="javascript:;" id="handleRuleDetails" style="color: #66b1ff;">同步规则</a>。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        dangerouslyUseHTMLString: true,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '同步中...'
            syncDomain({ provider_id: data.id }).then((res) => {
              if (res.code === 0) {
                Message({
                  message: res.msg,
                  type: 'success',
                  duration: 1000
                })
                instance.confirmButtonLoading = false
                done()
                // 获取最新数据
                this.getDomains()
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

      // 添加事件监听器
      this.$nextTick(() => {
        const link = document.getElementById('handleRuleDetails')
        if (link) {
          link.addEventListener('click', this.handleRuleDetails)
        }
      })
    },

    /* 打开域名同步规则 */
    handleRuleDetails() {
      this.domainSyncRuleDialog = true
    },

    /* 修改域名服务商 */
    update(data) {
      // 打开Dialog
      this.domainProviderAddDialog = true
      // 更改Dialog标题
      this.formTitle = '修改域名服务商'
      // 将当节点数据赋值给currentValue
      this.currentValue = JSON.parse(JSON.stringify(data))
    },

    /* 删除域名DNS解析 */
    handleDeleteDns(data) {
      data['domain_id'] = this.dnsQueryParams.id
      this.$confirm('点击确认当前域名的DNS解析记录将从域名服务商处永久删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            deleteDns(data).then((res) => {
              if (res.code === 0) {
                Message({
                  message: res.msg,
                  type: 'success',
                  duration: 1000
                })
                instance.confirmButtonLoading = false
                done()
                // 获取最新数据
                this.getDns()
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

    /* 删除域名服务商 */
    delete(data) {
      this.$confirm('点击确认当前域名服务商将从本系统永久删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            deleteDomainServiceProvider(data).then((res) => {
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

    /* 新增域名 */
    handleAddDomain() {
      // 打开Dialog
      this.domainAddDialog = true
      // 更改Dialog标题
      this.formTitle = '新增域名'
    },

    /* 编辑域名 */
    handleEditDomain(rowData) {
      // 打开Dialog
      this.domainAddDialog = true
      // 更改Dialog标题
      this.formTitle = '修改域名'
      // 将当前行数据赋值给currentValue
      this.currentValue = JSON.parse(JSON.stringify(rowData))
    },

    /* 表单关闭 */
    handleClose() {
      // 关闭所有Dialog
      this.domainAddDialog = false
      this.domainProviderAddDialog = false
      this.dnsAddDialog = false
      this.domainDnsDialog = false
      // 清空表单及空梭框数据
      this.currentValue = undefined
      this.dnsTableData = []
      // 关闭loading状态
      this.loading = false
      // 清空校验规则
      this.$refs.form.$refs.form.resetFields()
      // 获取最新数据
      this.getList()
    },

    /* 表单关闭 */
    handleClose2() {
      this.dnsAddDialog = false
      this.loading = false
      // 清空校验规则
      this.$refs.form.$refs.form.resetFields()
      // 获取最新数据
      this.getDns()
    },

    /* 删除域名 */
    handleDelete(rowData) {
      this.$confirm('点击确认当前域名将从系统中删除，不会从域名服务商处删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            deleteDomain(rowData).then((res) => {
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

    /* 域名新增和修改 */
    handleDomainSubmit(formData) {
      this.loading = true
      // 使用id进行判断，有id表示修改，没有表示新增
      if (formData.id) {
        // 更新域名服务商
        changeDomain(formData).then((res) => {
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
        // 添加域名服务商
        addDomain(formData).then((res) => {
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

    /* 域名服务商新增和修改 */
    handleProviderSubmit(formData) {
      this.loading = true
      // 使用id进行判断，有id表示修改，没有表示新增
      if (formData.id) {
        // 更新域名服务商
        changeDomainServiceProvider(formData).then((res) => {
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
        // 添加域名服务商
        addDomainServiceProvider(formData).then((res) => {
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

    /* DNS解析记录新增和修改 */
    handleDNsSubmit(formData) {
      this.loading2 = true
      formData['domain_id'] = this.dnsQueryParams.id
      // 使用id进行判断，有id表示修改，没有表示新增
      if (formData.record_id) {
        // 更新域名DNS解析
        changeDns(formData).then((res) => {
          if (res.code === 0) {
            Message({
              message: res.msg,
              type: 'success',
              duration: 1000
            })
            this.loading2 = false
            this.dnsAddDialog = false
            this.getDns()
          }
        }, () => {
          this.loading2 = false
        })
      } else {
        // 添加域名DNS解析
        addDns(formData).then((res) => {
          if (res.code === 0) {
            Message({
              message: res.msg,
              type: 'success',
              duration: 1000
            })
            this.loading2 = false
            this.dnsAddDialog = false
            this.getDns()
          }
        }, () => {
          this.loading2 = false
        })
      }
    }
  }
}
</script>

<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .empty-message {
    color: #999;
    font-size: 12px;
    margin-bottom: 5px;
    padding-left: 24px;
  }
</style>

<style scoped>
.settings-wrapper {
    background-color: #f5f5f5;
    padding: 20px;
}

.settings-container {
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.content-container {
  padding-left: 30px;
  overflow-y: auto;
  overflow-x: hidden;
}

.equal-height-row {
  display: flex;
  align-items: stretch;
}
</style>
