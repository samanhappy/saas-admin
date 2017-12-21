<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="人员列表" name="list">
        <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="name" label="姓名" width="180"></el-table-column>
          <el-table-column prop="partyDate" label="入党日期" :formatter="dateFormatter" width="180"></el-table-column>
          <el-table-column prop="updateTime" label="更新时间" :formatter="timeFormatter"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          @size-change="load"
          @current-change="load"
          :current-page="pageNo"
          :page-sizes="[10, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper, ->"
          :total="total"
          v-if="total > 0">
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane label="导入日期" name="import"></el-tab-pane>
      <el-tab-pane label="模板配置" name="config"></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      loading: false,
      activeName: 'list',
      pageNo: 1,
      pageSize: 10,
      total: 0,
      tableData: []
    }
  },
  methods: {
    handleClick (key, keyPath) {
      console.log(key, keyPath)
      console.log(this.config.API_URL)
    },
    handleDelete (index, row) {
      console.log(index)
      console.log(row)
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(this.config.API_URL + 'cyuser/' + row.id
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
      this.$http.get(this.config.API_URL + 'cyuser/', {
        params: {
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
