<template>
  <div>
    <el-form ref="form" :inline="true">
      <el-form-item label="关键字：">
        <el-input v-model="form.keyWord" placeholder="输入关键字" size="small" prefix-icon="el-icon-search" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="searchList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAddDns">新增</el-button>
      </el-col>
    </el-row>
    <el-table :data="tableData" tooltip-effect="dark" style="width: 100%; margin-top:10px;" size="mini" border>
      <el-table-column type="selection" width="40" />
      <el-table-column show-overflow-tooltip prop="rr" label="主机记录" min-width="2%" />
      <el-table-column prop="type" label="记录类型" min-width="2%" />
      <el-table-column show-overflow-tooltip prop="value" label="记录值 | MX记录优先级" min-width="3%">
        <template slot-scope="scope">
          <div v-for="(item, index) in scope.row.value.split(',')" :key="index">
            <template v-if="scope.row.type === 'MX' && item.includes(' ')">
              {{ item.split(' ')[1] }} | {{ item.split(' ')[0] }}
            </template>
            <template v-else>
              {{ item }}
            </template>
          </div>
          <span v-if="scope.row.type === 'MX' && scope.row.priority">| {{ scope.row.priority }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ttl" label="TTL（秒）" min-width="2%" />
      <el-table-column prop="status" label="状态" min-width="2">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'ENABLE' ? 'success' : 'danger'" size="mini">{{ scope.row.status === 'ENABLE' ? '启用' : '暂停' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="权重" min-width="1%" />
      <el-table-column :formatter="dateFormat" prop="create_at" label="创建时间" min-width="3%" />
      <el-table-column show-overflow-tooltip prop="remark" label="备注" min-width="3%" />
      <el-table-column label="操作" min-width="3%" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
          <el-button :loading="scope.row.loading" size="mini" type="text" @click="handdlePause(scope.row)">{{ scope.row.status === 'ENABLE' ? '暂停' : '启用' }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'DnsListTable',
  props: {
    form: {
      type: Object,
      default() {
        return {}
      }
    },
    tableData: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      loading: false
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

    /* 关键字查询 */
    searchList() {
      this.$emit('search')
    },

    /* 新增按钮 */
    handleAddDns() {
      this.$emit('add')
    },

    /* 编辑按钮 */
    handleEdit(value) {
      this.$emit('edit', value)
    },

    /* 暂停按钮 */
    handdlePause(value) {
      const valueCopy = { ...value }
      this.$set(value, 'loading', true)
      valueCopy.status = value.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
      this.$emit('pause', valueCopy, (success) => {
        this.$set(value, 'loading', false)
        if (success) {
          value.status = valueCopy.status
        }
      })
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
