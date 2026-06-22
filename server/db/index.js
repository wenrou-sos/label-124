const mysql = require('mysql2/promise')
const config = require('../config')
const memory = require('../data/memory')
const { getDateStr } = require('../utils/date')

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

let pool = null
let connected = false

async function tryConnect() {
  try {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      connectionLimit: config.mysql.connectionLimit || 10,
      timezone: '+08:00',
    })
    await pool.execute('SELECT 1 as test')
    connected = true
    console.log('✅ 已连接 MySQL 数据库')
    return true
  } catch (e) {
    connected = false
    console.warn('⚠️  MySQL 连接失败，自动降级为内存模式：', e.message)
    return false
  }
}

function toCamel(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj
  const result = {}
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = obj[key]
  }
  return result
}
function toCamelArr(arr) {
  if (!Array.isArray(arr)) return arr
  return arr.map(item => toCamel(item))
}

async function query(sql, params = []) {
  if (!connected) throw new Error('MySQL not connected')
  const [rows] = await pool.execute(sql, params)
  return rows
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function formatTime(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`
}

const mysqlDB = {
  async getStudentById(id) {
    const rows = await query(
      'SELECT id, student_no, name, avatar, phone, school, enroll_date, total_hours, used_hours, remaining_hours, credits FROM students WHERE id = ?',
      [id]
    )
    return rows.length ? { ...toCamel(rows[0]), enrollDate: rows[0].enroll_date && formatDate(new Date(rows[0].enroll_date)) } : null
  },
  async getStudentByPhone(phone) {
    const rows = await query(
      'SELECT id, student_no, name, avatar, phone, password, school, enroll_date, total_hours, used_hours, remaining_hours, credits FROM students WHERE phone = ?',
      [phone]
    )
    return rows.length ? toCamel(rows[0]) : null
  },
  async getStudentProgress(studentId) {
    const rows = await query(
      'SELECT id, student_id, subject, subject_name, full_name, status, icon, training_hours, required_hours, pass_date, score, color FROM subject_progress WHERE student_id = ? ORDER BY subject',
      [studentId]
    )
    return rows.map(r => ({
      ...toCamel(r),
      trainingHours: Number(r.training_hours),
      requiredHours: Number(r.required_hours),
      passDate: r.pass_date ? formatDate(new Date(r.pass_date)) : null,
    }))
  },
  async listCoaches(subject) {
    let sql = `SELECT c.id, c.name, c.avatar, c.gender, c.age, c.experience, c.car_model, c.car_no, c.rating, c.rating_count, c.students, c.pass_rate, c.tags, c.phone, c.subject, c.rest_day, r.attitude, r.professionalism, r.patience, r.punctuality FROM coaches c LEFT JOIN coach_ratings r ON c.id = r.coach_id`
    const params = []
    if (subject !== undefined && subject !== null && subject !== '') {
      sql += ' WHERE c.subject = ?'
      params.push(Number(subject))
    }
    sql += ' ORDER BY c.rating DESC'
    const rows = await query(sql, params)
    return rows.map(row => ({
      id: row.id, name: row.name, avatar: row.avatar, gender: row.gender, age: row.age, experience: row.experience,
      carModel: row.car_model, carNo: row.car_no, rating: Number(row.rating), ratingCount: row.rating_count, students: row.students,
      passRate: row.pass_rate, tags: row.tags ? row.tags.split(',') : [], phone: row.phone, subject: row.subject, restDay: row.rest_day,
      ratings: {
        attitude: Number(row.attitude ?? 5.0), professionalism: Number(row.professionalism ?? 5.0),
        patience: Number(row.patience ?? 5.0), punctuality: Number(row.punctuality ?? 5.0),
      }
    }))
  },
  async getCoachById(id) {
    const list = await this.listCoaches()
    return list.find(c => c.id === Number(id)) || null
  },
  async listTimeSlots() {
    const rows = await query('SELECT id, name, start_time, end_time, period, sort_order FROM time_slots ORDER BY sort_order')
    return rows.map(r => ({ id: r.id, name: r.name, start: r.start_time && r.start_time.slice(0, 5), end: r.end_time && r.end_time.slice(0, 5), period: r.period }))
  },
  async getCoachSchedule(coachId) {
    const coach = await this.getCoachById(coachId)
    if (!coach) return []
    const timeSlots = await this.listTimeSlots()
    const maxCount = 6
    const schedule = []
    for (let i = 0; i < 7; i++) {
      const dateObj = new Date()
      dateObj.setDate(dateObj.getDate() + i + 1)
      const dateStr = formatDate(dateObj)
      const weekday = dateObj.getDay()
      const isRestDay = coach.restDay === weekday
      const slots = []
      for (const ts of timeSlots) {
        let status = 'available'
        let bookedCount = 0
        if (isRestDay) {
          status = 'rest'
        } else {
          const rows = await query(`SELECT COUNT(*) as cnt FROM courses WHERE coach_id = ? AND course_date = ? AND time_slot_id = ? AND status != 'cancelled'`, [coachId, dateStr, ts.id])
          bookedCount = Number(rows[0].cnt)
          if (bookedCount >= maxCount) status = 'full'
        }
        slots.push({ id: ts.id, name: ts.name, start: ts.start, end: ts.end, period: ts.period, status, bookedCount, maxCount })
      }
      schedule.push({
        date: dateStr, weekday: WEEK_DAYS[weekday], dayNum: dateObj.getDate(), month: dateObj.getMonth() + 1,
        isRestDay, isToday: false, slots
      })
    }
    return schedule
  },
  async listCoachReviews(coachId) {
    const rows = await query(`SELECT id, coach_id, student_name, student_avatar, created_at, course_id, attitude, professionalism, patience, punctuality, content, tags FROM reviews WHERE coach_id = ? ORDER BY created_at DESC`, [coachId])
    return rows.map(row => ({
      id: row.id, coachId: row.coach_id, studentName: row.student_name, avatar: row.student_avatar,
      date: row.created_at ? formatDate(new Date(row.created_at)) : '', courseId: row.course_id,
      ratings: { attitude: row.attitude, professionalism: row.professionalism, patience: row.patience, punctuality: row.punctuality },
      content: row.content, tags: row.tags ? row.tags.split(',') : []
    }))
  },
  async listCoursesByStudent(studentId, status) {
    let sql = `SELECT id, student_id, coach_id, coach_name, coach_avatar, course_date, time_slot_id, time_start, time_end, time_slot_name, time_period, location, subject, hours, status, message, cancel_reason, cancelled_at, reviewed, created_at FROM courses WHERE student_id = ?`
    const params = [studentId]
    if (status && status !== 'all') {
      sql += ' AND status = ?'
      params.push(status)
    }
    sql += ' ORDER BY FIELD(status, "upcoming","completed","cancelled"), course_date DESC, time_start DESC'
    const rows = await query(sql, params)
    return rows.map(r => ({
      id: r.id, studentId: r.student_id, coachId: r.coach_id, coachName: r.coach_name, coachAvatar: r.coach_avatar,
      date: r.course_date ? formatDate(new Date(r.course_date)) : '',
      timeSlot: { id: r.time_slot_id, name: r.time_slot_name, start: (r.time_start || '').slice(0, 5), end: (r.time_end || '').slice(0, 5), period: r.time_period },
      location: r.location, subject: r.subject, hours: Number(r.hours), status: r.status,
      message: r.message, cancelReason: r.cancel_reason, cancelledAt: r.cancelled_at, reviewed: !!r.reviewed,
      createdAt: r.created_at ? formatDate(new Date(r.created_at)) : ''
    }))
  },
  async getCourseById(id) {
    const rows = await query(`SELECT id, student_id, coach_id, coach_name, coach_avatar, course_date, time_slot_id, time_start, time_end, time_slot_name, time_period, location, subject, hours, status, message, cancel_reason, cancelled_at, reviewed, created_at FROM courses WHERE id = ?`, [id])
    if (!rows.length) return null
    const r = rows[0]
    return {
      id: r.id, studentId: r.student_id, coachId: r.coach_id, coachName: r.coach_name, coachAvatar: r.coach_avatar,
      date: r.course_date ? formatDate(new Date(r.course_date)) : '',
      timeSlot: { id: r.time_slot_id, name: r.time_slot_name, start: (r.time_start || '').slice(0, 5), end: (r.time_end || '').slice(0, 5), period: r.time_period },
      location: r.location, subject: r.subject, hours: Number(r.hours), status: r.status,
      message: r.message, reviewed: !!r.reviewed,
    }
  },
  async getCourseStatus(id) {
    const rows = await query('SELECT status, reviewed FROM courses WHERE id = ?', [id])
    return rows.length ? { status: rows[0].status, reviewed: !!rows[0].reviewed } : null
  },
  async hasBookedCourse(coachId, date, timeSlotId) {
    const rows = await query(`SELECT COUNT(*) as cnt FROM courses WHERE coach_id = ? AND course_date = ? AND time_slot_id = ? AND status != 'cancelled'`, [coachId, date, timeSlotId])
    return Number(rows[0].cnt) > 0
  },
  async createCourse(data) {
    const { studentId, coachId, coachName, coachAvatar, date, timeSlot, location, subject, message, hours = 2 } = data
    try {
      await query(
        `INSERT INTO courses (student_id, coach_id, coach_name, coach_avatar, course_date, time_slot_id, time_start, time_end, time_slot_name, time_period, location, subject, hours, status, message, reviewed) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)`,
        [studentId, coachId, coachName, coachAvatar, date, timeSlot.id, timeSlot.start, timeSlot.end, timeSlot.name || '', timeSlot.period || '', location, subject, hours, 'upcoming', message || '']
      )
      const idRows = await query('SELECT LAST_INSERT_ID() as id')
      return this.getCourseById(idRows[0].id)
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return null
      throw e
    }
  },
  async cancelCourse(id, reason = '个人原因') {
    await query(`UPDATE courses SET status = 'cancelled', cancel_reason = ?, cancelled_at = NOW() WHERE id = ?`, [reason, id])
    return true
  },
  async markCourseReviewed(id) {
    await query('UPDATE courses SET reviewed = 1 WHERE id = ?', [id])
    return true
  },
  async listReviewsByCoach(coachId) { return this.listCoachReviews(coachId) },
  async createReview(data) {
    const { coachId, studentId, studentName, studentAvatar, courseId, ratings, content, tags } = data
    const tagsStr = Array.isArray(tags) ? tags.join(',') : ''
    try {
      await query(
        `INSERT INTO reviews (coach_id, student_id, student_name, student_avatar, course_id, attitude, professionalism, patience, punctuality, content, tags) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [coachId, studentId, studentName, studentAvatar, courseId, ratings.attitude, ratings.professionalism, ratings.patience, ratings.punctuality, content || '', tagsStr]
      )
      return true
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return null
      throw e
    }
  },
  async recalcCoachRating(coachId) {
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      const [rows] = await conn.execute(`SELECT AVG(attitude) a, AVG(professionalism) p, AVG(patience) pa, AVG(punctuality) pu, COUNT(*) cnt FROM reviews WHERE coach_id = ?`, [coachId])
      const r = rows[0]
      if (r.cnt > 0) {
        const a = Number(r.a || 5), p = Number(r.p || 5), pa = Number(r.pa || 5), pu = Number(r.pu || 5)
        const overall = Number(((a + p + pa + pu) / 4).toFixed(1))
        await conn.execute(`INSERT INTO coach_ratings (coach_id, attitude, professionalism, patience, punctuality) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE attitude=VALUES(attitude), professionalism=VALUES(professionalism), patience=VALUES(patience), punctuality=VALUES(punctuality)`, [coachId, a.toFixed(1), p.toFixed(1), pa.toFixed(1), pu.toFixed(1)])
        await conn.execute(`UPDATE coaches SET rating = ?, rating_count = ? WHERE id = ?`, [overall, r.cnt, coachId])
      }
      await conn.commit()
      return true
    } catch (e) {
      await conn.rollback()
      throw e
    } finally {
      conn.release()
    }
  },
  async getSimulatorInfo() {
    const rows = await query('SELECT name, description, duration, location, notice, faq FROM simulator_info LIMIT 1')
    if (!rows.length) return null
    const r = rows[0]
    return {
      name: r.name, description: r.description, duration: r.duration, location: r.location,
      notice: r.notice ? r.notice.split('|').filter(Boolean) : [],
      faq: (r.faq || '').split('||').filter(Boolean).map(pair => {
        const [q, a] = pair.split('|')
        return { q, a }
      })
    }
  },
  async listSimulatorSessions() {
    const rows = await query(`SELECT id, session_date, slot_id, start_time, end_time, status, price, max_count, booked_count FROM simulator_sessions WHERE session_date >= CURDATE() ORDER BY session_date, start_time`)
    const map = new Map()
    for (const r of rows) {
      const d = new Date(r.session_date)
      const dateStr = formatDate(d)
      if (!map.has(dateStr)) {
        map.set(dateStr, {
          id: 'sim' + dateStr.replace(/-/g, '').slice(2),
          date: dateStr, weekday: WEEK_DAYS[d.getDay()],
          dayNum: d.getDate(), month: d.getMonth() + 1, slots: []
        })
      }
      map.get(dateStr).slots.push({
        id: r.slot_id, start: (r.start_time || '').slice(0, 5), end: (r.end_time || '').slice(0, 5),
        status: r.status, price: Number(r.price), maxCount: r.max_count, bookedCount: r.booked_count
      })
    }
    return Array.from(map.values())
  },
  async listMySimulatorBookings(studentId) {
    const rows = await query(`SELECT id, session_date, slot_id, start_time, end_time, price, status FROM simulator_bookings WHERE student_id = ? ORDER BY session_date DESC, start_time DESC`, [studentId])
    return rows.map(r => ({
      id: r.id, studentId, date: r.session_date ? formatDate(new Date(r.session_date)) : '',
      slot: { id: r.slot_id, start: (r.start_time || '').slice(0, 5), end: (r.end_time || '').slice(0, 5) },
      price: Number(r.price), status: r.status
    }))
  },
  async hasBookedSimulator(studentId, date, slotId) {
    const rows = await query(`SELECT COUNT(*) as cnt FROM simulator_bookings WHERE student_id = ? AND session_date = ? AND slot_id = ? AND status != 'cancelled'`, [studentId, date, slotId])
    return Number(rows[0].cnt) > 0
  },
  async bookSimulator(studentId, sessionDate, slot) {
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      const [updateRes] = await conn.execute(
        `UPDATE simulator_sessions SET booked_count = booked_count + 1, status = CASE WHEN booked_count + 1 >= max_count THEN 'full' ELSE status END WHERE session_date = ? AND slot_id = ? AND status = 'available'`,
        [sessionDate, slot.id]
      )
      if (updateRes.affectedRows === 0) {
        await conn.rollback()
        return null
      }
      try {
        await conn.execute(
          `INSERT INTO simulator_bookings (student_id, session_date, slot_id, start_time, end_time, price, status) VALUES (?,?,?,?,?,?, 'upcoming')`,
          [studentId, sessionDate, slot.id, slot.start, slot.end, slot.price]
        )
      } catch (e) {
        await conn.rollback()
        if (e.code === 'ER_DUP_ENTRY') return null
        throw e
      }
      await conn.commit()
      return { ok: true }
    } catch (e) {
      try { await conn.rollback() } catch (_) { }
      throw e
    } finally {
      conn.release()
    }
  },
  async tryAddMissingSimulatorSessions() {
    if (!connected) return false
    const defaultSlots = [
      { id: 's1', start: '09:00', end: '11:00', price: 180 },
      { id: 's2', start: '13:00', end: '15:00', price: 180 },
      { id: 's3', start: '15:30', end: '17:30', price: 180 },
      { id: 's4', start: '18:00', end: '20:00', price: 200 },
    ]
    for (let i = 1; i <= 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i)
      const ds = formatDate(d)
      for (const s of defaultSlots) {
        const rows = await query('SELECT id FROM simulator_sessions WHERE session_date = ? AND slot_id = ?', [ds, s.id])
        if (!rows.length) {
          await query(`INSERT IGNORE INTO simulator_sessions (session_date, slot_id, start_time, end_time, status, price, max_count, booked_count) VALUES (?,?,?,?,'available',?,6,0)`, [ds, s.id, s.start, s.end, s.price])
        }
      }
    }
    return true
  }
}

function buildMemoryAdapter() {
  const W = WEEK_DAYS
  const TIME_SLOTS = [
    { id: 'morning1', name: '早班1', start: '08:00', end: '10:00', period: 'morning' },
    { id: 'morning2', name: '早班2', start: '10:00', end: '12:00', period: 'morning' },
    { id: 'afternoon1', name: '下午1', start: '14:00', end: '16:00', period: 'afternoon' },
    { id: 'afternoon2', name: '下午2', start: '16:00', end: '18:00', period: 'afternoon' },
    { id: 'evening', name: '晚班', start: '18:00', end: '20:00', period: 'evening' },
  ]
  return {
    getStudentById: (id) => memory.students.find(s => s.id === id) || null,
    getStudentByPhone: (phone) => memory.students.find(s => s.phone === phone) || null,
    getStudentProgress: (sid) => memory.subjectProgress.filter(p => p.studentId === sid),
    listCoaches: (subject) => subject ? memory.coaches.filter(c => c.subject === Number(subject)) : memory.coaches.slice(),
    getCoachById: (id) => memory.coaches.find(c => c.id === Number(id)) || null,
    listTimeSlots: () => TIME_SLOTS.slice(),
    getCoachSchedule(coachId) {
      const coach = memory.coaches.find(c => c.id === coachId); if (!coach) return []
      const out = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(); d.setDate(d.getDate() + i + 1)
        const ds = getDateStr(i + 1)
        const wd = d.getDay(); const isRest = coach.restDay === wd
        const slots = TIME_SLOTS.map(ts => {
          let status = 'available'; let bc = Math.floor(Math.random() * 3) + 1
          if (isRest) { status = 'rest'; bc = 0 }
          else {
            const ex = memory.courses.find(c => c.coachId === coachId && c.date === ds && c.timeSlot.id === ts.id && c.status !== 'cancelled')
            if (ex) bc += 1
            if (bc >= 6) status = 'full'
          }
          return { ...ts, status, bookedCount: bc, maxCount: 6 }
        })
        out.push({ date: ds, weekday: W[wd], dayNum: d.getDate(), month: d.getMonth() + 1, isRestDay: isRest, isToday: false, slots })
      }
      return out
    },
    listCoachReviews: (cid) => memory.reviews.filter(r => r.coachId === cid),
    listTimeSlots() {
      return [
        { id: 'morning1', name: '早班1', start: '08:00', end: '10:00', period: 'morning' },
        { id: 'morning2', name: '早班2', start: '10:00', end: '12:00', period: 'morning' },
        { id: 'afternoon1', name: '下午1', start: '14:00', end: '16:00', period: 'afternoon' },
        { id: 'afternoon2', name: '下午2', start: '16:00', end: '18:00', period: 'afternoon' },
        { id: 'evening', name: '晚班', start: '18:00', end: '20:00', period: 'evening' },
      ]
    },
    listCoursesByStudent(sid, status) {
      let list = memory.courses.filter(c => c.studentId === sid)
      if (status && status !== 'all') list = list.filter(c => c.status === status)
      const pr = { upcoming: 0, completed: 1, cancelled: 2 }
      return list.sort((a, b) => (pr[a.status] - pr[b.status]) || (new Date(b.date) - new Date(a.date)))
    },
    getCourseById: (id) => memory.courses.find(c => c.id === id) || null,
    getCourseStatus(id) { const c = memory.courses.find(x => x.id === id); return c ? { status: c.status, reviewed: !!c.reviewed } : null },
    hasBookedCourse(cid, date, tsid) {
      return memory.courses.some(c => c.coachId === cid && c.date === date && c.timeSlot.id === tsid && c.status !== 'cancelled')
    },
    createCourse(data) {
      if (this.hasBookedCourse(data.coachId, data.date, data.timeSlot.id)) return null
      const nc = { id: Date.now(), ...data, status: 'upcoming', createdAt: getDateStr(0), hours: 2, reviewed: false }
      memory.courses.unshift(nc); return nc
    },
    cancelCourse(id, reason = '个人原因') { const c = memory.courses.find(x => x.id === id); if (c) { c.status = 'cancelled'; c.cancelReason = reason; c.cancelledAt = getDateStr(0) } return true },
    markCourseReviewed(id) { const c = memory.courses.find(x => x.id === id); if (c) c.reviewed = true; return true },
    listReviewsByCoach: (cid) => memory.reviews.filter(r => r.coachId === cid),
    createReview(data) {
      if (memory.reviews.some(r => r.courseId === data.courseId)) return null
      const nr = { id: memory.getNextReviewId(), date: getDateStr(0), ...data }
      memory.reviews.unshift(nr); return true
    },
    recalcCoachRating(coachId) {
      const coach = memory.coaches.find(c => c.id === coachId); if (!coach) return true
      const rs = memory.reviews.filter(r => r.coachId === coachId); coach.ratingCount = rs.length
      const dims = ['attitude', 'professionalism', 'patience', 'punctuality']
      if (rs.length > 0) {
        const sums = { attitude: 0, professionalism: 0, patience: 0, punctuality: 0 }
        rs.forEach(r => dims.forEach(d => sums[d] += (r.ratings && r.ratings[d]) || 0))
        dims.forEach(d => coach.ratings[d] = Number((sums[d] / rs.length).toFixed(1)))
        coach.rating = Number((dims.reduce((s, d) => s + coach.ratings[d], 0) / 4).toFixed(1))
      }
      return true
    },
    getSimulatorInfo: () => memory.simulatorInfo,
    listSimulatorSessions: () => memory.simulatorSessions.slice(),
    listMySimulatorBookings(sid) {
      return memory.bookedSimulators.filter(b => b.studentId === sid).sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    hasBookedSimulator(sid, date, slotId) {
      return memory.bookedSimulators.some(s => s.studentId === sid && s.date === date && (s.slot.id === slotId || s.slot.start === slotId) && s.status !== 'cancelled')
    },
    bookSimulator(sid, sessionDate, slot) {
      if (this.hasBookedSimulator(sid, sessionDate, slot.start)) return null
      const ds = memory.simulatorSessions.find(d => d.date === sessionDate)
      if (ds) {
        const ts = ds.slots.find(x => x.id === slot.id || x.start === slot.start)
        if (ts && ts.status === 'available') {
          ts.bookedCount += 1
          if (ts.bookedCount >= ts.maxCount) ts.status = 'full'
        }
      }
      memory.bookedSimulators.unshift({ id: 'sim-booked-' + Date.now(), studentId: sid, date: sessionDate, slot: { start: slot.start, end: slot.end }, price: slot.price, status: 'upcoming' })
      return { ok: true }
    },
    tryAddMissingSimulatorSessions: () => true
  }
}

let activeDB = null

async function init() {
  const mysqlOk = config.dataSource === 'memory' ? false : await tryConnect()
  activeDB = mysqlOk ? mysqlDB : buildMemoryAdapter()
  return mysqlOk
}

function getDB() {
  if (!activeDB) activeDB = buildMemoryAdapter()
  return activeDB
}

function wrap(name) {
  return async function (...args) {
    return getDB()[name](...args)
  }
}

module.exports = {
  init,
  get isMySQL() { return connected },
  tryAddMissingSimulatorSessions: () => Promise.resolve().then(() => { try { return getDB().tryAddMissingSimulatorSessions() } catch(_) { return true } }),
  getStudentById: wrap('getStudentById'),
  getStudentByPhone: wrap('getStudentByPhone'),
  getStudentProgress: wrap('getStudentProgress'),
  listCoaches: wrap('listCoaches'),
  getCoachById: wrap('getCoachById'),
  listTimeSlots: wrap('listTimeSlots'),
  getCoachSchedule: wrap('getCoachSchedule'),
  listCoachReviews: wrap('listCoachReviews'),
  listCoursesByStudent: wrap('listCoursesByStudent'),
  getCourseById: wrap('getCourseById'),
  getCourseStatus: wrap('getCourseStatus'),
  hasBookedCourse: wrap('hasBookedCourse'),
  createCourse: wrap('createCourse'),
  cancelCourse: wrap('cancelCourse'),
  markCourseReviewed: wrap('markCourseReviewed'),
  listReviewsByCoach: wrap('listReviewsByCoach'),
  createReview: wrap('createReview'),
  recalcCoachRating: wrap('recalcCoachRating'),
  getSimulatorInfo: wrap('getSimulatorInfo'),
  listSimulatorSessions: wrap('listSimulatorSessions'),
  listMySimulatorBookings: wrap('listMySimulatorBookings'),
  hasBookedSimulator: wrap('hasBookedSimulator'),
  bookSimulator: wrap('bookSimulator'),
}
