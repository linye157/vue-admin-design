<template>
  <div class="import-excel-wrapper">
    <el-row style="height: 100%; width: 100%; margin: 0;">
      <el-col :span="12">
        <el-card shadow="always">
          <div slot="header" class="title" style="font-size: 18px; font-weight: bold; color: #1e88e5;">原始图片</div>
          
          <!-- 上传后显示图片区域 -->
          <el-row v-if="imageUrl" style="margin: 15px 0; display: flex; justify-content: center;">
            <el-image 
              :src="imageUrl" 
              style="width: 80%; max-height: 200px; border-radius: 4px;"
              fit="contain">
            </el-image>
          </el-row>
          
          <!-- 上传区域（适当大小的矩形框） -->
          <el-row v-else style="margin: 15px 0; display: flex; justify-content: center;">
            <el-upload
              ref="upload"
              action="#"
              :show-file-list="false"
              :on-change="handleChange"
              :auto-upload="false"
              :before-upload="beforeUpload"
              class="upload-container"
              drag>
              <div class="upload-area">
                <i class="el-icon-upload" style="font-size: 28px; color: #c0c4cc; margin-bottom: 8px;"></i>
                <div style="font-size: 14px; color: #606266;">点击上传或拖拽图片到此处</div>
                <div style="font-size: 12px; color: #909399; margin-top: 4px;">支持jpg/png/jpeg格式</div>
              </div>
            </el-upload>
          </el-row>

          <!-- 选择模型区域（居中） -->
          <el-row style="margin: 20px 0; display: flex; justify-content: center;">
            <span style="margin-right: 10px;">模型选择:</span>
            <el-select v-model="selectedModel" placeholder="请选择模型" style="width: 220px;">
              <el-option
                v-for="item in modelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-row>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="always" style="margin-left: 20px; flex: 1;">
          <div slot="header" class="title" style="font-size: 18px; font-weight: bold; color: #1e88e5;">检测结果</div>

          <!-- 图片容器 -->
          <el-row class="image-container">
            <el-image 
              v-if="resultImages.length > 0"
              :src="resultImages[0]" 
              class="result-image"
              fit="cover">
            </el-image>
          </el-row>
          
          <!-- 保存功能区域 - 放置在检测结果下方 -->
          <el-row v-if="resultImages.length > 0" style="margin-top: 15px; display: flex; flex-direction: column; align-items: center;">
            <!-- 目录选择 -->
            <el-row style="width: 100%; margin-bottom: 15px; display: flex; justify-content: center; align-items: center;">
              <span style="margin-right: 10px;">保存路径:</span>
              <el-input
                v-model="savePath"
                placeholder="请选择保存路径"
                style="width: 250px;"
                readonly>
                <el-button 
                  slot="append" 
                  icon="el-icon-folder" 
                  @click="openDirectorySelector">
                  浏览
                </el-button>
              </el-input>
            </el-row>
            
            <!-- 保存按钮 -->
            <el-button 
              type="primary" 
              :loading="saveStatus" 
              @click="saveImage" 
              style="width: 120px;">
              保存图片
            </el-button>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 检测按钮放在底部中间 -->
    <el-row style="margin-top: 20px; display: flex; justify-content: center;">
      <el-button type="primary" size="large" @click="submitUpload" style="padding: 12px 40px; font-size: 18px; color: #fff;" round>
      检测</el-button>
    </el-row>

    <!-- 检测结果表格 -->
    <el-row style="margin-top: 20px;" v-if="detectionResults.length > 0">
      <el-card shadow="hover">
        <el-table
          :data="detectionResults"
          border
          style="width: 100%">
          <el-table-column
            type="expand"
            width="50">
            <template slot-scope="props">
              <div style="padding: 10px;">
                <p>检测时间: {{ props.row.timestamp }}</p>
                <p>面积: {{ props.row.area }} 像素²</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="id"
            label="ID"
            width="70"
            align="center">
          </el-table-column>
          <el-table-column
            prop="fullClass"
            label="Result"
            min-width="180"
            align="left">
          </el-table-column>
          <el-table-column
            prop="positionText"
            label="Position"
            min-width="200"
            align="left">
          </el-table-column>
          <el-table-column
            prop="confidence"
            label="Level"
            width="120"
            align="center">
            <template slot-scope="scope">
              {{ scope.row.confidence.toFixed(6) }}
            </template>
          </el-table-column>
        </el-table>
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
      resultImages: [], // 预测结果图片路径
      localImageNames: ['result1.jpg'], // 需手动配置检测结果图片名称
      selectedModel: '', // 选中的模型值
      modelOptions: [
        { value: 'yolov5', label: 'YOLOv5' },
        { value: 'yolov7', label: 'YOLOv7' },
        { value: 'yolov8', label: 'YOLOv8' },
        { value: 'faster_rcnn', label: 'Faster R-CNN' },
        { value: 'ssd', label: 'SSD' }
      ],
      savePath: '', // 保存路径
      saveStatus: false, // 保存状态
      detectionResults: [], // 检测结果数据
      imageUrl: '', // 上传图片的URL
      fileSelectorSupported: typeof window.showDirectoryPicker === 'function' // 检测是否支持文件选择器API
    }
  },
  methods: {
    // 处理文件添加
    handleChange(file) {
      this.fileList = [file]; // 只保留最新上传的文件
      
      // 设置图片URL用于显示
      this.imageUrl = URL.createObjectURL(file.raw);
      
      // 清空之前的检测结果
      this.resultImages = [];
      this.detectionResults = [];
    },
    
    // 上传前处理
    beforeUpload(file) {
      const isImage = file.type.indexOf('image/') === 0;
      const isLt10M = file.size / 1024 / 1024 < 10;
      
      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return false;
      }
      
      if (!isLt10M) {
        this.$message.error('图片大小不能超过 10MB!');
        return false;
      }
      
      return true;
    },
    handleRemove(file) {
      console.log(file);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleDownload(file) {
      console.log(file);
    },
    // 提交上传
    async submitUpload() {
      if (!this.selectedModel) {
        this.$message.warning('请选择检测模型');
        return;
      }
      
      if (this.fileList.length === 0) {
        this.$message.warning('请上传图片');
        return;
      }
      
      // 这里可以添加与后端的通信，将选择的模型和图片发送到后端
      console.log('选择的模型:', this.selectedModel);
      console.log('上传的文件:', this.fileList);
      
      // 模拟检测过程
      this.$message({
        message: `正在使用 ${this.getModelLabel(this.selectedModel)} 模型进行检测...`,
        type: 'info',
        customClass: 'custom-message'
      });
      
      // 模拟异步操作
      setTimeout(() => {
        this.resultImages = this.localImageNames.map(name => `/results/${name}`);
        
        // 生成模拟的检测结果数据
        this.generateMockDetectionResults();
        
        this.$message({
          message: `检测完成，已加载结果图片和检测数据`,
          type: 'success',
          customClass: 'custom-message'
        });
      }, 1500);
    },
    
    // 生成模拟的检测结果数据
    generateMockDetectionResults() {
      // 清空之前的结果
      this.detectionResults = [];
      
      // 根据图片中的示例数据创建模拟结果
      this.detectionResults = [
        {
          id: 1,
          class: "D01",
          description: "纵向裂缝",
          fullClass: "D01 : 纵向裂缝",
          position: [[323, 23], [460, 361]],
          positionText: "(323, 23), (460, 361)",
          confidence: 0.939195,
          area: (460-323) * (361-23),
          timestamp: new Date().toLocaleString()
        },
        {
          id: 2,
          class: "D03",
          description: "龟裂裂缝",
          fullClass: "D03 : 龟裂裂缝",
          position: [[37, 345], [128, 612]],
          positionText: "(37, 345), (128, 612)",
          confidence: 0.850367,
          area: (128-37) * (612-345),
          timestamp: new Date().toLocaleString()
        },
        {
          id: 3,
          class: "D01",
          description: "纵向裂缝",
          fullClass: "D01 : 纵向裂缝",
          position: [[74, 0], [202, 343]],
          positionText: "(74, 0), (202, 343)",
          confidence: 0.830797,
          area: (202-74) * 343,
          timestamp: new Date().toLocaleString()
        },
        {
          id: 4,
          class: "D02",
          description: "横向裂缝",
          fullClass: "D02 : 横向裂缝",
          position: [[202, 17], [320, 37]],
          positionText: "(202, 17), (320, 37)",
          confidence: 0.77436,
          area: (320-202) * (37-17),
          timestamp: new Date().toLocaleString()
        },
        {
          id: 5,
          class: "D02",
          description: "横向裂缝",
          fullClass: "D02 : 横向裂缝",
          position: [[113, 361], [505, 437]],
          positionText: "(113, 361), (505, 437)",
          confidence: 0.646136,
          area: (505-113) * (437-361),
          timestamp: new Date().toLocaleString()
        }
      ];
    },
    
    // 打开目录选择器
    async openDirectorySelector() {
      try {
        if (this.fileSelectorSupported) {
          // 使用现代文件系统API选择目录
          const directoryHandle = await window.showDirectoryPicker();
          this.savePath = directoryHandle.name; // 显示目录名
          
          // 保存目录句柄以便后续使用
          this.$directoryHandle = directoryHandle;
          
          this.$message({
            message: `已选择保存目录: ${this.savePath}`,
            type: 'success'
          });
        } else {
          // 回退方案：模拟目录选择
          this.$alert('您的浏览器不支持目录选择功能，将使用默认路径。', '提示', {
            confirmButtonText: '确定',
            callback: () => {
              this.savePath = 'C:/Users/Downloads';
              this.$message({
                message: '已设置为默认路径',
                type: 'info'
              });
            }
          });
        }
      } catch (error) {
        // 用户取消选择或出现错误
        console.error('目录选择错误:', error);
        if (error.name !== 'AbortError') {
          this.$message.error('选择目录时出错');
        }
      }
    },
    
    // 保存图片
    async saveImage() {
      if (this.resultImages.length === 0) {
        this.$message.warning('没有可保存的结果图片');
        return;
      }
      
      if (!this.savePath) {
        this.$message.warning('请先选择保存路径');
        return;
      }
      
      // 设置保存状态为加载中
      this.saveStatus = true;
      
      try {
        if (this.$directoryHandle) {
          // 现代文件系统API保存方式
          
          // 获取图片数据
          const response = await fetch(this.resultImages[0]);
          const blob = await response.blob();
          
          // 创建文件名
          const fileName = `detection_result_${new Date().getTime()}.jpg`;
          
          // 在选定的目录中创建文件
          const fileHandle = await this.$directoryHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          this.$message({
            message: `图片已成功保存至 ${this.savePath}/${fileName}`,
            type: 'success'
          });
        } else {
          // 模拟保存过程
          setTimeout(() => {
            this.$message({
              message: `图片已成功保存至 ${this.savePath}/detection_result.jpg`,
              type: 'success'
            });
          }, 1000);
        }
      } catch (error) {
        console.error('保存图片错误:', error);
        this.$message.error('保存图片时出错');
      } finally {
        // 无论成功失败，都重置保存状态
        setTimeout(() => {
          this.saveStatus = false;
        }, 1000);
      }
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
    // 根据模型value获取模型label
    getModelLabel(value) {
      const model = this.modelOptions.find(item => item.value === value);
      return model ? model.label : value;
    },
    
    // 导出对象信息
    exportObjectInfo() {
      if (!this.currentDetail) return;
      
      // 创建一个包含对象详情的文本
      const detailText = `
检测对象详情:
ID: ${this.currentDetail.id}
类别: ${this.currentDetail.class}
置信度: ${(this.currentDetail.confidence * 100).toFixed(2)}%
边界框坐标: [${this.currentDetail.bbox.join(', ')}]
面积: ${this.currentDetail.area} 像素²
检测时间: ${this.currentDetail.timestamp}
检测模型: ${this.getModelLabel(this.selectedModel)}
      `.trim();
      
      // 创建Blob对象
      const blob = new Blob([detailText], { type: 'text/plain' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `检测对象_${this.currentDetail.class}_${this.currentDetail.id}.txt`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      this.$message({
        message: '对象信息已导出',
        type: 'success'
      });
    }
  }
}
</script>

<style lang="less">
.import-excel-wrapper {
  .el-card {
    min-height: 400px;
    position: relative;
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
  .result-image {
    width: calc(100% - 120px);
    max-height: 300px;
    margin-bottom: 10px;
    border-radius: 4px;
  }
  .image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 300px;
  }
  .upload-container {
    width: 80%;
    .el-upload {
      width: 100%;
      .el-upload-dragger {
        width: 100%;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  .upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
  }
}
.custom-message .el-message__content {
  font-size: 18px; /* 增大字体 */
  padding: 10px 20px; /* 增大内边距 */
  text-align: center;  /* 文字居中 */
}
</style>