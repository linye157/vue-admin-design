<template>
  <div class="ml-system-container">
    <el-steps :active="activeStep" finish-status="success" align-center>
      <el-step title="数据加载" description="加载和预处理数据"></el-step>
      <el-step title="模型训练" description="训练和评估模型"></el-step>
      <el-step title="模型预测" description="使用模型进行预测"></el-step>
      <el-step title="结果可视化" description="查看模型性能和预测结果"></el-step>
    </el-steps>

    <div class="step-content" v-if="activeStep === 0">
      <h2>步骤 1: 数据加载与预处理</h2>
      <data-loader @data-loaded="onDataLoaded"></data-loader>
    </div>

    <div class="step-content" v-else-if="activeStep === 1">
      <h2>步骤 2: 模型训练与评估</h2>
      <model-training></model-training>
      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="nextStep">下一步</el-button>
      </div>
    </div>

    <div class="step-content" v-else-if="activeStep === 2">
      <h2>步骤 3: 模型预测</h2>
      <prediction-page></prediction-page>
      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="nextStep">下一步</el-button>
      </div>
    </div>

    <div class="step-content" v-else-if="activeStep === 3">
      <h2>步骤 4: 结果可视化</h2>
      <dashboard></dashboard>
      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="finishWorkflow">完成</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import DataLoader from './DataLoader'
import ModelTraining from './ModelTraining'
import PredictionPage from './PredictionPage'
import Dashboard from './Dashboard'

export default {
  name: 'MLSystem',
  components: {
    DataLoader,
    ModelTraining,
    PredictionPage,
    Dashboard
  },
  data() {
    return {
      activeStep: 0
    }
  },
  methods: {
    onDataLoaded(success) {
      if (success) {
        // Automatically move to next step when data is loaded
        this.$message.success('数据加载成功，进入模型训练阶段')
        this.nextStep()
      }
    },
    
    nextStep() {
      if (this.activeStep < 3) {
        this.activeStep++
      }
    },
    
    prevStep() {
      if (this.activeStep > 0) {
        this.activeStep--
      }
    },
    
    finishWorkflow() {
      this.$message.success('机器学习工作流程已完成！')
      this.activeStep = 0 // Reset to beginning
    }
  }
}
</script>

<style scoped>
.ml-system-container {
  padding: 20px;
}

.step-content {
  margin-top: 40px;
}

.step-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

h2 {
  margin-bottom: 20px;
  font-weight: 500;
  color: #303133;
}
</style> 