import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/gws/api/app/list',
    method: 'get',
    params: query
  })
}
export function createApp(data) {
  return request({
    url: '/gws/api/app/save',
    method: 'post',
    data
  })
}
export function updateApp(data) {
  return request({
    url: '/gws/api/app/update',
    method: 'post',
    data
  })
}
export function deleteApp(data) {
  return request({
    url: '/gws/api/app/delete',
    method: 'post',
    data
  })
}
export function syncRedis(data) {
  return request({
    url: '/gws/api/app/syncRedis',
    method: 'post',
    data
  })
}
