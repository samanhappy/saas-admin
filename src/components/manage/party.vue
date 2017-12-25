<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="人员列表" name="list">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="name" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="load">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
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
        <el-pagination background @size-change="load" @current-change="load" :current-page="pageNo" :page-sizes="[10, 50, 100]"
          :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper, ->" :total="total" v-if="total > 0">
        </el-pagination>
      </el-tab-pane>

      <el-tab-pane label="导入" name="import">
        <el-button type="success" @click="downTpl">下载模板</el-button>
        <el-upload style="display:inline" :action="this.config.UPLOAD_URL + 'upload'":on-preview="handlePreview" :on-remove="handleRemove" name="file" :data="upload"
          :limit="1" :file-list="fileList" :show-file-list="false" :before-upload="beforeUpload" :on-success="uploadSuccess"
          :on-error="uploadError" :on-exceed="fileExceed">
          <el-button size="small" type="primary">上传</el-button>
          <a v-if="fileKey" :href="this.config.OSS_URL + this.fileKey">{{fileName}}</a>
          <el-button v-if="fileKey" style="margin-left:10px" slot="tip" type="primary" @click="clearFile">清空</el-button>
          <el-button style="margin-left:10px" slot="tip" type="primary">提交</el-button>
        </el-upload>
      </el-tab-pane>

      <el-tab-pane label="模板配置" name="config">

      </el-tab-pane>
    </el-tabs>

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
  </div>
</template>

<script>
export default {
  data () {
    return {
      name: '',
      loading: false,
      edit: false,
      activeName: 'import',
      partyDate: '',
      pageNo: 1,
      pageSize: 10,
      total: 0,
      upload: {
        path: 'test/'
      },
      tableData: [],
      fileList: [],
      fileKey: '',
      fileName: '',
      row: {}
    }
  },
  methods: {
    clearFile () {
      this.$http.get(this.config.UPLOAD_URL + 'delete', {
        params: {
          key: this.fileKey
        }
      }).then((response) => {
      })
      this.fileKey = ''
      this.fileName = ''
      this.fileList = []
    },
    downTpl () {
      window.location.href = this.config.API_URL + 'tpl/入党日期导入模板.xls'
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
    },
    uploadSuccess (response, file, fileList) {
      this.$message.success('上传成功')
      this.fileKey = response.data
      this.fileName = file.name
    },
    fileExceed (files, fileList) {
      this.$message('请先清空再上传')
    },
    uploadError () {
      this.fileKey = ''
      this.$message.error('上传失败')
    },
    handleRemove (file, fileList) {
      if (this.fileKey !== '') {
        this.$http.get(this.config.UPLOAD_URL + 'delete', {
          params: {
            key: this.fileKey
          }
        }).then((response) => {
        })
      }
    },
    handlePreview (file) {
      console.log(file)
    },
    handleClick (key, keyPath) {
      console.log(key, keyPath)
    },
    openEdit (index, row) {
      this.row = row
      this.partyDate = row.partyDate
      this.edit = true
    },
    submitEdit () {
      if (this.partyDate == null) {
        this.$http.delete(this.config.API_URL + 'user/' + this.row.id + '/partyDate'
        ).then((response) => {
          this.edit = false
          this.load()
        })
      } else {
        this.$http.patch(this.config.API_URL + 'user/' + this.row.id, {
          partyDate: this.partyDate
        }).then((response) => {
          this.edit = false
          this.load()
        })
      }
    },
    handleDelete (index, row) {
      this.$confirm('确定要删除生日吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(this.config.API_URL + 'user/' + row.id + '/partyDate'
        ).then((response) => {
          this.load()
        })
      })
    },
    dateFormatter (row, column) {
      return this.timeFormat(row[column.property], 'YYYY-MM-DD')
    },
    timeFormatter (row, column) {
      return this.timeFormat(row[column.property], 'YYYY-MM-DD HH:mm:ss')
    },
    load () {
      this.loading = true
      this.$http.get(this.config.API_URL + 'user/', {
        params: {
          name: this.name,
          pageNo: this.pageNo,
          pageSize: this.pageSize
        }
      }).then((response) => {
        this.loading = false
        this.tableData = response.body.page.list
        this.total = response.body.page.total
      }).then((response) => {
        this.loading = false
      })
    }
  },
  mounted: function () {
    this.load()
  }
}
</script>
