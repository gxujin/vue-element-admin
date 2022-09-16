import request from '@/utils/request'

export function captcha(r) {
  return request({
    url: '/vue-element-admin/user/imgCode',
    method: 'get',
    params: { r }
    // responseType: 'arraybuffer'
  })
}

export function login(data) {
  return request({
    url: '/vue-element-admin/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-element-admin/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}

export function getUserRes() {
  return request({
    url: '/pms/api/account/acc-res',
    method: 'get'
  })
}
