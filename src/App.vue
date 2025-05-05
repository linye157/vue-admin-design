<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    document.title = '智能轧钢力学性能预测与优化系统'; // 设置固定标题
  }
}
</script>

<style lang="less">
@import "assets/less/index.less";
@import "assets/less/reset";
</style>
