<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick" v-loading.fullscreen.lock="this.config.fullLoading">
      <el-tab-pane label="人员列表" name="list">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="name" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadParty">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="name" label="姓名" width="180"></el-table-column>
          <el-table-column prop="partyDate" label="入党日期" :formatter="dateFormatter" width="180"></el-table-column>
          <el-table-column prop="updateTime" label="更新时间" :formatter="timeFormatter"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" @click="openEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除入党日期</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination background @size-change="loadParty" @current-change="loadParty" :current-page="pageNo" :page-sizes="[10, 50, 100]"
          :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper, ->" :total="total" v-if="total > 0">
        </el-pagination>

        <el-dialog title="修改入党日期" :visible.sync="edit" label-width="80px">
          <el-form>
            <el-form-item label="姓名">
              <label>{{row.name}}</label>
            </el-form-item>
            <el-form-item label="生日">
              <el-date-picker v-model="partyDate" type="date" placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="edit = false">取 消</el-button>
            <el-button type="primary" @click="submitEdit">确 定</el-button>
          </div>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="导入" name="import">
        <el-button type="success" @click="downTpl">下载模板</el-button>
        <el-upload style="display:inline" :action="this.config.API_URL + '/upload/upload'":on-preview="handlePreview" :on-remove="handleRemove" name="file"
          :data="upload" :headers="headers" :limit="1" :file-list="fileList" :show-file-list="false"
          :before-upload="beforeUpload" :on-success="uploadSuccess" :on-error="uploadError" :on-exceed="fileExceed">
          <el-button size="small" type="primary">上传</el-button>
          <a v-if="file.fileKey" :href="this.config.OSS_URL + this.file.fileKey">{{fileName}}</a>
          <el-button v-if="file.fileKey" style="margin-left:10px" slot="tip" type="primary" @click="clearFile">清空</el-button>
          <el-button style="margin-left:10px" slot="tip" type="primary" @click="importFile">提交</el-button>
        </el-upload>
      </el-tab-pane>

      <el-tab-pane label="模板配置" name="config">
        <el-form :model="configForm" ref="configForm" :rules="rules" label-width="100px">
          <el-form-item label="背景图片" required prop="bgPicUrl">
            <el-radio v-model="configForm.bgPicUrl" label="party1.png"><img width="150px" src="../../assets/img/party1.png"/></el-radio>
            <el-radio v-model="configForm.bgPicUrl" label="party2.png"><img width="150px" src="../../assets/img/party2.png"/></el-radio>
            <el-radio v-model="configForm.bgPicUrl" label="party3.png"><img width="150px" src="../../assets/img/party3.png"/></el-radio>
          </el-form-item>
          <el-form-item label="提示消息" required prop="message">
            <el-input type="textarea" v-model="configForm.message"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveConfig('configForm')">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-button>

  </div>
</template>

<script>
export default {
  data () {
    return {
      configForm: {
        bgPicUrl: '',
        message: ''
      },
      rules: {
        bgPicUrl: [
          { required: true, message: '请选择背景图片', trigger: 'blur' }
        ],
        message: [
          { required: true, message: '请输入提示消息语', trigger: 'blur' }
        ]
      },
      name: '',
      edit: false,
      activeName: 'config',
      partyDate: '',
      pageNo: 1,
      pageSize: 10,
      total: 0,
      upload: {
        path: 'test/'
      },
      tableData: [],
      fileList: [],
      file: {},
      fileName: '',
      row: {},
      headers: {}
    }
  },
  methods: {
    importFile () {
      if (this.file.fileKey === '') {
        this.$message.error('请先上传文件')
        return false
      }
      this.$http.get(this.config.API_URL + '/api/userParty/import', {
        params: {
          fileUrl: this.file.serverUrl + this.file.fileKey
        }
      }).then((response) => {
        if (response.status === 200 && response.body.status === 0) {
          this.$message.success('导入成功')
          this.clearFile()
        }
      })
    },
    initFile () {
      this.fileName = ''
      this.fileList = []
      this.file = {}
    },
    clearFile () {
      this.$http.get(this.config.API_URL + '/upload/delete', {
        params: {
          fileKey: this.file.fileKey
        }
      }).then((response) => {
      })
      this.initFile()
    },
    downTpl () {
      window.location.href = this.config.API_URL + '/tpl/入党日期导入模板.xls'
    },
    beforeUpload (file) {
      if (!this.endWith(file.name, '.xls')) {
        this.$message.error('上传文件格式只能是xls格式!')
        return false
      }
      if (!(file.size / 1024 / 1024 < 2)) {
        this.$message.error('上传文件大小不能超过 2MB!')
        return false
      }
      this.headers = {
        userToken: this.config.user.token,
        token: this.config.token,
        appId: this.config.appId,
        type: this.config.type
      }
    },
    uploadSuccess (response, file, fileList) {
      this.$message.success('上传成功')
      this.file = response.data
      this.fileName = file.name
    },
    fileExceed (files, fileList) {
      this.$message('请先清空再上传')
    },
    uploadError () {
      this.file.fileKey = ''
      this.$message.error('上传失败')
    },
    handleRemove (file, fileList) {
      this.clearFile()
    },
    handlePreview (file) {
      console.log(file)
    },
    handleClick (key, keyPath) {
      if (this.activeName === 'list') {
        this.loadParty()
      }
    },
    openEdit (index, row) {
      this.row = row
      this.partyDate = row.partyDate
      this.edit = true
    },
    submitEdit () {
      if (this.partyDate == null) {
        this.$http.delete(this.config.API_URL + '/api/userParty/' + this.row.id + '/partyDate'
        ).then((response) => {
          this.edit = false
          this.loadParty()
        })
      } else {
        this.$http.patch(this.config.API_URL + '/api/userParty/' + this.row.id, {
          partyDate: this.partyDate
        }).then((response) => {
          this.edit = false
          this.loadParty()
        })
      }
    },
    handleDelete (index, row) {
      this.$confirm('确定要删除生日吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(this.config.API_URL + '/api/userParty/' + row.id + '/partyDate'
        ).then((response) => {
          this.loadParty()
        })
      })
    },
    dateFormatter (row, column) {
      return this.timeFormat(row[column.property], 'YYYY-MM-DD')
    },
    timeFormatter (row, column) {
      return this.timeFormat(row[column.property], 'YYYY-MM-DD HH:mm:ss')
    },
    loadParty () {
      this.$http.get(this.config.API_URL + '/api/userParty/', {
        params: {
          name: this.name,
          pageNo: this.pageNo,
          pageSize: this.pageSize
        }
      }).then((response) => {
        this.tableData = response.body.page.list
        this.total = response.body.page.total
      }).then((response) => {
      })
    },
    loadConfig () {
      this.$http.get(this.config.API_URL + '/api/corpPartyConf/corp')
      .then((response) => {
        if (response.body.data) {
          this.configForm = response.body.data
        }
      }).then((response) => {
      })
    },
    saveConfig (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.configForm.id = this.config.user.corpId
          this.$http.put(this.config.API_URL + '/api/corpPartyConf/upsert', this.configForm)
          .then((response) => {
            if (response.body.status === 0) {
              this.$message.success('保存成功')
              this.loadConfig()
            }
          }).then((response) => {
          })
        } else {
          return false
        }
      })
    }
  },
  mounted: function () {
    if (this.activeName === 'list') {
      this.loadParty()
    } if (this.activeName === 'config') {
      this.loadConfig()
    }
  }
}
</script>
