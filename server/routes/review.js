const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

const DEFAULT_STUDENT_ID = 1

router.get('/coach/:coachId', (req, res) => {
  const coachId = Number(req.params.coachId)
  const reviews = services.review.listByCoach(coachId)
  success(res, reviews)
})

router.post('/', (req, res) => {
  const { coachId, courseId, ratings, content, tags, studentName, avatar } = req.body

  if (!coachId || !courseId || !ratings) {
    return fail(res, '参数不完整')
  }

  const course = services.course.getById(courseId)
  if (!course) {
    return fail(res, '课程不存在')
  }

  if (course.reviewed) {
    return fail(res, '该课程已评价过')
  }

  const review = services.review.create({
    coachId,
    courseId,
    studentName: studentName || '我',
    avatar: avatar || '🧑',
    ratings,
    content: content || '',
    tags: tags || [],
  })

  services.course.markReviewed(courseId)

  success(res, review, '评价成功')
})

module.exports = router
