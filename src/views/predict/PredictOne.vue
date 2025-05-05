<template>
  <div>
    <Hints>
      <template slot="hintName">使用说明</template>
      <template slot="hintInfo">
         <p>若没有训练，请先跳转模型训练页面训练后，输入相同的模型名进行预测</p>
      </template>
    </Hints>
    <el-container style="height: 100vh;">
      <el-row style="height: 100%; width: 100%; margin: 0;">
        <!-- 左侧输入部分 -->
        <el-col :span="16" style="padding: 20px; border-right: 1px solid #dcdfe6;">
          <el-card shadow="hover" style="height: 100%;">
            <h3 slot="header" style="margin: 0; font-size: 18px; font-weight: bold; color: #1e88e5; text-align: center;">输入参数</h3>
            <el-row :gutter="20">
              <!-- 化学成分 -->
              <el-col :span="12">
                <el-card shadow="hover" style="height: 100%;">
                  <h4 slot="header" style="margin: 0; font-size: 15px; font-weight: bold;  color: #e53935; text-align: center;">化学成分</h4>
                  <el-form :model="chemicalForm" label-width="120px">
                    <el-form-item v-for="(value, key) in chemicalForm" :key="key" :label="key" style="font-weight: bold;">
                      <el-input v-model="chemicalForm[key]" placeholder="请输入值"></el-input>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>
              <!-- 工艺参数 -->
              <el-col :span="12" style="height: 100%;">
                <el-card shadow="hover" style="height: 100%;" >
                  <h4 slot="header" style="margin: 0; font-size: 15px; font-weight: bold;  color: #e53935; text-align: center;">工艺参数</h4>
                  <el-form :model="processForm" label-width="120px">
                    <el-form-item v-for="(value, key) in processForm" :key="key" :label="key" style="font-weight: bold;">
                      <el-input v-model="processForm[key]" placeholder="请输入值"></el-input>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>
            </el-row >

            <!-- 输入框 -->
            <el-row style="margin-top: 20px; display: flex; justify-content: center;">
              <el-form label-width="120px" style="width: 300px;">
                <el-form-item label="模型名称" style="font-weight: bold;">
                  <el-input v-model="modelName" placeholder="请输入模型名称" />
                </el-form-item>
              </el-form>
            </el-row>

          
            <el-row style="display: flex; justify-content: center;">
              <el-button size = "large" type="primary" @click="handleSubmit" round style="padding: 15px 20px; font-size: 16px; font-weight: bold; color: #fff;">预测</el-button>
              <el-button type="warning" size = "large" style="margin-left: 30px;padding: 15px 20px; font-size: 16px; font-weight: bold; color: #fff;" @click="handleReset" round>重置</el-button>
            </el-row>
          </el-card>
        </el-col>

        <!-- 右侧预测结果 -->
        <el-col :span="8" style="padding: 20px;">
          <el-card shadow="hover" style="height: 100%;">
            <h3 slot="header" style="margin: 0; font-size: 18px; font-weight: bold;  color: #1e88e5; text-align: center;">预测结果</h3>
            <div style="margin-top: 20px;">
              <div v-if="loading" style="text-align: center;">
                <el-spinner></el-spinner>
                <p>预测中，请稍候...</p>
              </div>
              <div v-else-if="result">
                <el-divider>
                  <span style="font-size: 18px; font-weight: bold;">预测值</span>
                </el-divider>
                <el-form :model="result" label-width="70px">
                  <el-form-item v-for="(value, key) in result" :key="key" :label="key" style="font-weight: bold;">
                    <el-input v-model="result[key]" placeholder="请进行预测" disabled style="width: 200px; font-size: 16px; font-weight: bold; color: #333; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);"></el-input>
                  </el-form-item>
                </el-form>
              </div>
              <div v-else style="text-align: center; color: #909399; font-size: 18px; font-weight: bold;">
                尚未进行预测
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
      // 化学成分输入
      chemicalForm: {
        "碳含量 (C)": "",
        "硅含量 (Si)": "",
        "锰含量 (Mn)": "",
        "氮含量 (N)":"",
        "铌含量 (Nb)":"",
        "钙含量 (CA)":"",
      },
      // 工艺参数输入
      processForm: {
        "订单宽度": "",
        "热轧厚度": "",
        "冷轧厚度": "",
        "热轧平均温度": "",
        "钢板宽度": "",
        "连退平均速度":"",
        "轧制速度":"",
        "平均冷矫延伸":"",
        "上板平均温度":"",
        "精轧温度":"",
        "卷曲温度":"",
        "轧制力":"",
      },
      modelName: '', // 模型名称
      // 状态
      loading: false,
      result: null,
    };
  },
  methods: {
    handleSubmit() {
      // 简单校验
      if (
        Object.values(this.chemicalForm).some((value) => !value) ||
        Object.values(this.processForm).some((value) => !value) || !this.modelName
      ) {
        this.$message.error("请填写所有参数！");
        return;
      }

      this.loading = true;
      this.result = null;

      // 模拟请求，替换为实际后端接口
      axios
        .post("http://localhost:8080/predictOne", {
          chemical: this.chemicalForm,
          process: this.processForm,
          modelName: this.modelName
        })
        .then((response) => {
          if(response.data.code == 200) {
            this.result = response.data.data; // 假设后端返回结果
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
      Object.keys(this.chemicalForm).forEach((key) => (this.chemicalForm[key] = ""));
      Object.keys(this.processForm).forEach((key) => (this.processForm[key] = ""));
      this.modelName = '';
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