<template>
  <div class="app-container">
    <div class="table-page-search-wrapper">
      <el-form :model="listQuery" :inline="true" label-suffix=":">
        <el-form-item label="策略类型">
          <el-select v-model="listQuery.policyType" placeholder="请选择策略类型" clearable>
            <el-option
              v-for="(value,name) in policyTypeDic"
              :key="name"
              :label="value"
              :value="name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="策略名称">
          <el-input v-model="listQuery.policyName" placeholder="请输入策略名称" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item>
          <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
            查询
          </el-button>
          <el-button v-waves class="filter-item" style="margin-left: 10px;" type="" icon="el-icon-refresh" @click="clearListQuery">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-operator">
      <el-button type="primary" style="margin-bottom: 5px;" icon="el-icon-edit" @click="handleCreate">
        新增策略
      </el-button>
      <el-button type="primary" style="margin-bottom: 5px;" icon="el-icon-finished" @click="handleRedis">
        批量同步redis
      </el-button>
    </div>
    <div class="table-wrapper">
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
        <el-table-column prop="POLICY_TYPE" label="策略类型" align="center" width="100">
          <template slot-scope="{row}">
            {{ row.POLICY_TYPE | policyTypeFilter }}
          </template>
        </el-table-column>
        <el-table-column prop="POLICY_NAME" label="策略名称" min-width="150px" />
        <el-table-column prop="APP_NAME" label="应用名称" min-width="100px" />
        <el-table-column prop="API_DEFAULT" label="API流量限制" min-width="100px" />
        <el-table-column label="单位时间" align="center" width="100">
          <template slot-scope="{row}">
            {{ row.UNIT | unitFilter }}
          </template>
        </el-table-column>
        <el-table-column prop="REMARK" label="备注" min-width="100px" :show-overflow-tooltip="showOverflowTooltip" />
        <el-table-column label="操作" fixed="right" align="center" min-width="200px" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button type="warning" size="mini" @click="handleBind(row)">
              绑定API
            </el-button>
            <el-button type="danger" size="mini" @click="handleDelete(row,$index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="策略类型" prop="policyType">
          <el-select v-model="temp.policyType" placeholder="请选择策略类型">
            <template v-for="(value,name) in policyTypeDic">
              <el-option
                :key="name"
                :label="value"
                :value="name"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="策略名称" prop="policyName">
          <el-input v-model="temp.policyName" maxlength="20" placeholder="请输入应用方名称" />
        </el-form-item>
        <el-form-item label="应用方" prop="appId" :required="temp.policyType === '1' ? true : false">
          <el-select v-model="temp.appId" placeholder="请选择应用方">
            <template v-for="item in appDic">
              <el-option
                :key="item.code"
                :label="item.name"
                :value="item.code"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="单位时间" prop="unit">
          <el-select v-model="temp.unit" placeholder="请选择单位时间">
            <template v-for="(value,name) in unitDic">
              <el-option
                :key="name"
                :label="value"
                :value="name"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="API流量限制" prop="apiDefault">
          <el-input v-model.number="temp.apiDefault" maxlength="10" placeholder="请输入API流量限制">
            <i slot="suffix" style="font-style:normal;">次</i>
          </el-input>
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogBindVisible" width="80%">
      <el-row>
        <el-col :span="12">
          <el-card style="margin-right: 2px;">
            <div slot="header" class="clearfix">
              <span>API列表</span>
            </div>
            <el-table
              :key="bind.noauth.tableKey"
              v-loading="bind.noauth.listLoading"
              :data="bind.noauth.list"
              border
              fit
              highlight-current-row
            >
              <el-table-column
                type="index"
                width="50"
                align="center"
                label="序号"
              />
              <el-table-column prop="API_CODE" label="API代码" min-width="100px" />
              <el-table-column prop="API_NAME" label="API名称" min-width="100px" />
              <el-table-column label="操作" align="center" min-width="100px" class-name="small-padding fixed-width">
                <template slot-scope="{row,$index}">
                  <el-button type="text" size="mini" @click="saveBind(row,$index)">
                    绑定
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <pagination v-show="bind.noauth.total>0" :total="bind.noauth.total" :page.sync="bind.noauth.listQuery.page" :limit.sync="bind.noauth.listQuery.limit" @pagination="getNoAuthApiList" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="margin-right: 2px;">
            <div slot="header" class="clearfix">
              <span>已绑定的API</span>
            </div>
            <el-table
              :key="bind.auth.tableKey"
              v-loading="bind.auth.listLoading"
              :data="bind.auth.list"
              border
              fit
              highlight-current-row
            >
              <el-table-column
                type="index"
                width="50"
                align="center"
                label="序号"
              />
              <el-table-column prop="API_CODE" label="API代码" min-width="100px" />
              <el-table-column prop="API_NAME" label="API名称" min-width="100px" />
              <el-table-column label="操作" align="center" min-width="100px" class-name="small-padding fixed-width">
                <template slot-scope="{row,$index}">
                  <el-button type="text" size="mini" @click="removeBind(row,$index)">
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <pagination v-show="bind.auth.total>0" :total="bind.auth.total" :page.sync="bind.auth.listQuery.page" :limit.sync="bind.auth.listQuery.limit" @pagination="getNoAuthApiList" />
          </el-card>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createPolicy, updatePolicy, deletePolicy, syncRedis, fetchNoAuthApi, fetchAuthApi, bindApi, unbindApi } from '@/api/gws/policy'
import { fetchAppDic } from '@/api/common/dic'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

const policyTypeDic = {
  '0': '基础策略',
  '1': '应用策略'
}
const unitDic = {
  '1': '分钟',
  '2': '小时',
  '3': '天'
}

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    policyTypeFilter(code) {
      return policyTypeDic[code]
    },
    unitFilter(code) {
      return unitDic[code]
    }
  },
  data() {
    return {
      bind: {
        policyId: '',
        noauth: {
          tableKey: 1,
          list: null,
          total: 0,
          listLoading: true,
          listQuery: {
            page: 1,
            limit: 20,
            apiName: ''
          }
        },
        auth: {
          tableKey: 2,
          list: null,
          total: 0,
          listLoading: true,
          listQuery: {
            page: 1,
            limit: 20,
            apiName: ''
          }
        }
      },
      policyTypeDic,
      appDic: [],
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
      unitDic,
      temp: {
        id: undefined,
        policyType: '0',
        policyName: '',
        appId: '',
        unit: '',
        apiDefault: '',
        remark: ''
      },
      dialogBindVisible: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑策略',
        create: '添加策略',
        bind: '绑定API'
      },
      rules: {
        policyType: [
          { required: true, message: '策略类型不能为空', trigger: 'change' }
        ],
        policyName: [
          { required: true, message: '策略名称不能为空', trigger: 'change' }
        ],
        unit: [
          { required: true, message: '单位时间不能为空', trigger: 'change' }
        ],
        apiDefault: [
          { required: true, message: 'API流量限制不能为空', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    'temp.policyType': function(val) {
      if (val === '0') {
        this.appDic = []
        this.rules.appId = []
      } else if (val === '1') {
        this.initAppDic()
        this.rules.appId = [
          { required: true, message: '应用方不能为空', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    initAppDic() {
      fetchAppDic({}).then(response => {
        const { data } = response
        this.appDic = data
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.count
        this.listLoading = false
      })
    },
    clearListQuery() {
      this.listQuery.policyType = undefined
      this.listQuery.policyName = undefined
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        policyType: '0',
        policyName: '',
        appId: '',
        unit: '',
        apiDefault: '',
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
          createPolicy(tempData).then((res) => {
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
      this.temp.id = row.ID
      this.temp.policyType = row.POLICY_TYPE
      this.temp.policyName = row.POLICY_NAME
      this.temp.appId = row.APP_ID
      this.temp.unit = row.UNIT
      this.temp.apiDefault = row.API_DEFAULT
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
          updatePolicy(tempData).then(() => {
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
      this.$confirm('此操作将永久删除该策略, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletePolicy({ id: row.ID }).then(() => {
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
      this.$confirm('批量同步策略数据至redis, 是否继续?', '提示', {
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
    handleBind(row) {
      this.bind.policyId = row.ID
      this.dialogStatus = 'bind'
      this.dialogBindVisible = true
      this.getNoAuthApiList()
      this.getAuthApiList()
    },
    getNoAuthApiList() {
      this.bind.noauth.listLoading = true
      this.bind.noauth.listQuery.policyId = this.bind.policyId
      fetchNoAuthApi(this.bind.noauth.listQuery).then(response => {
        this.bind.noauth.list = response.data
        this.bind.noauth.total = response.count
        this.bind.noauth.listLoading = false
      })
    },
    getAuthApiList() {
      this.bind.auth.listLoading = true
      this.bind.auth.listQuery.policyId = this.bind.policyId
      fetchAuthApi(this.bind.auth.listQuery).then(response => {
        this.bind.auth.list = response.data
        this.bind.auth.total = response.count
        this.bind.auth.listLoading = false
      })
    },
    saveBind(row, index) {
      const param = {
        apiCode: row.API_CODE,
        policyId: this.bind.policyId
      }
      bindApi(param).then(() => {
        debugger
        this.bind.noauth.list.splice(index, 1)
        this.getAuthApiList()
      }).catch((err) => {
        console.log(err)
      })
    },
    removeBind(row, index) {
      this.$confirm('此操作将移除API绑定, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = {
          apiCode: row.API_CODE,
          policyId: this.bind.policyId
        }
        unbindApi(param).then(() => {
          debugger
          this.bind.auth.list.splice(index, 1)
          this.getNoAuthApiList()
        }).catch((err) => {
          console.log(err)
        })
      })
    }
  }
}
</script>
