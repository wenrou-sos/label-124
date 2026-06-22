export function formatDate(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${month}月${day}日 ${week}`
}

export function formatShortDate(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}/${day}`
}

export function isWithinCancelWindow(dateStr, timeStr, hours = 2) {
  const [h, m] = timeStr.split(':').map(Number)
  const courseTime = new Date(dateStr)
  courseTime.setHours(h, m, 0, 0)
  const now = new Date()
  const diff = courseTime.getTime() - now.getTime()
  const ms = hours * 60 * 60 * 1000
  return diff >= ms
}

export function getAvgRating(ratings) {
  if (!ratings) return 0
  const vals = Object.values(ratings)
  if (vals.length === 0) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}
