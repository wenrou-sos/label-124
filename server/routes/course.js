const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail, isWithinCancelWindow } = require('../utils/date')

const DEFAULT_STUDENT_ID = services.DEFAULT_STUDENT_ID

router.get('/', async (req, res) => {
  const { status } = req.query
  const list = await services.course.listByStudent(DEFAULT_STUDENT_ID, status)
  success(res, list)
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const course = await services.course.getById(id)
  if (!course) return fail(res, '课程不存在')
  success(res, course)
})

router.post('/book', async (req, res) => {
  const { coachId, date, timeSlot, location, subject, message } = req.body
  if (!coachId || !date || !timeSlot || !timeSlot.id) return fail(res, '参数不完整')

  const allSlots = await services.timeSlots()
  if (!allSlots.some(s => s.id === timeSlot.id)) return fail(res, '时段不存在')

  const coach = await services.coach.getById(coachId)
  if (!coach) return fail(res, '教练不存在')

  const newCourse = await services.course.create({
    coachId,
    coachName: coach.name,
    coachAvatar: coach.avatar,
    date,
    timeSlot: allSlots.find(s => s.id === timeSlot.id),
    location: location || (coach.subject === 2 ? '阳光驾校训练场地A区 - 3号位' : '市区道路训练场'),
    subject: subject || coach.subject,
    message: message || '',
  })

  if (!newCourse) return fail(res, '该时段已被预约，请勿重复预约')

  const canCancel = isWithinCancelWindow(newCourse.date, newCourse.timeSlot.start, 2)
  success(res, { ...newCourse, canCancel }, '预约成功')
})

router.post('/:id/cancel', async (req, res) => {
  const id = Number(req.params.id)
  const course = await services.course.getById(id)
  if (!course) return fail(res, '课程不存在')
  if (course.status !== 'upcoming') return fail(res, '只有待上课的课程可以取消')

  const canCancelFree = isWithinCancelWindow(course.date, course.timeSlot.start, 2)
  await services.course.cancel(id, '个人原因')

  success(res, {
    course: { ...course, status: 'cancelled' },
    canCancelFree,
    message: canCancelFree ? '取消成功，已全额退还' : '取消成功，已扣除50学分',
  })
})

module.exports = router
