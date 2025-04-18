import request from '@/utils/request'

// 上传证书
export function uploadCertificate(data) {
  return request({
    url: '/api/v1/certificate/upload',
    method: 'post',
    data
  })
}

// 申请证书
export function requestCertificate(data) {
  return request({
    url: '/api/v1/certificate/request',
    method: 'post',
    data
  })
}

// 删除证书
export function deleteCertificate(data) {
  return request({
    url: '/api/v1/certificate/' + data.id,
    method: 'delete'
  })
}

// 获取证书列表
export function getCertificateList(params) {
  return request({
    url: '/api/v1/certificates',
    method: 'get',
    params
  })
}

// 下载证书
export function downloadCertificate(data) {
  return request({
    url: '/api/v1/certificate/' + data.id,
    method: 'get',
    responseType: 'blob'
  })
}
