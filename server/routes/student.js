const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

const DEFAULT_STUDENT_ID = 1

router.post('/login', (req, res) => {
  const { phone, password } = req.body
  if (!phone || !password) {
    return fail(res, '手机号和密码不能为空')
  }
  const student = services.student.getByPhone(phone)
  if (!student || student.password !== password) {
    return fail(res, '手机号或密码错误')
  }
  const { password: _, ...userInfo } = student
  success(res, { user: userInfo, token: 'mock-token-' + student.id })
})

router.get('/profile', (req, res) => {
  const student = services.student.getById(DEFAULT_STUDENT_ID)
  if (!student) {
    return fail(res, '学员不存在')
  }
  const { password, ...userInfo } = student
  success(res, userInfo)
})

router.get('/progress', (req, res) => {
  const progress = services.student.getProgress(DEFAULT_STUDENT_ID)
  success(res, progress)
})

module.exports = router
