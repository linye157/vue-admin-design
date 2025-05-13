import Layout from '../layout'

/**
 * hidden: true                  如果设置为 true，该项菜单将不会显示在菜单栏中(默认为 false)
 * meta : {
    title: 'title'               菜单名
    icon: 'icon-name'            图标名
    fixed: true                  如果设置为 true，该项 tag 将一直存在 tag 栏中(默认为 false)
  }
 * */

export const asyncRoutes = [
  {
    path: '/ml-system',
    name: 'MLSystem',
    component: Layout,
    redirect: '/ml-system/workflow',
    children: [
      {
        path: 'workflow',
        name: 'MLSystemWorkflow',
        component: () => import('../views/predict/MLSystem'),
        meta: {
          title: '机器学习工作流',
          icon: 'el-icon-s-operation',
          fixed: true
        }
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'MLDashboard',
        component: () => import('../views/predict/Dashboard'),
        meta: {
          title: '机器学习仪表盘',
          icon: 'el-icon-s-data',
          fixed: true
        }
      }
    ]
  },
  {
    path: '/data',
    name: 'Data',
    component: Layout,
    redirect: '/data/loader',
    children: [
      {
        path: 'loader',
        name: 'DataLoader',
        component: () => import('../views/predict/DataLoader'),
        meta: {
          title: '数据加载',
          icon: 'el-icon-upload',
          fixed: true
        }
      }
    ]
  },
  {
    path: '/train',
    name: 'Train',
    component: Layout,
    redirect: '/train/models',
    children: [
      {
        path: 'models',
        name: 'ModelTraining',
        component: () => import('../views/predict/ModelTraining'),
        meta: {
          title: '模型训练',
          icon: 'el-icon-s-platform',
          fixed: true
        }
      }
    ]
  },
  {
    path: '/predict-page',
    name: 'Predict-page',
    component: Layout,
    redirect: '/predict-page/predict',
    meta: {
      title: '性能预测',
      icon: 'el-icon-s-marketing'
    },
    children: [
      {
        path: 'predict',
        name: 'PredictModel',
        component: () => import('../views/predict/PredictionPage'),
        meta: {
          title: '模型预测',   
        }
      },
      {
        path: 'predictOne',
        name: 'PredictOneModel',
        component: () => import('../views/predict/PredictOne'),
        meta: {
          title: '单数据预测',
        }
      }
    ]
  },
  {
    path: '/Optim',
    name: 'Optim',
    component: Layout,
    redirect: '/Optim',
    children: [
      {
        path: 'Optim',
        name: 'Optim',
        component: () => import('../views/predict/Optim'),
        meta: {
          title: '参数优化',
          icon: 'el-icon-s-tools',
          fixed: true
        }
      }
    ]
  },
  {
    path: '/Detect',
    name: 'Detect',
    component: Layout,
    redirect: '/Detect',
    children: [
      {
        path: 'Detect',
        name: 'Detect',
        component: () => import('../views/predict/Detect'),
        meta: {
          title: '缺陷检测',
          icon: 'el-icon-warning',
          fixed: true
        }
      }
    ]
  }
]
