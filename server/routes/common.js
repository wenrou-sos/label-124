const express = require('express')
const router = express.Router()
const services = require('../services')
const { success } = require('../utils/date')

const MESSAGE_PRESETS = [
  '想练倒库',
  '需要加强坡道起步',
  '多练侧方停车',
  '练习S弯技巧',
  '熟悉直角转弯',
  '综合训练为主',
]
const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

router.get('/meta', async (req, res) => {
  const timeSlots = await services.timeSlots()
  success(res, {
    timeSlots,
    messagePresets: MESSAGE_PRESETS,
    cancelWindowHours: 2,
    weekDays: WEEK_DAYS,
  })
})

module.exports = router
