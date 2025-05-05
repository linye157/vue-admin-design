<template>
  <div>
    <Hints>
      <template slot="hintName">使用说明</template>
      <template slot="hintInfo">
        <p>输入预期的力学性能，点击优化即可生成适合的工艺参数等</p>
      </template>
    </Hints>
    <el-container style="height: 100vh;">
      <el-row style="height: 100%; width: 100%; margin: 0;">
        <!-- 左侧输入部分 -->
        <el-col :span="8" style="padding: 20px; border-right: 1px solid #dcdfe6;">
          <el-card shadow="hover" style="height: 100%;">
            <h3 slot="header" style="margin: 0; font-size: 18px; font-weight: bold; color: #1e88e5; text-align: center;">力学性能输入</h3>
            <el-row :gutter="20">
              <!-- 化学成分 -->
              <el-col>
                <el-card shadow="hover" style="height: 100%;">
                  <h4 slot="header" style="margin: 0; font-size: 15px; font-weight: bold;  color: #e53935; text-align: center;">力学性能</h4>
                  <el-form :model="predictForm" label-width="40px">
                    <el-form-item v-for="(value, key) in predictForm" :key="key" :label="key" style="font-weight: bold;">
                      <el-input v-model="predictForm[key]" placeholder="请输入值"></el-input>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>
            </el-row >
            <el-row style="margin-top: 20px; display: flex; justify-content: center;">
              <el-button size = "large" type="primary" @click="handleSubmit" round style="padding: 15px 20px; font-size: 16px; font-weight: bold; color: #fff;">优化</el-button>
              <el-button type="warning" size = "large" style="margin-left: 20px; font-size: 16px; font-weight: bold; color: #fff;" @click="handleReset" round>重置</el-button>
            </el-row> 
          </el-card>
        </el-col>

        <!-- 右侧预测结果 -->
        <el-col :span="16" style="padding: 20px;">
          <el-card shadow="hover" style="height: 100%;">
            <h3 slot="header" style="margin: 0; font-size: 18px; font-weight: bold; color: #1e88e5; text-align: center;">优化结果</h3>
            <div style="margin-top: 20px;">
              <div v-if="loading" style="text-align: center;">
                <el-spinner></el-spinner>
                <p>优化中，请稍候...</p>
              </div>
              <div v-else-if="result">
                <el-divider>
                  <span style="font-size: 18px; font-weight: bold;">优化值</span>
                </el-divider>
                <el-form :model="result" label-width="120px" style="display: flex; flex-wrap: wrap; gap: 20px;">
                  <el-form-item v-for="(value, key) in result" :key="key" :label="key" style="font-weight: bold; flex: 1 1 calc(50% - 20px);">
                    <el-input v-model="result[key]" placeholder="请进行预测" disabled style="width: 200px; font-size: 16px; font-weight: bold; color: #333; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);"></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div v-else style="text-align: center; color: #909399; font-size: 18px; font-weight: bold;">
                尚未进行优化
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-container>
  </div>
  
</template>

<script>
import axios from "axios";
import Hints from '../../components/Hints'

export default {
  components: { Hints },
  data() {
    return {
      predictForm: {
        "YS": "",
        "TS": "",
        "EL": ""
      },
      // 状态
      loading: false,
      result: null,
    };
  },
  methods: {
    handleSubmit() {
      // 简单校验
      if (
        Object.values(this.predictForm).some((value) => !value)
      ) {
        this.$message.error("请填写所有参数！");
        return;
      }

      this.loading = true;
      this.result = null;

      // 模拟请求,替换为实际后端接口
      axios
        .post("http://localhost:8080/optimization", {
          predict: this.predictForm,
        })
        .then((response) => {
          if(response.data.code == 200) {
            this.result = Object.fromEntries(response.data.data);
            console.log(this.result);
          } else {
            this.$message.error(`预测失败: ${response.data.msg}`);
          }
        })
        .catch((error) => {
          console.error(error);
          this.$message.error("预测失败，请稍后重试！");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleReset() {
      // 重置输入值
      Object.keys(this.predictForm).forEach((key) => (this.predictForm[key] = ""));
      this.result = null;
    },
  },
};
</script>

<style scoped>

.el-row {
  margin-bottom: 10px;
}
</style>