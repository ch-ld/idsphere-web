// api/host/hostGroup.js
import request from '@/utils/request'

export function getHostGroups(params) {
  return request({
    url: '/api/v1/host-groups',
    method: 'get',
    params
  })
}

export function createHostGroup(data) {
  return request({
    url: '/api/v1/host-group',
    method: 'post',
    data
  })
}

export function updateHostGroup(id, data) {
  return request({
    url: `/api/v1/host-group/${id}`,
    method: 'put',
    data
  })
}

export function deleteHostGroup(id) {
  return request({
    url: `/api/v1/host-group/${id}`,
    method: 'delete'
  })
}
