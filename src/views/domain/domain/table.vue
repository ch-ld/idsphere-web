<template>
  <el-table :data="tableData" tooltip-effect="dark" style="width: 100%; margin-top:10px;" size="mini" border>
    <el-table-column type="selection" width="40" />
    <el-table-column prop="name" label="域名" min-width="2%" />
    <el-table-column :formatter="dateFormat" prop="registration_at" label="注册时间" min-width="2%" />
    <el-table-column :formatter="dateFormat" prop="expiration_at" label="到期时间" min-width="2%" />
    <el-table-column prop="domain_service_provider.name" label="服务提供商" min-width="2%" />
    <el-table-column label="操作" min-width="2%" align="center">
      <template slot-scope="scope">
        <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
        <el-button size="mini" type="text" @click="handleDNS(scope.row)">DNS解析</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import moment from 'moment'

export default {
  name: 'DomainListTable',
  props: {
    tableData: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  methods: {
    /* 日期时间格式化 */
    dateFormat: function(row, column) {
      const date = row[column.property]
      if (date === undefined || date === null) {
        return ''
      } else {
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
      }
    },

    /* 编辑按钮 */
    handleEdit(value) {
      this.$emit('edit', value)
    },

    /* 域名解析修改 */
    handleDNS(value) {
      this.$emit('dns', value)
    },

    /* 删除按钮 */
    handleDelete(value) {
      this.$emit('delete', value)
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
