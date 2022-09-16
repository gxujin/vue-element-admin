
const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  }
}

module.exports = [
  // user login
  {
    url: '/vue-element-admin/user/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 20000,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/vue-element-admin/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },
  {
    url: '/vue-element-admin/user/imgCode',
    type: 'get',
    response: config => {
      return {
        code: 20000,
        data: 'data:image/png;base64,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'
      }
    }
  },

  // user logout
  {
    url: '/vue-element-admin/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
