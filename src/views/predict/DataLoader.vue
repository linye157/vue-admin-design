<template>
  <div class="data-loader-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>数据加载</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="loadData">加载数据</el-button>
      </div>
      <div v-if="loading" class="loading-container">
        <el-progress type="circle" :percentage="loadingProgress"></el-progress>
        <p>正在加载数据，请稍候...</p>
      </div>
      <div v-else-if="dataLoaded">
        <el-alert
          title="数据加载成功"
          type="success"
          :closable="false"
          show-icon>
        </el-alert>
        <el-divider content-position="left">数据集信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="训练集样本数">{{ dataInfo.X_train_shape[0] }}</el-descriptions-item>
          <el-descriptions-item label="测试集样本数">{{ dataInfo.X_test_shape[0] }}</el-descriptions-item>
          <el-descriptions-item label="特征数量">{{ dataInfo.X_train_shape[1] }}</el-descriptions-item>
          <el-descriptions-item label="目标变量数量">{{ dataInfo.y_train_shape[1] }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider content-position="left">特征列表</el-divider>
        <el-tag
          v-for="feature in dataInfo.feature_names"
          :key="feature"
          style="margin-right: 5px; margin-bottom: 5px;">
          {{ feature }}
        </el-tag>
        
        <el-divider content-position="left">目标变量</el-divider>
        <el-tag
          v-for="target in dataInfo.target_names"
          :key="target"
          type="success"
          style="margin-right: 5px; margin-bottom: 5px;">
          {{ target }}
        </el-tag>
      </div>
      <div v-else>
        <el-alert
          title="请点击右上角的按钮加载数据"
          type="info"
          :closable="false"
          show-icon>
        </el-alert>
      </div>
    </el-card>
    
    <el-card class="box-card" v-if="dataLoaded">
      <div slot="header" class="clearfix">
        <span>数据预处理选项</span>
      </div>
      <el-form label-width="120px">
        <el-form-item label="特征标准化">
          <el-switch v-model="scaleFeatures"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="reloadData">重新加载数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'DataLoader',
  data() {
    return {
      loading: false,
      loadingProgress: 0,
      dataLoaded: false,
      dataInfo: {
        X_train_shape: [0, 0],
        y_train_shape: [0, 0],
        X_test_shape: [0, 0],
        y_test_shape: [0, 0],
        feature_names: [],
        target_names: []
      },
      scaleFeatures: true
    }
  },
  methods: {
    loadData() {
      this.loading = true
      this.loadingProgress = 0
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        this.loadingProgress += 10
        if (this.loadingProgress >= 90) {
          clearInterval(progressInterval)
        }
      }, 300)
      
      // Call backend API
      request.post('/api/load_data', {
        scale_features: this.scaleFeatures
      })
        .then(response => {
          if (response.data.success) {
            this.dataInfo = response.data.data_info
            this.dataLoaded = true
            this.$message.success('数据加载成功')
            
            // Emit event to parent component
            this.$emit('data-loaded', true)
          } else {
            this.$message.error(response.data.message || '数据加载失败')
          }
        })
        .catch(error => {
          console.error('Error loading data:', error)
          this.$message.error('数据加载失败: ' + (error.response?.data?.message || error.message))
        })
        .finally(() => {
          clearInterval(progressInterval)
          this.loadingProgress = 100
          setTimeout(() => {
            this.loading = false
          }, 500)
        })
    },
    reloadData() {
      this.dataLoaded = false
      this.loadData()
    }
  }
}
</script>

<style scoped>
.data-loader-container {
  margin-bottom: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style> 