<template>
  <div class="import-excel-wrapper">
     <Hints>
      <template slot="hintName">使用说明</template>
      <template slot="hintInfo">
        <p>1. 上传仅支持xlsx、xls、csv格式文件</p>
        <p>2. 预测文件每列属性必须与训练文件一致，否则无法正确预测</p>
        <p>3. 本页面仅支持上传文件预测，预测后会生成对应的预测文件</p>
      </template>
    </Hints>
    <el-row style="height: 100%; width: 100%; margin: 0;">
      <el-card shadow="always">
        <div slot="header" class="title" style="font-size: 18px; font-weight: bold;  color: #1e88e5;">力学性能预测模型训练</div>
        <el-row style="margin-top: 20px;display: flex; justify-content: center;">
          <el-upload
          ref="upload"
          drag
          :http-request="customUpload"
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
            <el-form label-width="120px" style="width: 300px; ">
              <el-form-item label="模型名称" style="font-weight: bold;">
                <el-input v-model="modelName" placeholder="请输入模型名称" />
              </el-form-item>
            </el-form>
          </el-row>

        <el-row style="margin-top: 16px;display: flex; justify-content: center;">
          <el-button type="success" size="large" @click="submitUpload" style="padding: 15px 30px; font-size: 18px; font-weight: bold; color: #fff;" round>
        性能预测</el-button>
        </el-row>
        
      </el-card>
    </el-row>
  </div>
  
</template>

<script>
import Hints from '../../components/Hints'
import axios from "axios"

export default {
  name: 'ImportExcel',
  components: { Hints },
  data() {
    return {
      fileList: [],
      modelName: '', // 模型名称
    }
  },
  methods: {
    submitUpload() {
      if (this.fileList.length === 0){
        this.$message.error('请先选择要上传的文件！');
        return;
      }
      if (!this.modelName) {
        this.$message.error('请填写模型名称');
      }
      this.$refs.upload.submit();
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
    async customUpload({ file }) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("modelName", this.modelName)
      try {
        const response = await axios.post("http://localhost:8080/predict", formData, {
          responseType: "blob", // 处理文件流
        });

        // 获取文件名
        const contentDisposition = response.headers["content-disposition"];
        const defaultFileName = "result.xlsx";
        const fileNameMatch = contentDisposition?.match(/filename="?(.+)"?/);
        const fileName = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : defaultFileName;

        // 创建 Blob 并下载
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        this.$message.success("文件下载成功！");

      } catch (error) {
        console.error(error);
        this.$message.error("文件上传或预测失败，请稍后重试！");
      } finally {
        // 清除上传文件列表
        this.$refs.upload.clearFiles(); // 使用 clearFiles 方法清除文件列表
        this.modelName = ''
      }
    },
  }
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
</style>
