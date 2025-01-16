<template>
  <div class="settings-wrapper">
    <div class="settings-container">
      <el-row class="equal-height-row">
        <!-- 左侧导航菜单 -->
        <el-col :span="6">
          <el-menu
            :default-active="currentMenu"
            style="height: 100%;"
            @select="handleMenuSelect"
          >
            <el-menu-item index="site">站点基本配置</el-menu-item>
            <el-menu-item index="security">安全设置</el-menu-item>
            <el-menu-item index="ldap">LDAP 设置</el-menu-item>
            <el-menu-item index="password">用户密码策略</el-menu-item>
            <el-menu-item index="certificate">密钥证书管理</el-menu-item>
            <el-menu-item index="sms">短信配置</el-menu-item>
            <el-menu-item index="mail">发件服务器</el-menu-item>
            <el-menu-item index="dingtalk">钉钉应用</el-menu-item>
            <el-menu-item index="wechat">企业微信应用</el-menu-item>
            <el-menu-item index="feishu">飞书应用</el-menu-item>
            <el-menu-item index="about">关于</el-menu-item>
          </el-menu>
        </el-col>

        <!-- 右侧内容区域 -->
        <el-col :span="18" class="content-container">
          <site-form v-if="currentMenu === 'site'" :form="settings" @submit="handleSubmit" />
          <security-form v-if="currentMenu === 'security'" :form="settings" @submit="handleSubmit" />
          <ldap-form v-if="currentMenu === 'ldap'" :form="settings" @submit="handleSubmit" />
          <password-form v-if="currentMenu === 'password'" :form="settings" @submit="handleSubmit" />
          <Certificate-form v-if="currentMenu === 'certificate'" :form="settings" @submit="handleSubmit" @sub="handleCertSubmit" />
          <sms-form v-if="currentMenu === 'sms'" :form="settings" @submit="handleSubmit" />
          <mail-form v-if="currentMenu === 'mail'" :form="settings" @submit="handleSubmit" />
          <dingtalk-form v-if="currentMenu === 'dingtalk'" :form="settings" @submit="handleSubmit" />
          <wechat-form v-if="currentMenu === 'wechat'" :form="settings" @submit="handleSubmit" />
          <feishu-form v-if="currentMenu === 'feishu'" :form="settings" @submit="handleSubmit" />
          <about v-if="currentMenu === 'about'" :form="settings" @submit="handleSubmit" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getSettings, updateSettings, updateCert } from '@/api/system/settings'
import SecurityForm from './security'
import LdapForm from './ldap'
import DingtalkForm from './dingtalk'
import FeishuForm from './feishu'
import WechatForm from './wechat'
import PasswordForm from './password'
import SmsForm from './sms'
import SiteForm from './site'
import CertificateForm from './certificate'
import MailForm from './mail'
import About from './about'

export default {
  components: {
    SecurityForm,
    LdapForm,
    DingtalkForm,
    FeishuForm,
    WechatForm,
    PasswordForm,
    SiteForm,
    MailForm,
    SmsForm,
    CertificateForm,
    About
  },
  data() {
    return {
      // 默认菜单
      currentMenu: 'site',
      // 配置信息
      settings: {}
    }
  },
  activated() {
    // activated 可以实现菜单切换时重新获取数据
    this.getSettings()
    this.currentMenu = 'site'
  },
  methods: {

    /* 获取数据 */
    getSettings() {
      getSettings().then((res) => {
        this.settings = res.data
      })
    },
    /* 菜单切换 */
    handleMenuSelect(key) {
      this.currentMenu = key
    },

    /* 表单提交 */
    handleSubmit(data, callback) {
      updateSettings(data).then((res) => {
        // 将执行的结果先返回给子组件
        callback(res)

        // 处理返回
        if (res.code === 0) {
          Message({
            message: res.msg,
            type: 'success',
            duration: 1000
          })
          this.getSettings()
        }
      }, () => {})
    },

    /* 证书密钥更新 */
    handleCertSubmit(data, callback) {
      updateCert(data).then((res) => {
        // 将执行的结果先返回给子组件
        callback(res)

        // 处理返回
        if (res.code === 0) {
          Message({
            message: res.msg,
            type: 'success',
            duration: 1000
          })
          this.getSettings()
        }
      }, () => {})
    }
  }
}
</script>

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
