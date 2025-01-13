import request from '@/utils/request'

// 获取目录列表
export function listDirectory(params) {
  return request({
    url: '/api/v1/sftp/list',
    method: 'get',
    params
  })
}

// 上传文件
export function uploadFile(data) {
  return request({
    url: '/api/v1/sftp/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载文件
export function downloadFile(params) {
  return request({
    url: '/api/v1/sftp/download',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 创建目录
export function createDirectory(data) {
  return request({
    url: '/api/v1/sftp/mkdir',
    method: 'post',
    data
  })
}

// 删除文件或目录
export function deletePath(data) {
  return request({
    url: '/api/v1/sftp/delete',
    method: 'post',
    data
  })
}
