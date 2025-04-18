<template>
  <el-table :data="tableData" tooltip-effect="dark" style="width: 100%; margin-top:10px;" size="mini" border @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="40" />
    <el-table-column show-overflow-tooltip prop="name" label="站点名称" min-width="5%" />
    <el-table-column show-overflow-tooltip prop="domain" label="域名" min-width="6%" />
    <el-table-column prop="port" label="端口" min-width="3%" />
    <el-table-column show-overflow-tooltip prop="ip_address" label="自定义 IP" min-width="5%" />
    <el-table-column prop="status" label="状态" min-width="4%">
      <template slot-scope="scope">
        <el-tag size="mini" :type="getStatusTagType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column :formatter="dateFormat" prop="expiration_at" label="过期时间" min-width="5%" />
    <el-table-column :formatter="dateFormat" prop="last_check_at" label="上次检查时间" min-width="5%" />
    <el-table-column label="操作" min-width="10%" align="center">
      <template slot-scope="scope">
        <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
        <el-button :loading="scope.row.loading" size="mini" type="text" @click="handleCheck(scope.row)">检查</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import moment from 'moment'

export default {
  name: 'UrlTable',
  props: {
    tableData: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  methods: {
    getStatusTagType(status) {
      const statusMap = {
        0: 'success',
        1: 'warning',
        2: 'error',
        null: 'info'
      }
      return statusMap[status]
    },

    getStatusText(status) {
      const textMap = {
        0: '正常',
        1: '检查异常',
        2: '已过期',
        null: '从未检查'
      }
      return textMap[status]
    },

    /* 编辑按钮 */
    handleEdit(value) {
      this.$emit('edit', value)
    },

    /* 删除按钮 */
    handleDelete(value) {
      this.$emit('delete', value)
    },

    /* 证书检查 */
    handleCheck(value) {
      this.$set(value, 'loading', true)
      this.$emit('check', value, (success) => {
        this.$set(value, 'loading', false)
      })
    },

    /* 日期时间格式化 */
    dateFormat: function(row, column) {
      const date = row[column.property]
      if (date === undefined || date === null) {
        return ''
      } else {
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  }
}
</script>

<style scoped>
.el-button-text {
    border-color: transparent;
    color: #606266;
    background: transparent;
    padding-left: 0;
    padding-right: 0;
}
</style>
