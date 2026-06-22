const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

const DEFAULT_STUDENT_ID = services.DEFAULT_STUDENT_ID

router.get('/info', async (req, res) => {
  const info = await services.simulator.getInfo()
  success(res, info)
})

router.get('/sessions', async (req, res) => {
  const sessions = await services.simulator.getSessions()
  success(res, sessions)
})

router.get('/my-bookings', async (req, res) => {
  const bookings = await services.simulator.getMyBookings(DEFAULT_STUDENT_ID)
  success(res, bookings)
})

router.post('/book', async (req, res) => {
  const { sessionDate, slot } = req.body
  if (!sessionDate || !slot || !slot.id) return fail(res, '参数不完整')

  const booking = await services.simulator.book(DEFAULT_STUDENT_ID, sessionDate, slot)
  if (!booking) return fail(res, '该时段已被预约，请勿重复预约')
  success(res, booking, '预约支付成功')
})

module.exports = router
