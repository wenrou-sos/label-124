const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

router.get('/', async (req, res) => {
  const { subject } = req.query
  const list = await services.coach.list(subject)
  success(res, list)
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const coach = await services.coach.getById(id)
  if (!coach) return fail(res, '教练不存在')
  success(res, coach)
})

router.get('/:id/schedule', async (req, res) => {
  const id = Number(req.params.id)
  const schedule = await services.coach.getSchedule(id)
  success(res, schedule)
})

router.get('/:id/reviews', async (req, res) => {
  const id = Number(req.params.id)
  const reviews = await services.coach.getReviews(id)
  success(res, reviews)
})

module.exports = router
