<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>模型性能对比</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="refreshData">刷新数据</el-button>
          </div>
          <div v-if="loading" class="chart-loading">
            <el-progress type="circle" :percentage="loadingProgress"></el-progress>
            <p>加载中...</p>
          </div>
          <div v-else>
            <div id="modelComparisonChart" class="chart-container"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>特征重要性分析</span>
          </div>
          <div v-if="loading" class="chart-loading">
            <el-progress type="circle" :percentage="loadingProgress"></el-progress>
            <p>加载中...</p>
          </div>
          <div v-else>
            <div id="featureImportanceChart" class="chart-container"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>预测vs实际值</span>
          </div>
          <div v-if="loading" class="chart-loading">
            <el-progress type="circle" :percentage="loadingProgress"></el-progress>
            <p>加载中...</p>
          </div>
          <div v-else>
            <div id="predVsActualChart" class="chart-container"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>模型评估指标</span>
          </div>
          <div v-if="loading" class="chart-loading">
            <el-progress type="circle" :percentage="loadingProgress"></el-progress>
            <p>加载中...</p>
          </div>
          <div v-else>
            <el-table
              :data="metricsTableData"
              style="width: 100%"
              border>
              <el-table-column
                prop="model"
                label="模型"
                width="180">
              </el-table-column>
              <el-table-column
                prop="target"
                label="目标变量"
                width="180">
              </el-table-column>
              <el-table-column
                prop="mse"
                label="MSE">
              </el-table-column>
              <el-table-column
                prop="rmse"
                label="RMSE">
              </el-table-column>
              <el-table-column
                prop="mae"
                label="MAE">
              </el-table-column>
              <el-table-column
                prop="r2"
                label="R²">
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>运行历史记录</span>
          </div>
          <div v-if="loading" class="chart-loading">
            <el-progress type="circle" :percentage="loadingProgress"></el-progress>
            <p>加载中...</p>
          </div>
          <div v-else>
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in runHistory"
                :key="index"
                :timestamp="activity.timestamp"
                :type="activity.type">
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import request from '@/utils/request'
import * as echarts from 'echarts'

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: true,
      loadingProgress: 0,
      modelComparisonChart: null,
      featureImportanceChart: null,
      predVsActualChart: null,
      metricsTableData: [],
      runHistory: []
    }
  },
  mounted() {
    this.loadData()
  },
  beforeDestroy() {
    // 销毁图表实例，避免内存泄漏
    if (this.modelComparisonChart) {
      this.modelComparisonChart.dispose()
    }
    if (this.featureImportanceChart) {
      this.featureImportanceChart.dispose()
    }
    if (this.predVsActualChart) {
      this.predVsActualChart.dispose()
    }
  },
  methods: {
    loadData() {
      this.loading = true
      this.loadingProgress = 0
      
      // 模拟进度
      const progressInterval = setInterval(() => {
        this.loadingProgress += 10
        if (this.loadingProgress >= 90) {
          clearInterval(progressInterval)
        }
      }, 300)
      
      // 获取仪表盘数据
      request.get('/api/dashboard_data')
        .then(response => {
          if (response.data.success) {
            this.initCharts(response.data)
            this.metricsTableData = this.prepareMetricsTableData(response.data.metrics)
            this.runHistory = response.data.run_history || []
          } else {
            this.$message.error(response.data.message || '获取仪表盘数据失败')
          }
        })
        .catch(error => {
          console.error('Error loading dashboard data:', error)
          this.$message.error('获取仪表盘数据失败: ' + (error.response?.data?.message || error.message))
          
          // 使用模拟数据进行演示
          this.initChartsWithMockData()
        })
        .finally(() => {
          clearInterval(progressInterval)
          this.loadingProgress = 100
          setTimeout(() => {
            this.loading = false
          }, 500)
        })
    },
    
    refreshData() {
      this.loadData()
    },
    
    initCharts(data) {
      this.$nextTick(() => {
        this.initModelComparisonChart(data.model_comparison)
        this.initFeatureImportanceChart(data.feature_importance)
        this.initPredVsActualChart(data.pred_vs_actual)
      })
    },
    
    initChartsWithMockData() {
      // 模拟数据用于演示
      const mockModelComparison = {
        models: ['LR', 'RF', 'XGBR', 'SVR', 'Stacking', 'AutoML'],
        r2_scores: [0.75, 0.82, 0.85, 0.79, 0.87, 0.88],
        rmse_scores: [0.25, 0.18, 0.15, 0.21, 0.13, 0.12]
      }
      
      const mockFeatureImportance = {
        features: ['特征1', '特征2', '特征3', '特征4', '特征5', '特征6', '特征7', '特征8', '特征9', '特征10'],
        importance: [0.15, 0.12, 0.10, 0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03]
      }
      
      const mockPredVsActual = {
        actual: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        predicted: [1.1, 1.9, 3.2, 3.9, 5.1, 6.2, 6.8, 8.1, 9.2, 9.8]
      }
      
      this.$nextTick(() => {
        this.initModelComparisonChart(mockModelComparison)
        this.initFeatureImportanceChart(mockFeatureImportance)
        this.initPredVsActualChart(mockPredVsActual)
        
        // 模拟指标表格数据
        this.metricsTableData = [
          { model: 'LR', target: '目标1', mse: '0.0625', rmse: '0.2500', mae: '0.2000', r2: '0.7500' },
          { model: 'RF', target: '目标1', mse: '0.0324', rmse: '0.1800', mae: '0.1500', r2: '0.8200' },
          { model: 'XGBR', target: '目标1', mse: '0.0225', rmse: '0.1500', mae: '0.1200', r2: '0.8500' },
          { model: 'SVR', target: '目标1', mse: '0.0441', rmse: '0.2100', mae: '0.1700', r2: '0.7900' },
          { model: 'Stacking', target: '目标1', mse: '0.0169', rmse: '0.1300', mae: '0.1000', r2: '0.8700' },
          { model: 'AutoML', target: '目标1', mse: '0.0144', rmse: '0.1200', mae: '0.0900', r2: '0.8800' }
        ]
        
        // 模拟运行历史
        this.runHistory = [
          { timestamp: '2023-06-01 10:30:00', type: 'primary', content: '加载数据集 (65个特征, 3个目标变量)' },
          { timestamp: '2023-06-01 10:35:00', type: 'success', content: '训练随机森林模型 (RF) - R² = 0.82' },
          { timestamp: '2023-06-01 10:40:00', type: 'success', content: '训练XGBoost模型 (XGBR) - R² = 0.85' },
          { timestamp: '2023-06-01 10:45:00', type: 'success', content: '训练Stacking集成模型 - R² = 0.87' },
          { timestamp: '2023-06-01 10:50:00', type: 'warning', content: '运行AutoML流程 (5个模型, 3折交叉验证)' },
          { timestamp: '2023-06-01 11:00:00', type: 'success', content: 'AutoML完成 - 最佳模型: XGBR, R² = 0.88' }
        ]
      })
    },
    
    initModelComparisonChart(data) {
      const chartDom = document.getElementById('modelComparisonChart')
      this.modelComparisonChart = echarts.init(chartDom)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['R²', 'RMSE']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.models
        },
        yAxis: [
          {
            type: 'value',
            name: 'R²',
            min: 0,
            max: 1,
            interval: 0.1,
            position: 'left'
          },
          {
            type: 'value',
            name: 'RMSE',
            min: 0,
            max: Math.max(...data.rmse_scores) * 1.2,
            interval: 0.1,
            position: 'right'
          }
        ],
        series: [
          {
            name: 'R²',
            type: 'bar',
            yAxisIndex: 0,
            data: data.r2_scores,
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: 'RMSE',
            type: 'line',
            yAxisIndex: 1,
            data: data.rmse_scores,
            itemStyle: {
              color: '#ee6666'
            }
          }
        ]
      }
      
      this.modelComparisonChart.setOption(option)
    },
    
    initFeatureImportanceChart(data) {
      const chartDom = document.getElementById('featureImportanceChart')
      this.featureImportanceChart = echarts.init(chartDom)
      
      // 按重要性排序
      const sortedData = data.features.map((feature, index) => ({
        feature,
        importance: data.importance[index]
      })).sort((a, b) => b.importance - a.importance)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '重要性'
        },
        yAxis: {
          type: 'category',
          data: sortedData.map(item => item.feature),
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        series: [
          {
            name: '特征重要性',
            type: 'bar',
            data: sortedData.map(item => item.importance),
            itemStyle: {
              color: function(params) {
                // 颜色渐变
                const colorList = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
                return colorList[params.dataIndex % colorList.length]
              }
            }
          }
        ]
      }
      
      this.featureImportanceChart.setOption(option)
    },
    
    initPredVsActualChart(data) {
      const chartDom = document.getElementById('predVsActualChart')
      this.predVsActualChart = echarts.init(chartDom)
      
      // 准备散点图数据
      const scatterData = data.actual.map((actual, index) => [actual, data.predicted[index]])
      
      // 计算理想预测线的范围
      const minVal = Math.min(Math.min(...data.actual), Math.min(...data.predicted))
      const maxVal = Math.max(Math.max(...data.actual), Math.max(...data.predicted))
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `实际值: ${params.value[0]}<br>预测值: ${params.value[1]}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '实际值',
          min: minVal,
          max: maxVal
        },
        yAxis: {
          type: 'value',
          name: '预测值',
          min: minVal,
          max: maxVal
        },
        series: [
          {
            name: '预测vs实际',
            type: 'scatter',
            data: scatterData,
            itemStyle: {
              color: '#5470c6'
            }
          },
          {
            name: '理想预测线',
            type: 'line',
            data: [[minVal, minVal], [maxVal, maxVal]],
            showSymbol: false,
            lineStyle: {
              type: 'dashed',
              color: '#ee6666'
            }
          }
        ]
      }
      
      this.predVsActualChart.setOption(option)
    },
    
    prepareMetricsTableData(metrics) {
      if (!metrics) return []
      
      const tableData = []
      
      // 将嵌套的指标数据转换为表格格式
      Object.entries(metrics).forEach(([modelName, modelMetrics]) => {
        Object.entries(modelMetrics).forEach(([targetName, targetMetrics]) => {
          tableData.push({
            model: modelName,
            target: targetName,
            mse: this.formatNumber(targetMetrics.mse),
            rmse: this.formatNumber(targetMetrics.rmse),
            mae: this.formatNumber(targetMetrics.mae),
            r2: this.formatNumber(targetMetrics.r2)
          })
        })
      })
      
      return tableData
    },
    
    formatNumber(num) {
      if (num === undefined || num === null) return '-'
      return Number.isInteger(num) ? num.toString() : num.toFixed(4)
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.chart-container {
  height: 400px;
  width: 100%;
}
.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}
</style> 