import request from '@/utils/request'

export function fetchAppDic(query) {
  return request({
    url: '/gws/api/app/getDic',
    method: 'get',
    params: query
  })
}

export function fetchApiDic(query) {
  return request({
    url: '/gws/api/api/getDic',
    method: 'get',
    params: query
  })
}
