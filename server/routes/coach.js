const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

router.get('/', async (req, res) => {
  try {
    const { subject } = req.query
    const list = await services.coach.list(subject)
    success(res, list)
  } catch (err) {
    console.error('Get coach list error:', err)
    fail(res, '获取教练列表失败')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const coach = await services.coach.getById(id)
    if (!coach) {
      return fail(res, '教练不存在')
    }
    success(res, coach)
  } catch (err) {
    console.error('Get coach detail error:', err)
    fail(res, '获取教练详情失败')
  }
})

router.get('/:id/schedule', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const schedule = await services.coach.getSchedule(id)
    success(res, schedule)
  } catch (err) {
    console.error('Get coach schedule error:', err)
    fail(res, '获取教练课表失败')
  }
})

router.get('/:id/reviews', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 10
    const reviews = await services.coach.getReviews(id, page, pageSize)
    success(res, reviews)
  } catch (err) {
    console.error('Get coach reviews error:', err)
    fail(res, '获取教练评价失败')
  }
})

module.exports = router
