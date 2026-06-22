const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const config = require('./config')

const studentRouter = require('./routes/student')
const coachRouter = require('./routes/coach')
const courseRouter = require('./routes/course')
const reviewRouter = require('./routes/review')
const simulatorRouter = require('./routes/simulator')

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`)
  next()
})

app.get('/', async (req, res) => {
  const { getCurrentDataSource, getServices } = require('./services')
  await getServices()
  res.json({
    code: 0,
    message: '驾校学员端API服务',
    version: '1.0.0',
    configDataSource: config.dataSource,
    activeDataSource: getCurrentDataSource(),
    apis: {
      'GET /api/student/profile': '学员信息',
      'GET /api/student/progress': '学习进度',
      'GET /api/coach': '教练列表',
      'GET /api/coach/:id': '教练详情',
      'GET /api/coach/:id/schedule': '教练课表',
      'GET /api/coach/:id/reviews': '教练评价',
      'GET /api/course': '我的课程列表',
      'GET /api/course/:id': '课程详情',
      'POST /api/course/book': '预约课程',
      'POST /api/course/:id/cancel': '取消课程',
      'GET /api/review/coach/:coachId': '教练评价列表',
      'POST /api/review': '提交评价',
      'GET /api/simulator/info': '模拟训练信息',
      'GET /api/simulator/sessions': '模拟训练时段',
      'GET /api/simulator/my-bookings': '我的模拟预约',
      'POST /api/simulator/book': '预约模拟训练',
    },
  })
})

app.use('/api/student', studentRouter)
app.use('/api/coach', coachRouter)
app.use('/api/course', courseRouter)
app.use('/api/review', reviewRouter)
app.use('/api/simulator', simulatorRouter)

app.use((req, res) => {
  res.status(404).json({ code: -1, message: '接口不存在', data: null })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ code: -1, message: '服务器内部错误', data: null })
})

async function startServer() {
  const { getServices, getCurrentDataSource } = require('./services')
  await getServices()
  app.listen(config.port, () => {
    console.log(`🚀 服务器运行在 http://localhost:${config.port}`)
    console.log(`📊 配置数据源: ${config.dataSource}`)
    console.log(`✅ 当前使用: ${getCurrentDataSource()}`)
  })
}

startServer()
