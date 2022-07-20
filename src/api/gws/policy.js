import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/gws/api/policy/list',
    method: 'get',
    params: query
  })
}
export function createPolicy(data) {
  return request({
    url: '/gws/api/policy/save',
    method: 'post',
    data
  })
}
export function updatePolicy(data) {
  return request({
    url: '/gws/api/policy/update',
    method: 'post',
    data
  })
}
export function deletePolicy(data) {
  return request({
    url: '/gws/api/policy/delete',
    method: 'post',
    data
  })
}
export function syncRedis(data) {
  return request({
    url: '/gws/api/policy/syncRedis',
    method: 'post',
    data
  })
}
export function fetchNoAuthApi(query) {
  return request({
    url: '/gws/api/api/policy-apiList',
    method: 'get',
    params: query
  })
}
export function fetchAuthApi(query) {
  return request({
    url: '/gws/api/api/policy-authApiList',
    method: 'get',
    params: query
  })
}
export function bindApi(data) {
  return request({
    url: '/gws/api/policy/bindApi',
    method: 'post',
    data
  })
}
export function unbindApi(data) {
  return request({
    url: '/gws/api/policy/unbindApi',
    method: 'post',
    data
  })
}
