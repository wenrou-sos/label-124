const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail, isWithinCancelWindow } = require('../utils/date')

const DEFAULT_STUDENT_ID = 1

router.get('/', (req, res) => {
  const { status } = req.query
  const list = services.course.listByStudent(DEFAULT_STUDENT_ID, status)
  success(res, list)
})

router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  const course = services.course.getById(id)
  if (!course) {
    return fail(res, '课程不存在')
  }
  success(res, course)
})

router.post('/book', (req, res) => {
  const { coachId, date, timeSlot, location, subject, message } = req.body

  if (!coachId || !date || !timeSlot) {
    return fail(res, '参数不完整')
  }

  const coach = services.coach.getById(coachId)
  if (!coach) {
    return fail(res, '教练不存在')
  }

  const newCourse = services.course.create({
    studentId: DEFAULT_STUDENT_ID,
    coachId,
    coachName: coach.name,
    coachAvatar: coach.avatar,
    date,
    timeSlot,
    location: location || (subject === 2 ? '阳光驾校训练场地A区 - 3号位' : '市区道路训练场'),
    subject: subject || coach.subject,
    message: message || '',
  })

  if (!newCourse) {
    return fail(res, '该时段已被预约，请勿重复预约')
  }

  success(res, newCourse, '预约成功')
})

router.post('/:id/cancel', (req, res) => {
  const id = Number(req.params.id)
  const course = services.course.getById(id)

  if (!course) {
    return fail(res, '课程不存在')
  }

  if (course.status !== 'upcoming') {
    return fail(res, '只有待上课的课程可以取消')
  }

  const canCancelFree = isWithinCancelWindow(course.date, course.timeSlot.start, 2)
  const result = services.course.cancel(id, '个人原因')

  if (result) {
    success(res, {
      course: result,
      canCancelFree,
      message: canCancelFree ? '取消成功，已全额退还' : '取消成功，已扣除50学分',
    })
  } else {
    fail(res, '取消失败')
  }
})

module.exports = router
