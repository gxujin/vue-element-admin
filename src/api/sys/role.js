import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/pms/api/role/list',
    method: 'get',
    params: query
  })
}

export function createRole(data) {
  return request({
    url: '/pms/api/role/insert',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/pms/api/role/update',
    method: 'post',
    data
  })
}

export function deleteRole(query) {
  return request({
    url: '/pms/api/role/delete',
    method: 'get',
    params: query
  })
}
