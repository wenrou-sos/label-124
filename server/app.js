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

app.get('/', (req, res) => {
  res.json({
    code: 0,
    message: '驾校学员端API服务',
    version: '1.0.0',
    dataSource: config.dataSource,
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

app.listen(config.port, () => {
  console.log(`🚀 服务器运行在 http://localhost:${config.port}`)
  console.log(`📊 数据源模式: ${config.dataSource}`)
  console.log(`📚 API文档:`)
  console.log(`   GET  /api/student/profile    - 学员信息`)
  console.log(`   GET  /api/student/progress   - 学习进度`)
  console.log(`   GET  /api/coach              - 教练列表`)
  console.log(`   GET  /api/coach/:id          - 教练详情`)
  console.log(`   GET  /api/coach/:id/schedule - 教练课表`)
  console.log(`   GET  /api/course             - 我的课程`)
  console.log(`   POST /api/course/book        - 预约课程`)
  console.log(`   POST /api/course/:id/cancel  - 取消课程`)
  console.log(`   POST /api/review             - 提交评价`)
  console.log(`   GET  /api/simulator/info     - 模拟训练信息`)
  console.log(`   GET  /api/simulator/sessions - 模拟训练时段`)
  console.log(`   POST /api/simulator/book     - 预约模拟训练`)
})
