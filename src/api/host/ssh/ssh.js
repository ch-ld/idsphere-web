// src/api/ssh.js
import request from '@/utils/request'

export function executeCommand(data) {
  return request({
    url: '/api/v1/ssh/command',
    method: 'post',
    data
  })
}

export function getWebSSHUrl(params) {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const baseApi = process.env.VUE_APP_BASE_API
  const url = new URL(baseApi)
  const serverAddress = `${url.hostname}${url.port ? ':' + url.port : ''}`
  // const host = window.location.host
  // 将 token 添加到 params 中
  console.log('params---request:', params)
  return `${wsProtocol}//${serverAddress}/api/v1/ssh/webssh?${new URLSearchParams(params)}`
}
