<template>
  <div class="import-excel-wrapper">
     <Hints>
      <template slot="hintName">使用说明</template>
      <template slot="hintInfo">
        <p>1. 上传仅支持xlsx、xls、csv格式文件</p>
        <p>2. 模型名称为训练后模型文件的名字，如果名字相同，则直接覆盖原先训练文件</p>
      </template>
    </Hints>
    <el-row style="height: 100%; width: 100%; margin: 0;">
      <el-col :span="12">
        <el-card shadow="always">
          <div slot="header" class="title" style="font-size: 18px; font-weight: bold; color: #43a047;">力学性能预测模型训练</div>
          <el-row style="margin-top: 20px;display: flex; justify-content: center;">
            <el-upload
            ref="upload"
            drag
            :http-request="customRequest"
            accept=".xlsx, .xls, .csv"
            :multiple="false"
            :file-list="fileList"
            :show-file-list="true"
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleLimit"
            :on-change="handleChange"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将Excel文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </el-row>
          <!-- 输入框 -->
          <el-row style="margin-top: 20px; display: flex; justify-content: center;">
            <el-form label-width="120px" style="width: 300px;">
              <el-form-item label="模型名称" style="font-weight: bold;">
                <el-input v-model="modelName" placeholder="请输入模型名称" />
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="margin-top: 16px;display: flex; justify-content: center;">
            <el-button type="success" size="large" @click="submitUpload" style="padding: 15px 30px; font-size: 18px; font-weight: bold; color: #fff;" round>
          开始模型训练</el-button>
          </el-row>
        </el-card>
      </el-col>
     
      <el-col :span="12">
        <!-- 历史训练记录 -->
        <el-card shadow="always" style="margin-left: 20px; flex: 1;">
          <div slot="header" class="title" style="font-size: 18px; font-weight: bold;  color: #1e88e5;">历史训练记录</div>
          <el-table :data="files" border style="width: 100%">
            <el-table-column prop="creation_time" label="训练时间" />
            <el-table-column prop="name" label="模型名称" />
          </el-table>
        </el-card>
      </el-col>
     
    </el-row>
  </div>
  
</template>

<script>
import Hints from '../../components/Hints'
import axios from "axios"

export default {
  name: 'ImportExcel',
  components: { Hints  },
  data() {
    return {
      fileList: [],
      modelName: '', // 模型名称
      files: [], // 存储文件列表
    }
  },
  methods: {
    submitUpload() {
      if (this.fileList.length === 0 || !this.modelName){
        this.$message.error('请填写完整信息并选择文件！');
        return;
      }
      this.$refs.upload.submit();
    },
    customRequest({ file, onSuccess, onError }) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('modelName', this.modelName);
      // 使用 axios 发送请求
      axios
        .post('http://localhost:8080/train', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          this.files = response.data.data
          console.log(this.files)
          this.$message.success({
            message: '模型训练完成',
            duration: 3000,
            customClass: 'custom-message'
          })
          onSuccess(response);
            // 等待 DOM 更新后再清空 fileList
          this.$nextTick(() => {
            this.fileList = [];
          });
        })
        .catch((error) => {
          this.$message.error('上传失败，请稍后重试！');
          onError(error);
        })
        
    },
    handleLimit() {
      this.$message.warning('Excel文件只支持单个上传!')
      return false
    },
    handleChange(file, fileList) {
      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
    handleSuccess(response, file, fileList) {
      this.$message.success({
        message: '模型训练完成',
        duration: 3000,
        customClass: 'custom-message'
      })
      // 等待 DOM 更新后再清空 fileList
      this.$nextTick(() => {
        this.fileList = [];
      });
      console.log('服务器返回的数据', response)
    },
    async fetchFiles() {
      try {
        const response = await axios.get("http://localhost:8080/files");
        this.files = response.data;
      } catch (error) {
        this.$message.error("加载文件列表失败！");
        console.error(error);
      }
    },
  },
  mounted() {
    this.fetchFiles(); // 页面加载时获取文件列表
  },
}
</script>

<style lang="less">
.import-excel-wrapper {
  .el-card {
    min-height: 400px;
  }
  .search-form {
    padding-top: 18px;
    margin-bottom: 15px;
    background-color: #f7f8fb;
  }
  .el-table thead {
    font-weight: 600;
    th{
      background-color: #f2f3f7;
    }
  }
}
.custom-message .el-message__content {
  font-size: 18px; /* 增大字体 */
  padding: 10px 20px; /* 增大内边距 */
  text-align: center;  /* 文字居中 */
}
.date-box{
  margin-bottom: 20px;
}
.data-chart{
  width: 100%;
  height: 400px;
}
</style>