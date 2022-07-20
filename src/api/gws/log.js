import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/gws/api/apiLog/list',
    method: 'get',
    params: query
  })
}
export function fetchLogInfo(query) {
  return request({
    url: '/gws/api/apiLog/info',
    method: 'get',
    params: query
  })
}
