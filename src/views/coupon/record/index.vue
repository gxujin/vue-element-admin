<template>
  <div class="app-container">
    <div class="table-page-search-wrapper">
      <el-form :model="listQuery" :inline="true" label-suffix=":">
        <el-form-item label="优惠券名称">
          <el-input v-model="listQuery.appName" placeholder="请输入优惠券名称" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="优惠券类型">
          <el-select v-model="listQuery.transCode" placeholder="请选择优惠券类型" clearable>
            <el-option
              v-for="item in couponTypes"
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
        ref="filterTable"
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
        <el-table-column
          label="使用状态"
          align="center"
          class-name="status-col"
          width="100"
          :filters="[{ text: '已使用', value: '1' }, { text: '未使用', value: '0' }]"
          :filter-method="filterResult"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.syzt | statusFilter" style="cursor: pointer;">
              {{ row.syzt | resultNameFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dq" label="地区" min-width="100px" />
        <el-table-column prop="qm" label="券码" min-width="100px" />
        <el-table-column prop="yhqmc" label="优惠券名称" min-width="100px" />
        <el-table-column prop="tfzd" label="投放终端" min-width="100px" />
        <el-table-column prop="qlx" label="券类型" min-width="100px" />
        <el-table-column prop="fqjg" label="发券机构" min-width="80px" />
        <el-table-column prop="use_name" label="顾客姓名" min-width="80px" />
        <el-table-column prop="use_mobile" label="手机号码" min-width="100px" />
        <el-table-column prop="use_time" label="消费时间" min-width="120px" />
        <el-table-column label="操作" fixed="right" align="center" min-width="120px" class-name="small-padding fixed-width">
          <template>
            <el-button type="primary" size="mini">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :auto-scroll="false" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>
  </div>
</template>

<script>
import { fetchRecordList } from '@/api/coupon'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import moment from 'moment'

const resultDic = {
  '0': '未使用',
  '1': '已使用'
}

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '0': 'success',
        '1': 'danger'
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
      couponTypes: [{
        code: '1', name: '通用'
      }],
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
    },
    getList() {
      this.listLoading = true
      fetchRecordList(this.listQuery).then(response => {
        const { items, total } = response.data
        this.list = items
        this.total = total
        this.listLoading = false
      })
    },
    clearListQuery() {
      this.listQuery.appId = undefined
      this.listQuery.transCode = undefined
      this.$refs.filterTable.clearFilter()
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
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
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

::v-deep .el-dialog__body {
  padding-top: 10px;
}
</style>
