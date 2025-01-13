<template>
  <el-table
    ref="table"
    tooltip-effect="dark"
    style="width: 100%; margin-top:10px;"
    size="mini"
    border
    :data="tableData"
    :row-key="row => row.id"
    :expand-row-keys="expandRows"
    @expand-change="handleExpandChange"
  >
    <el-table-column type="expand" width="40">
      <template slot-scope="props">
        <!-- 二级菜单 -->
        <sub-menu-list-table
          :table-data="tableData[props.$index].SubMenus"
          @edit="handleSubMenuEdit"
          @refresh="$emit('refresh')"
        />
      </template>
    </el-table-column>
    <el-table-column prop="title" label="title" min-width="4%" />
    <el-table-column prop="name" label="name" min-width="4%" />
    <el-table-column prop="icon" label="icon" min-width="5%" />
    <el-table-column prop="path" label="path" min-width="10%" />
    <el-table-column prop="component" label="component" min-width="10%" />
    <el-table-column prop="sort" label="排序" min-width="3%" align="center" />
    <el-table-column label="操作" min-width="10%" align="center">
      <template slot-scope="scope">
        <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import SubMenuListTable from './sub-menu'
import { deleteMenu, updateMenuSort } from '@/api/system/menu'

export default {
  name: 'MenuListTable',
  components: {
    SubMenuListTable
  },
  props: {
    tableData: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      expandRows: []
    }
  },
  methods: {
    // 添加二级菜单编辑处理方法
    handleSubMenuEdit(value) {
      // 直接向上传递编辑事件
      this.$emit('edit', value)
    },
    /* 编辑按钮 */
    handleEdit(value) {
      // 确保设置正确的 type
      const editData = { ...value }
      editData.type = editData.menu_id ? 1 : 0
      this.$emit('edit', editData)
    },

    /* 删除按钮 */
    handleDelete(row) {
      this.$confirm('确认删除该菜单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMenu(row.id).then(res => {
          this.$message.success('删除成功')
          this.$emit('refresh')
        })
      })
    },

    /* 更新排序 */
    handleSort(row) {
      const data = { sort: row.sort }
      updateMenuSort(row.id, data).then(res => {
        this.$message.success('排序更新成功')
        this.$emit('refresh')
      })
    },

    /* 确保同时只展开一行 */
    handleExpandChange(row, expandedRows) {
      if (expandedRows.length > 1) {
        this.$refs.table.toggleRowExpansion(expandedRows[0])
      }
    }
  }
}
</script>
