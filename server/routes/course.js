const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

const DEFAULT_STUDENT_ID = 1

router.get('/', async (req, res) => {
  try {
    const { status } = req.query
    const list = await services.course.listByStudent(DEFAULT_STUDENT_ID, status)
    success(res, list)
  } catch (err) {
    console.error('Get courses error:', err)
    fail(res, '获取课程列表失败')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const course = await services.course.getById(id)
    if (!course) {
      return fail(res, '课程不存在')
    }
    success(res, course)
  } catch (err) {
    console.error('Get course detail error:', err)
    fail(res, '获取课程详情失败')
  }
})

router.post('/book', async (req, res) => {
  try {
    const { coachId, date, timeSlot, location, subject, message } = req.body

    if (!coachId || !date || !timeSlot) {
      return fail(res, '参数不完整')
    }

    const coach = await services.coach.getById(coachId)
    if (!coach) {
      return fail(res, '教练不存在')
    }

    const student = await services.student.getById(DEFAULT_STUDENT_ID)
    if (!student) {
      return fail(res, '学员信息异常')
    }

    if (student.remainingHours < 2) {
      return fail(res, '剩余学时不足，请先充值学时')
    }

    const newCourse = await services.course.create({
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
  } catch (err) {
    console.error('Book course error:', err)
    fail(res, '预约失败：' + (err.message || '系统错误'))
  }
})

router.post('/:id/cancel', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { reason } = req.body
    const course = await services.course.getById(id)

    if (!course) {
      return fail(res, '课程不存在')
    }

    if (course.studentId !== DEFAULT_STUDENT_ID) {
      return fail(res, '无权操作此课程')
    }

    if (course.status !== 'upcoming') {
      return fail(res, '只有待上课的课程可以取消')
    }

    const result = await services.course.cancel(id, reason || '个人原因')

    if (result) {
      success(res, {
        course: result.course,
        canCancelFree: result.canCancelFree,
        message: result.canCancelFree ? '取消成功，已全额退还学时' : '取消成功，已扣除50学分',
      })
    } else {
      fail(res, '取消失败')
    }
  } catch (err) {
    console.error('Cancel course error:', err)
    fail(res, '取消失败：' + (err.message || '系统错误'))
  }
})

router.get('/:id/review-status', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const course = await services.course.getById(id)
    if (!course) {
      return fail(res, '课程不存在')
    }
    success(res, {
      canReview: course.status === 'completed' && !course.reviewed,
      reviewed: course.reviewed,
      status: course.status,
    })
  } catch (err) {
    console.error('Get review status error:', err)
    fail(res, '获取评价状态失败')
  }
})

module.exports = router
