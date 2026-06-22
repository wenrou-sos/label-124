const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

const DEFAULT_STUDENT_ID = 1

router.get('/coach/:coachId', async (req, res) => {
  try {
    const coachId = Number(req.params.coachId)
    const reviews = await services.review.listByCoach(coachId)
    success(res, reviews)
  } catch (err) {
    console.error('Get reviews error:', err)
    fail(res, '获取评价列表失败')
  }
})

router.get('/course/:courseId', async (req, res) => {
  try {
    const courseId = Number(req.params.courseId)
    const review = await services.review.getByCourseId(courseId)
    success(res, review)
  } catch (err) {
    console.error('Get review by course error:', err)
    fail(res, '获取评价失败')
  }
})

router.post('/', async (req, res) => {
  try {
    const { coachId, courseId, ratings, content, tags, studentName, avatar } = req.body

    if (!coachId || !courseId || !ratings) {
      return fail(res, '参数不完整')
    }

    const dims = ['attitude', 'professionalism', 'patience', 'punctuality']
    for (const dim of dims) {
      if (typeof ratings[dim] !== 'number' || ratings[dim] < 1 || ratings[dim] > 5) {
        return fail(res, `${dim}评分必须在1-5之间`)
      }
    }

    if (content && content.length > 500) {
      return fail(res, '评价内容不能超过500字')
    }

    const review = await services.review.create({
      coachId,
      studentId: DEFAULT_STUDENT_ID,
      studentName: studentName || '我',
      studentAvatar: avatar || '🧑',
      courseId,
      ratings,
      content: content || '',
      tags: tags || [],
    })

    success(res, review, '评价成功')
  } catch (err) {
    console.error('Create review error:', err)
    fail(res, err.message || '评价失败')
  }
})

module.exports = router
