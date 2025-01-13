
export default {
  data() {
    return {
      userColumnSettings: {}, // 用户的列设置
      columnSettingVisible: false // 控制列设置对话框显示
    }
  },

  computed: {
    // 处理后的列配置
    processedColumns() {
      return this.columns.map(col => ({
        ...col,
        visible: col.fixed ? true : (this.userColumnSettings[col.prop] !== undefined ? this.userColumnSettings[col.prop] : col.visible !== false)
      }))
    },

    // 可见的列
    visibleColumns() {
      return this.processedColumns.filter(col => col.visible)
    }
  },

  created() {
    // 初始化时加载用户列设置
    this.loadUserColumnSettings()
  },

  methods: {
    // 加载用户列设置
    loadUserColumnSettings() {
      try {
        const settings = localStorage.getItem(`table-columns-${this.$route.name}`)
        if (settings) {
          this.userColumnSettings = JSON.parse(settings)
        }
      } catch (e) {
        console.error('加载列设置失败:', e)
      }
    },

    // 保存用户列设置
    saveUserColumnSettings() {
      try {
        localStorage.setItem(
          `table-columns-${this.$route.name}`,
          JSON.stringify(this.userColumnSettings)
        )
      } catch (e) {
        console.error('保存列设置失败:', e)
      }
    }
  }
}
