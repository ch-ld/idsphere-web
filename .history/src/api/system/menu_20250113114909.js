import request from '@/utils/request'

// 获取菜单列表
export function getMenuList(params) {
  return request({
    url: '/api/v1/menus',
    method: 'get',
    params
  })
}

// 获取所有菜单
export function getMenuListAll() {
  return request({
    url: '/api/v1/menu/list',
    method: 'get'
  })
}

// 创建菜单
export function createMenu(data) {
  return request({
    url: '/api/v1/menus',
    method: 'post',
    data
  })
}

// 更新菜单
export function updateMenu(id, data) {
  return request({
    url: `/api/v1/menus/${id}`,
    method: 'put',
    data
  })
}

// 删除菜单
export function deleteMenu(id) {
  return request({
    url: `/api/v1/menus/${id}`,
    method: 'delete'
  })
}

// 更新菜单排序
export function updateMenuSort(id, sort) {
  return request({
    url: `/api/v1/menus/${id}/sort`,
    method: 'put',
    data: { sort }
  })
}

// 创建子菜单
export function createSubMenu(data) {
  return request({
    url: '/api/v1/submenus',
    method: 'post',
    data
  })
}

// 更新子菜单
export function updateSubMenu(id, data) {
  return request({
    url: `/api/v1/submenus/${id}`,
    method: 'put',
    data
  })
}

// 删除子菜单
export function deleteSubMenu(id) {
  return request({
    url: `/api/v1/submenus/${id}`,
    method: 'delete'
  })
}

// 更新子菜单排序
export function updateSubMenuSort(id, sort) {
  return request({
    url: `/api/v1/submenus/${id}/sort`,
    method: 'put',
    data: { sort }
  })
}
