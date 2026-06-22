const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

const DEFAULT_STUDENT_ID = 1

router.get('/info', async (req, res) => {
  try {
    const info = await services.simulator.getInfo()
    success(res, info)
  } catch (err) {
    console.error('Get simulator info error:', err)
    fail(res, '获取模拟训练信息失败')
  }
})

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await services.simulator.getSessions()
    success(res, sessions)
  } catch (err) {
    console.error('Get simulator sessions error:', err)
    fail(res, '获取模拟训练时段失败')
  }
})

router.get('/my-bookings', async (req, res) => {
  try {
    const bookings = await services.simulator.getMyBookings(DEFAULT_STUDENT_ID)
    success(res, bookings)
  } catch (err) {
    console.error('Get my simulator bookings error:', err)
    fail(res, '获取我的模拟预约失败')
  }
})

router.post('/book', async (req, res) => {
  try {
    const { sessionDate, slot } = req.body

    if (!sessionDate || !slot) {
      return fail(res, '参数不完整')
    }

    const student = await services.student.getById(DEFAULT_STUDENT_ID)
    if (!student) {
      return fail(res, '学员信息异常')
    }

    const booking = await services.simulator.book(DEFAULT_STUDENT_ID, sessionDate, slot)

    if (!booking) {
      return fail(res, '该时段已被预约，请勿重复预约')
    }

    success(res, booking, '预约支付成功')
  } catch (err) {
    console.error('Book simulator error:', err)
    fail(res, '预约失败：' + (err.message || '系统错误'))
  }
})

module.exports = router
