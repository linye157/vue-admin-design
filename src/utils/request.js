import axios from 'axios'
import { Message } from 'element-ui'

// Create axios instance with base URL
const service = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 30000
})

// Request interceptor
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.log('Error:', error)
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service 