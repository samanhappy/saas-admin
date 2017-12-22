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
        <el-upload :action="this.config.UPLOAD_URL":on-preview="handlePreview" :on-remove="handleRemove" name="file" :data="upload"
          :limit="1" :file-list="fileList" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeUpload">
          <el-button size="small" type="primary">点击上传</el-button>
          <span class="el-upload__tip">只能上传excel文件，且不超过500kb</span>
          <img v-if="imageUrl" :src="imageUrl" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
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
      imageUrl: 'https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1513928878&di=8cf6627dc5a4a54db466d615b9249e30&src=http://img5q.duitang.com/uploads/item/201410/03/20141003090944_WxrBM.thumb.700_0.jpeg',
      row: {}
    }
  },
  methods: {
    handleAvatarSuccess (res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    beforeUpload (file) {
      const isExcel = file.type === 'xls';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isExcel) {
        this.$message.error('上传文件格式只能是xls格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 2MB!');
      }
      return isExcel && isLt2M;
    },
    handleRemove (file, fileList) {
      console.log(file, fileList)
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
