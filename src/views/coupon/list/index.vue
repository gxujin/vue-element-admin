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
      <el-button type="primary" style="margin-bottom: 5px;" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button type="success" style="margin-bottom: 5px;" icon="el-icon-finished">
        发布
      </el-button>
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
        <el-table-column prop="dq" label="地区" min-width="100px" />
        <el-table-column prop="hdmc" label="活动名称" min-width="100px" />
        <el-table-column prop="yhqmc" label="优惠券名称" min-width="100px" />
        <el-table-column prop="tfzd" label="投放终端" min-width="100px" />
        <el-table-column prop="qlx" label="券类型" min-width="100px" />
        <el-table-column prop="fqjg" label="发券机构" min-width="100px" />
        <el-table-column prop="zjfs" label="中奖方式" min-width="100px" />
        <el-table-column prop="qzt" label="劵状态" min-width="100px" />
        <el-table-column prop="yhlx" label="优惠类型" min-width="100px" />
        <el-table-column prop="qjglx" label="券机构类型" min-width="100px" />
        <el-table-column prop="mk" label="门槛" min-width="100px" />
        <el-table-column prop="ffzs" label="发放总数" min-width="100px" />
        <el-table-column prop="ylqsl" label="已领取数量" min-width="100px" />
        <el-table-column prop="ysysl" label="已使用数量" min-width="100px" />
        <el-table-column label="操作" fixed="right" align="center" min-width="150px" class-name="small-padding fixed-width">
          <template>
            <el-button type="primary" size="mini">
              编辑
            </el-button>
            <el-button type="danger" size="mini">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :auto-scroll="false" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>

    <el-dialog :append-to-body="true" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="70%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="margin:0 50px;">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地区" prop="dq">
              <el-input v-model="temp.dq" maxlength="20" placeholder="请输入地区" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动名称" prop="hdmc">
              <el-input v-model="temp.hdmc" maxlength="20" placeholder="请输入活动名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠券名称" prop="xfqmc">
              <el-input v-model="temp.xfqmc" maxlength="100" placeholder="请输入优惠券名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="投放终端" prop="tfzd">
              <el-select v-model="temp.zd" class="filter-item" placeholder="请选择投放终端" clearable>
                <el-option v-for="(value,name) in zdDic" :key="name" :label="value" :value="name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="券类型" prop="qlx">
              <el-select v-model="temp.qlx" class="filter-item" placeholder="请选择券类型" clearable>
                <el-option v-for="(value,name) in qlxDic" :key="name" :label="value" :value="name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发券机构" prop="qlx">
              <el-select v-model="temp.fqjg" class="filter-item" placeholder="请选择发券机构" clearable>
                <el-option v-for="(value,name) in fqjgDic" :key="name" :label="value" :value="name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="优惠券类型" prop="lx">
              <el-radio-group v-model="temp.yhqlx" size="mini">
                <el-radio label="1" border>5元代金券</el-radio>
                <el-radio label="2" border>10元代金券</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠券数量" prop="sl">
              <el-input v-model="temp.sl" maxlength="100" placeholder="请输入优惠券数量">
                <template slot="append">张</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="6">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="temp.remark" maxlength="100" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList } from '@/api/coupon'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import moment from 'moment'

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
      couponTypes: [{
        code: '1', name: '通用'
      }],
      dqDic: { '1': '鸿雁社区' },
      qlxDic: { '1': '餐饮券' },
      zdDic: { '1': 'APP' },
      fqjgDic: { '1': '社区' },
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
        sl: 100,
        yhqlx: '2'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        result: '查看详情'
      },
      rules: {
        dq: [
          { required: true, message: '地区不能为空', trigger: 'change' }
        ],
        hdmc: [
          { required: true, message: '活动名称不能为空', trigger: 'change' }
        ]
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
      fetchList(this.listQuery).then(response => {
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

.bg {
  background: #99a9bf;
}
</style>
