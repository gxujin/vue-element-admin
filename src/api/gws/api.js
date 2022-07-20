import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/gws/api/api/list',
    method: 'get',
    params: query
  })
}
export function createApi(data) {
  return request({
    url: '/gws/api/api/save',
    method: 'post',
    data
  })
}
export function updateApi(data) {
  return request({
    url: '/gws/api/api/update',
    method: 'post',
    data
  })
}
export function deleteApi(data) {
  return request({
    url: '/gws/api/api/delete',
    method: 'post',
    data
  })
}
export function syncRedis(data) {
  return request({
    url: '/gws/api/api/syncRedis',
    method: 'post',
    data
  })
}
export function fetchAuthApp(query) {
  return request({
    url: '/gws/api/api/api-auth-data',
    method: 'get',
    params: query
  })
}
export function saveAuth(data) {
  return request({
    url: '/gws/api/api/add-auth',
    method: 'post',
    data
  })
}
export function fetchAuthApi(query) {
  return request({
    url: '/gws/api/api/app-authApiList',
    method: 'get',
    params: query
  })
}
export function removeApiAuth(data) {
  return request({
    url: '/gws/api/api/remove-auth',
    method: 'post',
    data
  })
}
