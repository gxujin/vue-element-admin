<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.apiName" placeholder="API名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="" icon="el-icon-refresh" @click="handleFilter">
        重置
      </el-button>
    </div>

    <el-button type="primary" style="margin-bottom: 5px;" icon="el-icon-edit" @click="handleCreate">
      新增
    </el-button>
    <el-button type="primary" style="margin-bottom: 5px;" icon="el-icon-finished" @click="handleRedis">
      批量同步redis
    </el-button>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column prop="API_CODE" sortable label="API代码" min-width="150px" />
      <el-table-column prop="API_NAME" label="API名称" min-width="150px" />
      <el-table-column prop="API_URL" label="URL" min-width="150px" />
      <el-table-column label="状态" align="center" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.STATUS | statusFilter">
            {{ row.STATUS | statusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="REMARK" label="备注" min-width="150px" :show-overflow-tooltip="showOverflowTooltip" />
      <el-table-column label="操作" fixed="right" align="center" min-width="200px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="warning" size="mini" @click="handleAuth(row)">
            授权
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="API代码" prop="apiCode">
          <el-input v-model="temp.apiCode" maxlength="10" :disabled="dialogStatus==='create'?false:true" placeholder="请输入API代码" />
        </el-form-item>
        <el-form-item label="API名称" prop="apiName">
          <el-input v-model="temp.apiName" maxlength="20" placeholder="请输入API名称" />
        </el-form-item>
        <el-form-item label="URL" prop="apiUrl">
          <el-input v-model="temp.apiUrl" maxlength="100" placeholder="请输入URL" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择状态">
            <el-option v-for="(value,name) in statusDic" :key="name" :label="value" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" maxlength="100" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogAuthVisible">
      <el-transfer
        v-model="auth.authAppData"
        :props="{
          key: 'value',
          label: 'title'
        }"
        :data="auth.noauthAppData"
        :titles="['应用列表', '已授权应用']"
        target-order="push"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAuthVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="saveAuth">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createApi, updateApi, deleteApi, syncRedis, fetchAuthApp, saveAuth } from '@/api/gws/api'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

const statusDic = {
  '0': '停用',
  '1': '正常'
}
const appTypeDic = {
  '0': '自行车',
  '1': '图书馆',
  '2': '旅游'
}

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '1': 'success',
        '0': 'danger'
      }
      return statusMap[status]
    },
    statusNameFilter(status) {
      return statusDic[status]
    }
  },
  data() {
    return {
      showOverflowTooltip: true,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        apiName: undefined,
        status: ''
      },
      statusDic,
      appTypeDic,
      temp: {
        apiCode: undefined,
        apiName: '',
        apiUrl: '',
        status: '1',
        remark: ''
      },
      dialogAuthVisible: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑API',
        create: '添加API',
        auth: '授权应用'
      },
      rules: {
        apiCode: [
          { required: true, message: 'API代码不能为空', trigger: 'change' },
          { pattern: /^([0-9a-zA-Z]){1,10}$/, message: '应用方ID仅支持英文、数字', trigger: 'change' }
        ],
        apiName: [
          { required: true, message: 'API名称不能为空', trigger: 'change' }
        ],
        apiUrl: [
          { required: true, message: 'URL不能为空', trigger: 'change' }
        ],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      },
      auth: {
        authApiCode: '',
        noauthAppData: [],
        authAppData: []
      }
    }
  },
  watch: {
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.count
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        apiCode: undefined,
        apiName: '',
        apiUrl: '',
        status: '1',
        remark: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          createApi(tempData).then((res) => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp.apiCode = row.API_CODE
      this.temp.apiName = row.API_NAME
      this.temp.apiUrl = row.API_URL
      this.temp.status = row.STATUS
      this.temp.remark = row.REMARK
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateApi(tempData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该应用方, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteApi({ id: row.API_CODE }).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
        })
      }).catch(() => {
      })
    },
    handleRedis() {
      this.$confirm('批量同步API数据至redis, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        syncRedis({ }).then(() => {
          this.$notify({
            title: '成功',
            message: '同步成功',
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
      })
    },
    handleAuth(row) {
      const apiCode = row.API_CODE
      this.auth.authApiCode = apiCode
      fetchAuthApp({ id: apiCode }).then(response => {
        const data = response.data || {}
        const { appList, authAppList } = data
        this.auth.noauthAppData = appList
        this.auth.authAppData = authAppList
      }).then(() => {
        this.dialogStatus = 'auth'
        this.dialogAuthVisible = true
      })
    },
    saveAuth() {
      const tempData = {
        apiCode: this.auth.authApiCode,
        appId: this.auth.authAppData.join(',')
      }
      saveAuth(tempData).then(() => {
        this.dialogAuthVisible = false
        this.$notify({
          title: '成功',
          message: '授权成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
