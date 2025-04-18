import request from '@/utils/request'

// 新增
export function addUrl(data) {
  return request({
    url: '/api/v1/url',
    method: 'post',
    data
  })
}

// 删除
export function deleteUrl(data) {
  return request({
    url: '/api/v1/url/' + data.id,
    method: 'delete'
  })
}

// 修改
export function changeUrl(data) {
  return request({
    url: '/api/v1/url',
    method: 'put',
    data
  })
}

// 获取列表
export function getUrlList(params) {
  return request({
    url: '/api/v1/urls',
    method: 'get',
    params
  })
}

// 证书检查
export function certificateCheck(data) {
  return request({
    url: '/api/v1/url/check',
    method: 'post',
    data
  })
}
