<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.appName" placeholder="应用方名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column prop="APP_ID" sortable label="应用方ID" min-width="150px" />
      <el-table-column prop="APP_NAME" label="应用方名称" min-width="150px" />
      <el-table-column prop="APP_KEY" label="密钥" min-width="150px" />
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

        <el-form-item label="应用方ID" prop="appId">
          <el-input v-model="temp.appId" maxlength="10" :disabled="dialogStatus==='create'?false:true" placeholder="请输入应用方ID" />
        </el-form-item>
        <el-form-item label="应用方名称" prop="appName">
          <el-input v-model="temp.appName" maxlength="20" placeholder="请输入应用方名称" />
        </el-form-item>
        <el-form-item label="请求过期时间" prop="expireTime">
          <el-input v-model.number="temp.expireTime" placeholder="0 表示请求永不过期" maxlength="10">
            <i slot="suffix" style="font-style:normal;">秒</i>
          </el-input>

        </el-form-item>
        <el-form-item label="应用类型" prop="appType">
          <el-select v-model="temp.appType" class="filter-item" placeholder="请选择应用类型">
            <el-option v-for="(value,name) in appTypeDic" :key="name" :label="value" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥" prop="appKey">
          <el-input v-model="temp.appKey" placeholder="自动生成..." />
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
      <el-table
        :key="auth.tableKey"
        v-loading="auth.listLoading"
        :data="auth.list"
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
        <el-table-column prop="API_CODE" label="API代码" min-width="100px" />
        <el-table-column prop="API_NAME" label="API名称" min-width="100px" />
        <el-table-column prop="API_URL" label="URL" min-width="100px" />
        <el-table-column prop="REMARK" label="备注" min-width="100px" :show-overflow-tooltip="showOverflowTooltip" />
        <el-table-column label="操作" align="center" min-width="100px" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button type="text" size="mini" @click="removeAuth(row,$index)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="auth.total>0" :total="auth.total" :page.sync="auth.listQuery.page" :limit.sync="auth.listQuery.limit" @pagination="getAuthList" />
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createApp, updateApp, deleteApp, syncRedis } from '@/api/gws/app'
import { fetchAuthApi, removeApiAuth } from '@/api/gws/api'
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
      auth: {
        tableKey: 1,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          appId: ''
        }
      },
      showOverflowTooltip: true,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        appName: undefined,
        status: ''
      },
      statusDic,
      appTypeDic,
      temp: {
        appId: undefined,
        appName: '',
        expireTime: '',
        appType: '',
        appKey: '',
        status: '1',
        remark: ''
      },
      dialogAuthVisible: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑应用方',
        create: '添加应用方',
        auth: '授权API'
      },
      rules: {
        appId: [
          { required: true, message: '应用方ID不能为空', trigger: 'change' },
          { pattern: /^([0-9a-zA-Z]){1,10}$/, message: '应用方ID仅支持英文、数字', trigger: 'change' }
        ],
        appName: [
          { required: true, message: '应用方名称不能为空', trigger: 'change' }
        ],
        expireTime: [{ required: true, message: '请求过期时间不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
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
    getAuthList() {
      this.auth.listLoading = true
      fetchAuthApi(this.auth.listQuery).then(response => {
        this.auth.list = response.data
        this.auth.total = response.count
        this.auth.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        appId: undefined,
        appName: '',
        expireTime: '0',
        appType: '',
        appKey: '',
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
          createApp(tempData).then((res) => {
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
      this.temp.appId = row.APP_ID
      this.temp.appName = row.APP_NAME
      this.temp.expireTime = row.EXPIRE_TIME
      this.temp.appType = row.APP_TYPE
      this.temp.appKey = row.APP_KEY
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
          updateApp(tempData).then(() => {
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
        deleteApp({ id: row.APP_ID }).then(() => {
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
      this.$confirm('批量同步应用方数据至redis, 是否继续?', '提示', {
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
      this.dialogStatus = 'auth'
      this.dialogAuthVisible = true
      this.auth.listQuery.appId = row.APP_ID
      this.getAuthList()
    },
    removeAuth(row, index) {
      this.$confirm('此操作将移除API授权, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeApiAuth({ id: row.AUTH_ID }).then(() => {
          this.auth.list.splice(index, 1)
        })
      }).catch(() => {
      })
    }
  }
}
</script>
