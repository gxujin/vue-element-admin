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
        <el-table-column label="调用结果" align="center" class-name="status-col" width="100">
          <template slot-scope="{row}">
            <el-tooltip content="点击查看详情" placement="bottom" effect="light">
              <el-tag :type="row.RESULT | statusFilter" @click="handleResult(row)">
                {{ row.RESULT | resultNameFilter }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="80%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="margin-left:50px;">
        <el-form-item label="请求报文">
          <pre v-highlightjs="temp.reqContent" style="margin: 0"><code class="json" /></pre>
        </el-form-item>
        <el-form-item label="返回报文">
          <pre v-highlightjs="temp.resContent" style="margin: 0"><code class="json" /></pre>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchLogInfo } from '@/api/gws/log'
import { fetchAppDic, fetchApiDic } from '@/api/common/dic'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import moment from 'moment'

import Vue from 'vue'
import VueHighlightJS from 'vue-highlightjs'
import 'highlight.js/styles/atom-one-dark.css'
Vue.use(VueHighlightJS)

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
      }
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
        this.temp.reqContent = reqContent
        this.temp.resContent = resContent
      }).then(() => {
        this.dialogStatus = 'result'
        this.dialogFormVisible = true
      })
    }
  }
}
</script>
