import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/pms/api/account/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createUser(data) {
  return request({
    url: '/pms/api/account/insert',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/pms/api/account/update',
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/pms/api/account/delete',
    method: 'post',
    data
  })
}
