import request from '@/utils/request'

// 获取所有配置
export function getSettings() {
  return request({
    url: '/api/v1/settings',
    method: 'get'
  })
}

// 获取 Logo
export function getLogo() {
  return request({
    url: '/api/v1/settings/site/logo',
    method: 'get'
  })
}

// 修改配置
export function updateSettings(data) {
  return request({
    url: '/api/v1/settings',
    method: 'put',
    data
  })
}

// 密钥及证书更换
export function updateCert(data) {
  return request({
    url: '/api/v1/settings/cert',
    method: 'put',
    data
  })
}

// 发送测试邮件
export function sendMail(data) {
  return request({
    url: '/api/v1/settings/test/mailSend',
    method: 'post',
    data
  })
}

// 发送测试短信
export function sendSms(data) {
  return request({
    url: '/api/v1/settings/test/smsSend',
    method: 'post',
    data
  })
}

// 密钥测试
export function certTest(data) {
  return request({
    url: '/api/v1/settings/test/certTest',
    method: 'post',
    data
  })
}

// LDAP 登录测试
export function ldapLogin(data) {
  return request({
    url: '/api/v1/settings/test/ldapLogin',
    method: 'post',
    data
  })
}
