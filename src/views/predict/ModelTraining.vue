<template>
  <div class="model-training-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="单模型训练" name="single">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>单模型训练</span>
          </div>
          <el-form :model="singleModelForm" label-width="120px">
            <el-form-item label="选择模型">
              <el-select v-model="singleModelForm.modelName" placeholder="请选择模型">
                <el-option label="线性回归 (LR)" value="LR"></el-option>
                <el-option label="随机森林 (RF)" value="RF"></el-option>
                <el-option label="XGBoost (XGBR)" value="XGBR"></el-option>
                <el-option label="支持向量机 (SVR)" value="SVR"></el-option>
                <el-option label="人工神经网络 (ANN)" value="ANN"></el-option>
              </el-select>
            </el-form-item>
            
            <!-- 模型参数设置 -->
            <div v-if="singleModelForm.modelName === 'RF'">
              <el-form-item label="树的数量">
                <el-input-number v-model="singleModelForm.params.n_estimators" :min="10" :max="500"></el-input-number>
              </el-form-item>
              <el-form-item label="最大深度">
                <el-input-number v-model="singleModelForm.params.max_depth" :min="3" :max="30"></el-input-number>
              </el-form-item>
            </div>
            
            <div v-else-if="singleModelForm.modelName === 'XGBR'">
              <el-form-item label="树的数量">
                <el-input-number v-model="singleModelForm.params.n_estimators" :min="10" :max="500"></el-input-number>
              </el-form-item>
              <el-form-item label="最大深度">
                <el-input-number v-model="singleModelForm.params.max_depth" :min="3" :max="15"></el-input-number>
              </el-form-item>
              <el-form-item label="学习率">
                <el-input-number v-model="singleModelForm.params.learning_rate" :min="0.01" :max="0.3" :step="0.01"></el-input-number>
              </el-form-item>
            </div>
            
            <div v-else-if="singleModelForm.modelName === 'SVR'">
              <el-form-item label="核函数">
                <el-select v-model="singleModelForm.params.kernel">
                  <el-option label="RBF" value="rbf"></el-option>
                  <el-option label="Linear" value="linear"></el-option>
                  <el-option label="Poly" value="poly"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="C值">
                <el-input-number v-model="singleModelForm.params.C" :min="0.1" :max="10" :step="0.1"></el-input-number>
              </el-form-item>
            </div>
            
            <el-form-item>
              <el-button type="primary" @click="trainSingleModel" :loading="singleModelLoading">开始训练</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 训练结果展示 -->
        <el-card class="box-card" v-if="singleModelResults">
          <div slot="header" class="clearfix">
            <span>训练结果 - {{ singleModelForm.modelName }}</span>
          </div>
          
          <el-descriptions title="评估指标" :column="2" border>
            <template v-for="(metrics, targetName) in singleModelResults.metrics">
              <el-descriptions-item :label="`${targetName} - MSE`" :key="`${targetName}-mse`">{{ formatNumber(metrics.mse) }}</el-descriptions-item>
              <el-descriptions-item :label="`${targetName} - RMSE`" :key="`${targetName}-rmse`">{{ formatNumber(metrics.rmse) }}</el-descriptions-item>
              <el-descriptions-item :label="`${targetName} - MAE`" :key="`${targetName}-mae`">{{ formatNumber(metrics.mae) }}</el-descriptions-item>
              <el-descriptions-item :label="`${targetName} - R²`" :key="`${targetName}-r2`">{{ formatNumber(metrics.r2) }}</el-descriptions-item>
            </template>
          </el-descriptions>
          
          <el-divider content-position="left">可视化结果</el-divider>
          <div class="visualization-container">
            <div v-for="(vis, index) in singleModelResults.visualizations" :key="index" class="visualization-item">
              <h4>{{ formatVisName(vis.name) }}</h4>
              <img :src="`data:image/png;base64,${vis.data}`" class="visualization-image" />
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="Stacking集成学习" name="stacking">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>Stacking集成学习</span>
          </div>
          <el-form :model="stackingForm" label-width="120px">
            <el-form-item label="基础学习器">
              <el-checkbox-group v-model="stackingForm.baseLearners">
                <el-checkbox label="LR">线性回归</el-checkbox>
                <el-checkbox label="RF">随机森林</el-checkbox>
                <el-checkbox label="XGBR">XGBoost</el-checkbox>
                <el-checkbox label="SVR">支持向量机</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="元学习器">
              <el-select v-model="stackingForm.metaLearner" placeholder="请选择元学习器">
                <el-option label="线性回归 (LR)" value="LR"></el-option>
                <el-option label="随机森林 (RF)" value="RF"></el-option>
                <el-option label="XGBoost (XGBR)" value="XGBR"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="交叉验证折数">
              <el-input-number v-model="stackingForm.cvFolds" :min="2" :max="10"></el-input-number>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="trainStackingModel" :loading="stackingLoading">开始训练</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- Stacking训练结果展示 -->
        <el-card class="box-card" v-if="stackingResults">
          <div slot="header" class="clearfix">
            <span>Stacking集成学习结果</span>
          </div>
          
          <el-descriptions title="评估指标" :column="2" border>
            <template v-for="(metrics, targetName) in stackingResults.metrics">
              <el-descriptions-item :label="`${targetName} - MSE`" :key="`${targetName}-mse`">{{ formatNumber(metrics.mse) }}</el-descriptions-item>
              <el-descriptions-item :label="`${targetName} - RMSE`" :key="`${targetName}-rmse`">{{ formatNumber(metrics.rmse) }}</el-descriptions-item>
              <el-descriptions-item :label="`${targetName} - MAE`" :key="`${targetName}-mae`">{{ formatNumber(metrics.mae) }}</el-descriptions-item>
              <el-descriptions-item :label="`${targetName} - R²`" :key="`${targetName}-r2`">{{ formatNumber(metrics.r2) }}</el-descriptions-item>
            </template>
          </el-descriptions>
          
          <el-divider content-position="left">可视化结果</el-divider>
          <div class="visualization-container">
            <div v-for="(vis, index) in stackingResults.visualizations" :key="index" class="visualization-item">
              <h4>{{ formatVisName(vis.name) }}</h4>
              <img :src="`data:image/png;base64,${vis.data}`" class="visualization-image" />
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="AutoML自动机器学习" name="automl">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>AutoML自动机器学习</span>
          </div>
          <el-form :model="automlForm" label-width="120px">
            <el-form-item label="选择模型">
              <el-checkbox-group v-model="automlForm.modelsToTry">
                <el-checkbox label="LR">线性回归</el-checkbox>
                <el-checkbox label="RF">随机森林</el-checkbox>
                <el-checkbox label="XGBR">XGBoost</el-checkbox>
                <el-checkbox label="SVR">支持向量机</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="评分标准">
              <el-select v-model="automlForm.scoring" placeholder="请选择评分标准">
                <el-option label="均方误差 (MSE)" value="neg_mean_squared_error"></el-option>
                <el-option label="平均绝对误差 (MAE)" value="neg_mean_absolute_error"></el-option>
                <el-option label="决定系数 (R²)" value="r2"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="交叉验证折数">
              <el-input-number v-model="automlForm.cvFolds" :min="2" :max="10"></el-input-number>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="runAutoML" :loading="automlLoading">开始训练</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- AutoML训练结果展示 -->
        <el-card class="box-card" v-if="automlResults">
          <div slot="header" class="clearfix">
            <span>AutoML训练结果</span>
          </div>
          
          <el-alert
            :title="`最佳模型: ${automlResults.best_model_info?.name || '未知'}`"
            type="success"
            :closable="false"
            show-icon>
          </el-alert>
          
          <el-descriptions title="评估指标" :column="2" border style="margin-top: 20px;">
            <template v-for="(metrics, targetName) in automlResults.metrics">
              <el-descriptions-item :label="`${targetName} - MSE`" :key="`${targetName}-mse`">{{ formatNumber(metrics.mse) }}</el-descriptions-item>
              <el-descriptions-item :label="`${targetName} - RMSE`" :key="`${targetName}-rmse`">{{ formatNumber(metrics.rmse) }}</el-descriptions-item>
              <el-descriptions-item :label="`${targetName} - MAE`" :key="`${targetName}-mae`">{{ formatNumber(metrics.mae) }}</el-descriptions-item>
              <el-descriptions-item :label="`${targetName} - R²`" :key="`${targetName}-r2`">{{ formatNumber(metrics.r2) }}</el-descriptions-item>
            </template>
          </el-descriptions>
          
          <el-divider content-position="left">可视化结果</el-divider>
          <div class="visualization-container">
            <div v-for="(vis, index) in automlResults.visualizations" :key="index" class="visualization-item">
              <h4>{{ formatVisName(vis.name) }}</h4>
              <img :src="`data:image/png;base64,${vis.data}`" class="visualization-image" />
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ModelTraining',
  data() {
    return {
      activeTab: 'single',
      
      // 单模型训练表单
      singleModelForm: {
        modelName: 'RF',
        params: {
          n_estimators: 100,
          max_depth: 10,
          learning_rate: 0.1,
          kernel: 'rbf',
          C: 1.0
        }
      },
      singleModelLoading: false,
      singleModelResults: null,
      
      // Stacking集成学习表单
      stackingForm: {
        baseLearners: ['RF', 'XGBR', 'LR'],
        metaLearner: 'LR',
        cvFolds: 3
      },
      stackingLoading: false,
      stackingResults: null,
      
      // AutoML表单
      automlForm: {
        modelsToTry: ['LR', 'RF', 'XGBR', 'SVR'],
        scoring: 'neg_mean_squared_error',
        cvFolds: 3
      },
      automlLoading: false,
      automlResults: null
    }
  },
  methods: {
    formatNumber(num) {
      if (num === undefined || num === null) return '-'
      return Number.isInteger(num) ? num : num.toFixed(4)
    },
    
    formatVisName(name) {
      // Remove file extension and replace underscores with spaces
      return name.replace('.png', '').replace(/_/g, ' ')
    },
    
    trainSingleModel() {
      if (!this.singleModelForm.modelName) {
        this.$message.warning('请选择一个模型')
        return
      }
      
      this.singleModelLoading = true
      
      // Prepare model parameters based on selected model
      let modelParams = {}
      if (this.singleModelForm.modelName === 'RF') {
        modelParams = {
          n_estimators: this.singleModelForm.params.n_estimators,
          max_depth: this.singleModelForm.params.max_depth
        }
      } else if (this.singleModelForm.modelName === 'XGBR') {
        modelParams = {
          n_estimators: this.singleModelForm.params.n_estimators,
          max_depth: this.singleModelForm.params.max_depth,
          learning_rate: this.singleModelForm.params.learning_rate
        }
      } else if (this.singleModelForm.modelName === 'SVR') {
        modelParams = {
          kernel: this.singleModelForm.params.kernel,
          C: this.singleModelForm.params.C
        }
      }
      
      request.post('/api/train_model', {
        model_name: this.singleModelForm.modelName,
        model_params: modelParams
      })
        .then(response => {
          if (response.data.success) {
            this.singleModelResults = response.data
            this.$message.success(`${this.singleModelForm.modelName}模型训练成功`)
          } else {
            this.$message.error(response.data.message || '模型训练失败')
          }
        })
        .catch(error => {
          console.error('Error training model:', error)
          this.$message.error('模型训练失败: ' + (error.response?.data?.message || error.message))
        })
        .finally(() => {
          this.singleModelLoading = false
        })
    },
    
    trainStackingModel() {
      if (this.stackingForm.baseLearners.length < 2) {
        this.$message.warning('请至少选择两个基础学习器')
        return
      }
      
      this.stackingLoading = true
      
      // Prepare base learners configuration
      const baseLearners = this.stackingForm.baseLearners.map(model => {
        if (model === 'RF') {
          return [model, { n_estimators: 30, max_depth: 7 }]
        } else if (model === 'XGBR') {
          return [model, { n_estimators: 30, max_depth: 4 }]
        } else {
          return [model, null]
        }
      })
      
      request.post('/api/train_stacking', {
        base_learners: baseLearners,
        meta_learner: [this.stackingForm.metaLearner, null],
        cv_folds: this.stackingForm.cvFolds
      })
        .then(response => {
          if (response.data.success) {
            this.stackingResults = response.data
            this.$message.success('Stacking集成模型训练成功')
          } else {
            this.$message.error(response.data.message || 'Stacking模型训练失败')
          }
        })
        .catch(error => {
          console.error('Error training stacking model:', error)
          this.$message.error('Stacking模型训练失败: ' + (error.response?.data?.message || error.message))
        })
        .finally(() => {
          this.stackingLoading = false
        })
    },
    
    runAutoML() {
      if (this.automlForm.modelsToTry.length === 0) {
        this.$message.warning('请至少选择一个模型')
        return
      }
      
      this.automlLoading = true
      
      request.post('/api/run_automl', {
        models_to_try: this.automlForm.modelsToTry,
        scoring: this.automlForm.scoring,
        cv_folds: this.automlForm.cvFolds
      })
        .then(response => {
          if (response.data.success) {
            this.automlResults = response.data
            this.$message.success('AutoML流程完成')
          } else {
            this.$message.error(response.data.message || 'AutoML流程失败')
          }
        })
        .catch(error => {
          console.error('Error running AutoML:', error)
          this.$message.error('AutoML流程失败: ' + (error.response?.data?.message || error.message))
        })
        .finally(() => {
          this.automlLoading = false
        })
    }
  }
}
</script>

<style scoped>
.model-training-container {
  margin-bottom: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.visualization-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.visualization-item {
  width: calc(50% - 10px);
  margin-bottom: 20px;
}
.visualization-image {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
@media (max-width: 768px) {
  .visualization-item {
    width: 100%;
  }
}
</style> 