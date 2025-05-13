<template>
  <div class="prediction-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="单数据预测" name="single">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>单数据预测</span>
          </div>
          
          <el-form :model="singlePredictionForm" label-width="120px">
            <el-form-item label="选择模型">
              <el-select v-model="singlePredictionForm.modelKey" placeholder="请选择模型" :loading="modelsLoading">
                <el-option
                  v-for="model in availableModels"
                  :key="model"
                  :label="formatModelName(model)"
                  :value="model">
                </el-option>
              </el-select>
              <el-button type="text" @click="loadAvailableModels" style="margin-left: 10px;">刷新模型列表</el-button>
            </el-form-item>
            
            <el-divider content-position="left">输入特征值</el-divider>
            
            <div class="feature-inputs">
              <el-row :gutter="20" v-for="(feature, index) in featureInputs" :key="index" style="margin-bottom: 10px;">
                <el-col :span="8">
                  <el-form-item :label="`特征 ${index + 1}`">
                    <el-input v-model="feature.name" placeholder="特征名称"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="值">
                    <el-input-number v-model="feature.value" :precision="4" :step="0.1" style="width: 100%;"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-button type="danger" icon="el-icon-delete" circle @click="removeFeature(index)" style="margin-top: 40px;"></el-button>
                </el-col>
              </el-row>
              
              <el-button type="primary" icon="el-icon-plus" @click="addFeature">添加特征</el-button>
            </div>
            
            <el-form-item style="margin-top: 20px;">
              <el-button type="primary" @click="makeSinglePrediction" :loading="singlePredictionLoading">进行预测</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 预测结果展示 -->
        <el-card class="box-card" v-if="singlePredictionResult">
          <div slot="header" class="clearfix">
            <span>预测结果</span>
          </div>
          
          <el-descriptions title="预测值" :column="1" border>
            <el-descriptions-item 
              v-for="(value, index) in singlePredictionResult" 
              :key="index" 
              :label="`目标 ${index + 1}`">
              {{ formatNumber(value) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="批量预测" name="batch">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>批量预测 (Excel文件)</span>
          </div>
          
          <el-form :model="batchPredictionForm" label-width="120px">
            <el-form-item label="选择模型">
              <el-select v-model="batchPredictionForm.modelKey" placeholder="请选择模型" :loading="modelsLoading">
                <el-option
                  v-for="model in availableModels"
                  :key="model"
                  :label="formatModelName(model)"
                  :value="model">
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="上传Excel文件">
              <el-upload
                class="upload-demo"
                action="#"
                :http-request="uploadFile"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                :limit="1"
                :on-exceed="handleExceed"
                :file-list="fileList">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传xlsx/xls文件，且不超过10MB</div>
              </el-upload>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="makeBatchPrediction" :loading="batchPredictionLoading">进行预测</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 批量预测结果展示 -->
        <el-card class="box-card" v-if="batchPredictionResult && batchPredictionResult.length > 0">
          <div slot="header" class="clearfix">
            <span>批量预测结果</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="exportToExcel">导出为Excel</el-button>
          </div>
          
          <el-table
            :data="batchPredictionResult"
            style="width: 100%"
            max-height="400"
            border>
            <el-table-column
              v-for="(col, index) in batchPredictionColumns"
              :key="index"
              :prop="col.prop"
              :label="col.label"
              :width="col.width">
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'PredictionPage',
  data() {
    return {
      activeTab: 'single',
      
      // 可用模型列表
      availableModels: [],
      modelsLoading: false,
      
      // 单数据预测
      singlePredictionForm: {
        modelKey: '',
      },
      featureInputs: [
        { name: '', value: 0 },
        { name: '', value: 0 },
        { name: '', value: 0 }
      ],
      singlePredictionLoading: false,
      singlePredictionResult: null,
      
      // 批量预测
      batchPredictionForm: {
        modelKey: '',
      },
      fileList: [],
      uploadedFile: null,
      batchPredictionLoading: false,
      batchPredictionResult: [],
      batchPredictionColumns: []
    }
  },
  mounted() {
    this.loadAvailableModels()
  },
  methods: {
    formatNumber(num) {
      if (num === undefined || num === null) return '-'
      return Number.isInteger(num) ? num : num.toFixed(4)
    },
    
    formatModelName(modelKey) {
      const modelNames = {
        'LR': '线性回归',
        'RF': '随机森林',
        'XGBR': 'XGBoost',
        'SVR': '支持向量机',
        'ANN': '人工神经网络',
        'stacking': 'Stacking集成',
        'automl_best': 'AutoML最佳模型'
      }
      
      return modelNames[modelKey] || modelKey
    },
    
    loadAvailableModels() {
      this.modelsLoading = true
      
      request.get('/api/get_available_models')
        .then(response => {
          if (response.data.success) {
            this.availableModels = response.data.models
            if (this.availableModels.length > 0) {
              this.singlePredictionForm.modelKey = this.availableModels[0]
              this.batchPredictionForm.modelKey = this.availableModels[0]
            }
          } else {
            this.$message.error(response.data.message || '获取模型列表失败')
          }
        })
        .catch(error => {
          console.error('Error loading models:', error)
          this.$message.error('获取模型列表失败: ' + (error.response?.data?.message || error.message))
        })
        .finally(() => {
          this.modelsLoading = false
        })
    },
    
    addFeature() {
      this.featureInputs.push({ name: '', value: 0 })
    },
    
    removeFeature(index) {
      if (this.featureInputs.length > 1) {
        this.featureInputs.splice(index, 1)
      } else {
        this.$message.warning('至少需要保留一个特征')
      }
    },
    
    makeSinglePrediction() {
      if (!this.singlePredictionForm.modelKey) {
        this.$message.warning('请选择一个模型')
        return
      }
      
      // 检查特征输入是否完整
      const emptyFeatures = this.featureInputs.filter(f => !f.name)
      if (emptyFeatures.length > 0) {
        this.$message.warning('请为所有特征提供名称')
        return
      }
      
      this.singlePredictionLoading = true
      
      // 准备输入数据
      const inputData = [
        this.featureInputs.reduce((obj, feature) => {
          obj[feature.name] = feature.value
          return obj
        }, {})
      ]
      
      request.post('/api/predict', {
        model_key: this.singlePredictionForm.modelKey,
        input_data: inputData
      })
        .then(response => {
          if (response.data.success) {
            this.singlePredictionResult = response.data.predictions[0] // 获取第一个预测结果
            this.$message.success('预测完成')
          } else {
            this.$message.error(response.data.message || '预测失败')
          }
        })
        .catch(error => {
          console.error('Error making prediction:', error)
          this.$message.error('预测失败: ' + (error.response?.data?.message || error.message))
        })
        .finally(() => {
          this.singlePredictionLoading = false
        })
    },
    
    // 文件上传相关方法
    uploadFile(params) {
      this.uploadedFile = params.file
      // 这里不实际上传，只保存文件引用
      params.onSuccess()
    },
    
    handleRemove(file, fileList) {
      this.uploadedFile = null
      this.fileList = fileList
    },
    
    handlePreview(file) {
      console.log('Preview file:', file)
    },
    
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    
    makeBatchPrediction() {
      if (!this.batchPredictionForm.modelKey) {
        this.$message.warning('请选择一个模型')
        return
      }
      
      if (!this.uploadedFile) {
        this.$message.warning('请上传数据文件')
        return
      }
      
      this.batchPredictionLoading = true
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', this.uploadedFile)
      formData.append('model_key', this.batchPredictionForm.modelKey)
      
      request.post('/api/predict_batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          if (response.data.success) {
            this.batchPredictionResult = response.data.predictions
            
            // 生成表格列
            if (this.batchPredictionResult.length > 0) {
              const firstRow = this.batchPredictionResult[0]
              this.batchPredictionColumns = Object.keys(firstRow).map(key => {
                return {
                  prop: key,
                  label: key,
                  width: ''
                }
              })
            }
            
            this.$message.success('批量预测完成')
          } else {
            this.$message.error(response.data.message || '批量预测失败')
          }
        })
        .catch(error => {
          console.error('Error making batch prediction:', error)
          this.$message.error('批量预测失败: ' + (error.response?.data?.message || error.message))
        })
        .finally(() => {
          this.batchPredictionLoading = false
        })
    },
    
    exportToExcel() {
      if (!this.batchPredictionResult || this.batchPredictionResult.length === 0) {
        this.$message.warning('没有可导出的数据')
        return
      }
      
      // 这里简化处理，实际项目中可以使用xlsx库导出Excel
      this.$message.info('导出Excel功能待实现，可使用xlsx库完成')
    }
  }
}
</script>

<style scoped>
.prediction-container {
  margin-bottom: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.feature-inputs {
  margin-bottom: 20px;
}
</style> 