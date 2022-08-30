<template>
  <div class="app-container">
    <div class="table-page-search-wrapper">
      <el-form :model="listQuery" :inline="true" label-suffix=":">
        <el-form-item label="应用方名称">
          <el-select v-model="listQuery.appId" placeholder="请选择应用方" clearable>
            <el-option
              v-for="item in appDic"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="应用方名称">
          <el-select v-model="listQuery.transCode" placeholder="请选择接口" clearable>
            <el-option
              v-for="item in apiDic"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
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
        <el-table-column prop="APP_NAME" label="应用名称" min-width="100px" />
        <el-table-column prop="TRANS_NAME" label="接口名称" min-width="100px" />
        <el-table-column prop="REQ_IP" label="请求IP地址" min-width="100px" />
        <el-table-column prop="REQ_TIME" label="请求时间" min-width="150px" :formatter="dateFormat" />
        <el-table-column prop="RES_TIME" label="返回时间" min-width="150px" :formatter="dateFormat" />
        <el-table-column prop="RTN_CODE" label="返回码" min-width="100px" />
        <el-table-column prop="RTN_MSG" label="返回信息" min-width="100px" :show-overflow-tooltip="showOverflowTooltip" />
        <el-table-column
          label="调用结果"
          align="center"
          class-name="status-col"
          width="100"
          :filters="[{ text: '成功', value: '1' }, { text: '失败', value: '0' }]"
          :filter-method="filterResult"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.RESULT | statusFilter" style="cursor: pointer;" @click="handleResult(row)">
              {{ row.RESULT | resultNameFilter }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :auto-scroll="false" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="请求报文" name="1">
          <div class="json-editor">
            <textarea ref="reqContent" />
          </div>
        </el-collapse-item>
        <el-collapse-item title="返回报文" name="2">
          <div class="json-editor">
            <textarea ref="resContent" />
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchLogInfo } from '@/api/gws/log'
import { fetchAppDic, fetchApiDic } from '@/api/common/dic'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import moment from 'moment'

import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/3024-day.css'

const resultDic = {
  '0': '失败',
  '1': '成功'
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
    resultNameFilter(status) {
      return resultDic[status]
    }
  },
  data() {
    return {
      activeNames: ['1', '2'],
      appDic: [],
      apiDic: [],
      dateFormat: function(row, column, cellValue, index) {
        return moment(cellValue).format('YYYY-MM-DD HH:mm:ss')
      },
      showOverflowTooltip: true,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        appId: undefined,
        transCode: undefined
      },
      resultDic,
      temp: {
        reqContent: '',
        resContent: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        result: '查看详情'
      },
      rules: {
      },
      jsonEditorReq: undefined,
      jsonEditorRes: undefined
    }
  },
  watch: {
  },
  created() {
    this.initDic()
    this.getList()
  },
  methods: {
    initDic() {
      fetchAppDic({}).then(response => {
        const { data } = response
        this.appDic = data
      })
      fetchApiDic({}).then(response => {
        const { data } = response
        this.apiDic = data
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
      this.listQuery.appId = undefined
      this.listQuery.transCode = undefined
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    filterResult(value, row, column) {
      if (value === '0') {
        return row.RTN_CODE === '999999'
      } else if (value === '1') {
        return row.RTN_CODE === '000000'
      } else {
        return true
      }
    },
    resetTemp() {
      this.temp = {
        reqContent: '',
        resContent: ''
      }
    },
    handleResult(row) {
      const id = row.ID
      fetchLogInfo({ id: id }).then(response => {
        const data = response.data || {}
        const { reqContent, resContent } = data
        const json = JSON.parse(reqContent)
        this.temp.reqContent = JSON.stringify(json, null, 4)

        const json2 = JSON.parse(resContent)
        this.temp.resContent = JSON.stringify(json2, null, 4)
      }).then(() => {
        this.dialogStatus = 'result'
        this.dialogFormVisible = true
        this.activeNames = ['1', '2']
      }).then(() => {
        if (!this.jsonEditorReq) {
          this.jsonEditorReq = CodeMirror.fromTextArea(this.$refs.reqContent, {
            lineNumbers: true,
            mode: 'application/json',
            theme: '3024-day',
            readOnly: true
          })
        }
        if (!this.jsonEditorRes) {
          this.jsonEditorRes = CodeMirror.fromTextArea(this.$refs.resContent, {
            lineNumbers: true,
            mode: 'application/json',
            theme: '3024-day',
            readOnly: true
          })
        }

        this.jsonEditorReq.setValue(this.temp.reqContent)
        this.jsonEditorRes.setValue(this.temp.resContent)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.json-editor {
  height: 100%;
  position: relative;

  ::v-deep {
    .CodeMirror {
      height: auto;
    }

    .cm-s-rubyblue span.cm-string {
      color: #F08047;
    }
  }
}
</style>
