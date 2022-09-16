import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-element-admin/coupon/list',
    method: 'get',
    params: query
  })
}

export function fetchRecordList(query) {
  return request({
    url: '/vue-element-admin/coupon/records',
    method: 'get',
    params: query
  })
}
