const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const config = require('./config')
const db = require('./db/index')

const studentRouter = require('./routes/student')
const coachRouter = require('./routes/coach')
const courseRouter = require('./routes/course')
const reviewRouter = require('./routes/review')
const simulatorRouter = require('./routes/simulator')
const commonRouter = require('./routes/common')

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app._ready = (async () => {
  await db.init()
  try {
    const fn = db.tryAddMissingSimulatorSessions
    if (typeof fn === 'function') {
      await fn()
      console.log('✅ 模拟器时段初始化完成')
    }
  } catch (e) {
    console.warn('⚠️  模拟器时段初始化跳过：', e.message)
  }
})()

app.get('/', (req, res) => {
  res.json({
    code: 0,
    message: '驾校学员端API服务',
    version: '1.0.0',
    dataSource: db.isMySQL ? 'mysql' : 'memory',
  })
})

app.use('/api/student', studentRouter)
app.use('/api/coach', coachRouter)
app.use('/api/course', courseRouter)
app.use('/api/review', reviewRouter)
app.use('/api/simulator', simulatorRouter)
app.use('/api/common', commonRouter)

app.use((req, res) => {
  res.status(404).json({ code: -1, message: '接口不存在: ' + req.method + ' ' + req.path, data: null })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err && err.message ? err.message : err)
  res.status(500).json({ code: -1, message: '服务器内部错误', data: null })
})

app.listen(config.port, () => {
  console.log(`🚀 服务器运行在 http://localhost:${config.port}`)
  console.log(`📊 数据源模式: ${db.isMySQL ? 'MySQL' : '内存模式(无MySQL连接时降级)'}`)
  console.log(`📚 API列表:`)
  const routes = [
    ['GET', '/', '健康检查'],
    ['GET', '/api/common/meta', '元数据配置(时段/预设消息/周几)'],
    ['POST', '/api/student/login', '登录'],
    ['GET', '/api/student/profile', '学员信息'],
    ['GET', '/api/student/progress', '学习进度'],
    ['GET', '/api/coach', '教练列表(支持?subject=2筛选)'],
    ['GET', '/api/coach/:id', '教练详情'],
    ['GET', '/api/coach/:id/schedule', '教练未来7天课表'],
    ['GET', '/api/coach/:id/reviews', '教练评价列表'],
    ['GET', '/api/course', '我的课程(?status=upcoming/completed/cancelled)'],
    ['GET', '/api/course/:id', '课程详情'],
    ['POST', '/api/course/book', '预约课程'],
    ['POST', '/api/course/:id/cancel', '取消课程'],
    ['GET', '/api/review/coach/:coachId', '教练评价列表(另一个入口)'],
    ['POST', '/api/review', '提交评价'],
    ['GET', '/api/simulator/info', '模拟训练信息'],
    ['GET', '/api/simulator/sessions', '模拟训练时段列表'],
    ['GET', '/api/simulator/my-bookings', '我的模拟预约'],
    ['POST', '/api/simulator/book', '预约模拟训练'],
  ]
  routes.forEach(([m, p, desc]) => console.log(`   ${m.padEnd(6)} ${p.padEnd(40)} ${desc}`))
})
