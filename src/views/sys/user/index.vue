<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="姓名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

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
      <el-table-column prop="ACC_NAME" sortable label="账户名" min-width="150px" />
      <el-table-column prop="NAME" label="姓名" min-width="150px" />
      <el-table-column prop="PHONE" label="手机号码" min-width="150px" />
      <el-table-column label="状态" align="center" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.STATUS | statusFilter">
            {{ row.STATUS | statusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" min-width="200px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

        <el-form-item label="账户名" prop="accName">
          <el-input v-model="temp.accName" maxlength="10" placeholder="请输入账户名" />
        </el-form-item>
        <el-form-item label="账户密码" prop="accPwd">
          <el-input v-model="temp.accPwd" type="password" maxlength="20" :placeholder="dialogStatus==='create'?'请输入账户密码':'为空表示不修改密码'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name" placeholder="请输入姓名" maxlength="10" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model.number="temp.phone" maxlength="11" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="账户状态" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择账户状态">
            <el-option v-for="(value,name) in statusDic" :key="name" :label="value" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" maxlength="200" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注" />
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
  </div>
</template>

<script>
import { fetchList, createUser, updateUser, deleteUser } from '@/api/sys/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import md5 from 'md5'

const statusDic = {
  '0': '未启用',
  '1': '正常',
  '9': '已停用'
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
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined
      },
      statusDic,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        accId: undefined,
        accName: '',
        accPwd: '',
        name: '',
        phone: '',
        status: '',
        remark: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '添加用户'
      },
      rules: {
        accName: [
          { required: true, message: '账户名不能为空', trigger: 'change' },
          { pattern: /^([0-9a-zA-Z_]){1,10}$/, message: '账户名仅支持英文、数字和下划线', trigger: 'blur' }
        ],
        accPwd: [],
        name: [{ required: true, message: '姓名不能为空', trigger: 'change' }],
        phone: [
          { required: true, message: '手机号码不能为空', trigger: 'change' },
          { pattern: /^1\d{10}$/, message: '手机号码格式不正确', trigger: 'blur' }
        ],
        status: [{ required: true, message: '账号状态不能为空', trigger: 'change' }]
      }
    }
  },
  watch: {
    dialogStatus: function(val) {
      debugger
      if (val === 'create') {
        this.rules.accPwd = [
          { required: true, message: '账户密码不能为空', trigger: 'change' },
          { min: 6, message: '账户密码长度至少6位', trigger: 'blur' }
        ]
      } else {
        this.rules.accPwd = [
          { min: 6, message: '账户密码长度至少6位', trigger: 'blur' }
        ]
      }
    }
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
        // Just to simulate the time of the request
        // setTimeout(() => {
        //   this.listLoading = false
        // }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        accId: undefined,
        accName: '',
        accPwd: '',
        name: '',
        phone: '',
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
          const accPwd = tempData.accPwd
          if (accPwd.length > 0) {
            tempData.accPwd = md5(accPwd)
          }
          createUser(tempData).then((res) => {
            // this.temp.accId = res.data
            // this.list.unshift(this.temp)
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
      // this.temp = Object.assign({}, row) // copy obj
      this.temp.accId = row.ACC_ID
      this.temp.accName = row.ACC_NAME
      this.temp.accPwd = ''
      this.temp.name = row.NAME
      this.temp.phone = row.PHONE
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
          const accPwd = tempData.accPwd
          if (accPwd.length > 0) {
            tempData.accPwd = md5(accPwd)
          }
          updateUser(tempData).then(() => {
            // const index = this.list.findIndex(v => v.id === this.temp.id)
            // this.list.splice(index, 1, this.temp)
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
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser({ accId: row.ACC_ID }).then(() => {
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
    }
  }
}
</script>
