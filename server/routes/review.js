const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

router.get('/coach/:coachId', async (req, res) => {
  const coachId = Number(req.params.coachId)
  const reviews = await services.review.listByCoach(coachId)
  success(res, reviews)
})

router.post('/', async (req, res) => {
  const { coachId, courseId, ratings, content, tags, studentName, avatar } = req.body
  if (!coachId || !courseId || !ratings) return fail(res, '参数不完整')

  const st = await services.course.getStatus(courseId)
  if (!st) return fail(res, '课程不存在')
  if (st.status !== 'completed') return fail(res, '只有已完成的课程才能评价')
  if (st.reviewed) return fail(res, '该课程已评价过')

  const created = await services.review.create({
    coachId, courseId, ratings,
    content: content || '',
    tags: tags || [],
    studentName: studentName || '我',
    avatar: avatar || '🧑',
  })
  if (!created) return fail(res, '评价失败，可能重复提交')
  success(res, created, '评价成功')
})

module.exports = router
