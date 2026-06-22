const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

const DEFAULT_STUDENT_ID = services.DEFAULT_STUDENT_ID

router.post('/login', async (req, res) => {
  const { phone, password } = req.body
  if (!phone || !password) return fail(res, '手机号和密码不能为空')
  const student = await services.student.getByPhone(phone)
  if (!student || student.password !== password) return fail(res, '手机号或密码错误')
  const { password: _, ...info } = student
  success(res, { user: info, token: 'mock-token-' + student.id })
})

router.get('/profile', async (req, res) => {
  const student = await services.student.getById(DEFAULT_STUDENT_ID)
  if (!student) return fail(res, '学员不存在')
  const { password, ...info } = student
  success(res, info)
})

router.get('/progress', async (req, res) => {
  const progress = await services.student.getProgress(DEFAULT_STUDENT_ID)
  success(res, progress)
})

module.exports = router
