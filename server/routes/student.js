const express = require('express')
const router = express.Router()
const services = require('../services')
const { success, fail } = require('../utils/date')

const DEFAULT_STUDENT_ID = 1

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      return fail(res, '手机号和密码不能为空')
    }
    const student = await services.student.getByPhone(phone)
    if (!student || student.password !== password) {
      return fail(res, '手机号或密码错误')
    }
    const { password: _, ...userInfo } = student
    success(res, { user: userInfo, token: 'mock-token-' + student.id })
  } catch (err) {
    console.error('Login error:', err)
    fail(res, '登录失败')
  }
})

router.get('/profile', async (req, res) => {
  try {
    const student = await services.student.getById(DEFAULT_STUDENT_ID)
    if (!student) {
      return fail(res, '学员不存在')
    }
    const { password, ...userInfo } = student
    success(res, userInfo)
  } catch (err) {
    console.error('Get profile error:', err)
    fail(res, '获取学员信息失败')
  }
})

router.get('/progress', async (req, res) => {
  try {
    const progress = await services.student.getProgress(DEFAULT_STUDENT_ID)
    success(res, progress)
  } catch (err) {
    console.error('Get progress error:', err)
    fail(res, '获取学习进度失败')
  }
})

module.exports = router
