import request from '@/utils/request'

// 获取站点列表（表格）
export function getGroupList(params) {
  return request({
    url: '/api/v1/sites',
    method: 'get',
    params
  })
}

// 获取站点列表（站点导航）
export function getSiteGuideList(params) {
  return request({
    url: '/api/v1/site/guide',
    method: 'get',
    params
  })
}

// 新增站点分组
export function addGroup(data) {
  return request({
    url: '/api/v1/site/group',
    method: 'post',
    data
  })
}

// 新增站点
export function addSite(data) {
  return request({
    url: '/api/v1/site',
    method: 'post',
    data
  })
}

// 删除站点分组
export function deleteGroup(data) {
  return request({
    url: '/api/v1/site/group/' + data.id,
    method: 'delete'
  })
}

// 删除站点
export function deleteSite(data) {
  return request({
    url: '/api/v1/site/' + data.id,
    method: 'delete'
  })
}

// 修改站点分组
export function changeGroup(data) {
  return request({
    url: '/api/v1/site/group',
    method: 'put',
    data
  })
}

// 修改站点用户
export function changeSiteUser(data) {
  return request({
    url: '/api/v1/site/users',
    method: 'put',
    data
  })
}

// 修改站点标签
export function changeSiteTags(data) {
  return request({
    url: '/api/v1/site/tags',
    method: 'put',
    data
  })
}

// 获取标签
export function getTags(name) {
  return request({
    url: '/api/v1/tag/list?name=' + name,
    method: 'get'
  })
}

// 修改站点
export function changeSite(data) {
  return request({
    url: '/api/v1/site',
    method: 'put',
    data
  })
}
