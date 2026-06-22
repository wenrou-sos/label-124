const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

router.get('/', (req, res) => {
  const { subject } = req.query
  const list = services.coach.list(subject)
  success(res, list)
})

router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  const coach = services.coach.getById(id)
  if (!coach) {
    return fail(res, '教练不存在')
  }
  success(res, coach)
})

router.get('/:id/schedule', (req, res) => {
  const id = Number(req.params.id)
  const schedule = services.coach.getSchedule(id)
  success(res, schedule)
})

router.get('/:id/reviews', (req, res) => {
  const id = Number(req.params.id)
  const reviews = services.coach.getReviews(id)
  success(res, reviews)
})

module.exports = router
