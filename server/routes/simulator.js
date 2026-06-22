const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

const DEFAULT_STUDENT_ID = 1

router.get('/info', (req, res) => {
  const info = services.simulator.getInfo()
  success(res, info)
})

router.get('/sessions', (req, res) => {
  const sessions = services.simulator.getSessions()
  success(res, sessions)
})

router.get('/my-bookings', (req, res) => {
  const bookings = services.simulator.getMyBookings(DEFAULT_STUDENT_ID)
  success(res, bookings)
})

router.post('/book', (req, res) => {
  const { sessionDate, slot } = req.body

  if (!sessionDate || !slot) {
    return fail(res, '参数不完整')
  }

  const booking = services.simulator.book(DEFAULT_STUDENT_ID, sessionDate, slot)

  if (!booking) {
    return fail(res, '该时段已被预约，请勿重复预约')
  }

  success(res, booking, '预约支付成功')
})

module.exports = router
