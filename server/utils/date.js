function getDateStr(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${month}月${day}日 ${week}`
}

function isWithinCancelWindow(dateStr, timeStr, hours = 2) {
  const [h, m] = timeStr.split(':').map(Number)
  const courseTime = new Date(dateStr)
  courseTime.setHours(h, m, 0, 0)
  const now = new Date()
  const diff = courseTime.getTime() - now.getTime()
  const ms = hours * 60 * 60 * 1000
  return diff >= ms
}

function success(res, data = null, message = 'success') {
  res.json({ code: 0, data, message })
}

function fail(res, message = 'error', code = -1) {
  res.json({ code, data: null, message })
}

module.exports = {
  getDateStr,
  formatDate,
  isWithinCancelWindow,
  success,
  fail,
}
