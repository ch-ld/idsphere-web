<template>
  <div class="table-column-setting">
    <!-- 列设置按钮 -->
    <el-button type="text" @click="columnSettingVisible = true">
      <i class="el-icon-setting" />
      列设置
    </el-button>

    <!-- 列设置对话框 -->
    <el-dialog
      title="列设置"
      :visible.sync="columnSettingVisible"
      width="400px"
      append-to-body
    >
      <div class="column-setting-content">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>

        <div class="column-list">
          <el-checkbox-group v-model="checkedColumns" @change="handleCheckedChange">
            <div
              v-for="col in availableColumns"
              :key="col.prop"
              class="column-item"
              :class="{ 'is-fixed': col.fixed }"
            >
              <el-checkbox
                :label="col.prop"
                :disabled="col.fixed"
              >
                {{ col.label }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>

      <div slot="footer">
        <el-button @click="columnSettingVisible = false">取 消</el-button>
        <el-button @click="resetColumns">重 置</el-button>
        <el-button type="primary" @click="saveColumns">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TableColumnSetting',

  props: {
    columns: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      columnSettingVisible: false,
      checkAll: false,
      isIndeterminate: false,
      checkedColumns: [],
      originalSettings: {} // 保存原始设置用于取消操作
    }
  },

  computed: {
    // 可配置的列（排除固定列）
    availableColumns() {
      return this.columns.filter(col => col.label && !col.type)
    }
  },

  watch: {
    columnSettingVisible(val) {
      if (val) {
        this.initColumnSettings()
      }
    }
  },

  methods: {
    // 初始化列设置
    initColumnSettings() {
      this.checkedColumns = this.columns
        .filter(col => col.visible !== false && !col.type)
        .map(col => col.prop)

      this.originalSettings = { ...this.checkedColumns }
      this.updateCheckStatus()
    },

    // 更新全选状态
    updateCheckStatus() {
      const checkedCount = this.checkedColumns.length
      const totalCount = this.availableColumns.length

      this.checkAll = checkedCount === totalCount
      this.isIndeterminate = checkedCount > 0 && checkedCount < totalCount
    },

    // 处理全选变化
    handleCheckAllChange(val) {
      this.checkedColumns = val
        ? this.availableColumns.map(col => col.prop)
        : []
      this.isIndeterminate = false
    },

    // 处理列选择变化
    handleCheckedChange(value) {
      this.updateCheckStatus()
    },

    // 重置列设置
    resetColumns() {
      this.checkedColumns = this.columns
        .filter(col => col.visible !== false && !col.type)
        .map(col => col.prop)
      this.updateCheckStatus()
    },

    // 保存列设置
    saveColumns() {
      const settings = {}
      this.columns.forEach(col => {
        if (!col.type && !col.fixed) {
          settings[col.prop] = this.checkedColumns.includes(col.prop)
        }
      })

      this.$emit('update-columns', settings)
      this.columnSettingVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.table-column-setting {
  display: inline-block;

  .column-setting-content {
    padding: 10px 0;
  }

  .column-list {
    margin-top: 15px;
    max-height: 300px;
    overflow-y: auto;
    padding: 0 10px;

    .column-item {
      padding: 8px 0;
      border-bottom: 1px solid #EBEEF5;

      &:last-child {
        border-bottom: none;
      }

      &.is-fixed {
        opacity: 0.7;
      }
    }
  }
}
</style>
