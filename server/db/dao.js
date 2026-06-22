const db = require('./pool')
const { getDateStr } = require('../utils/date')
const memory = require('./memory')

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const rowToCamel = (row) => {
  if (!row) return null
  const out = {}
  for (const k of Object.keys(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    out[camel] = row[k]
  }
  return out
}

const rowsToCamel = (rows) => Array.isArray(rows) ? rows.map(rowToCamel) : []

/* ================================================================
 *  学员相关 DAO
 * ================================================================ */
const studentDao = {
  async getById(id) {
    if (db.getMode() !== 'mysql') {
      const s = memory.students.find(s => s.id === id)
      return s || null
    }
    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [id])
    return rowToCamel(rows[0])
  },

  async getByPhone(phone) {
    if (db.getMode() !== 'mysql') {
      return memory.students.find(s => s.phone === phone) || null
    }
    const [rows] = await db.query('SELECT * FROM students WHERE phone = ?', [phone])
    return rowToCamel(rows[0])
  },

  async getProgress(studentId) {
    if (db.getMode() !== 'mysql') {
      return memory.subjectProgress.filter(p => p.studentId === studentId)
    }
    const [rows] = await db.query(
      'SELECT * FROM subject_progress WHERE student_id = ? ORDER BY subject',
      [studentId]
    )
    return rowsToCamel(rows)
  },
}

/* ================================================================
 *  教练相关 DAO
 * ================================================================ */
const coachDao = {
  async list(subject) {
    if (db.getMode() !== 'mysql') {
      const list = subject
        ? memory.coaches.filter(c => c.subject === Number(subject))
        : memory.coaches
      return list.map(c => ({ ...c, tags: [...(c.tags || [])] }))
    }
    let sql = `
      SELECT c.*,
             r.attitude AS r_attitude,
             r.professionalism AS r_professionalism,
             r.patience AS r_patience,
             r.punctuality AS r_punctuality
      FROM coaches c
      LEFT JOIN coach_ratings r ON c.id = r.coach_id
    `
    const params = []
    if (subject) {
      sql += ' WHERE c.subject = ?'
      params.push(Number(subject))
    }
    sql += ' ORDER BY c.rating DESC'
    const [rows] = await db.query(sql, params)
    return rows.map(row => {
      const c = rowToCamel(row)
      return {
        ...c,
        tags: c.tags ? c.tags.split(',').filter(Boolean) : [],
        ratings: {
          attitude: Number(row.r_attitude || 5),
          professionalism: Number(row.r_professionalism || 5),
          patience: Number(row.r_patience || 5),
          punctuality: Number(row.r_punctuality || 5),
        },
      }
    })
  },

  async getById(id) {
    if (db.getMode() !== 'mysql') {
      const c = memory.coaches.find(c => c.id === id)
      return c ? { ...c, tags: [...(c.tags || [])] } : null
    }
    const [rows] = await db.query(`
      SELECT c.*,
             r.attitude AS r_attitude,
             r.professionalism AS r_professionalism,
             r.patience AS r_patience,
             r.punctuality AS r_punctuality
      FROM coaches c
      LEFT JOIN coach_ratings r ON c.id = r.coach_id
      WHERE c.id = ?
    `, [id])
    if (!rows.length) return null
    const row = rows[0]
    const c = rowToCamel(row)
    return {
      ...c,
      tags: c.tags ? c.tags.split(',').filter(Boolean) : [],
      ratings: {
        attitude: Number(row.r_attitude || 5),
        professionalism: Number(row.r_professionalism || 5),
        patience: Number(row.r_patience || 5),
        punctuality: Number(row.r_punctuality || 5),
      },
    }
  },

  async generateSchedule(coachId) {
    const coach = await this.getById(coachId)
    if (!coach) return []

    const restDay = coach.restDay
    const schedule = []

    for (let i = 0; i < 7; i++) {
      const date = getDateStr(i)
      const dateObj = new Date(date)
      const dayIdx = dateObj.getDay()
      const isRestDay = restDay === dayIdx
      let slots

      if (db.getMode() !== 'mysql') {
        slots = memory.timeSlots.map(slot => {
          let status = 'available'
          let bookedCount = Math.floor(Math.random() * 3) + 1
          if (isRestDay) {
            status = 'rest'
            bookedCount = 0
          } else {
            const existing = memory.courses.find(c =>
              c.coachId === coachId &&
              c.date === date &&
              c.timeSlot.id === slot.id &&
              c.status !== 'cancelled'
            )
            if (existing) bookedCount += 1
            if (bookedCount >= 6) {
              status = 'full'
              bookedCount = 6
            }
          }
          return { ...slot, status, bookedCount, maxCount: 6 }
        })
      } else {
        const [booked] = await db.query(`
          SELECT time_slot_id, COUNT(*) AS cnt
          FROM courses
          WHERE coach_id = ? AND course_date = ? AND status != 'cancelled'
          GROUP BY time_slot_id
        `, [coachId, date])
        const bookedMap = {}
        booked.forEach(r => { bookedMap[r.time_slot_id] = Number(r.cnt) })

        const [tsRows] = await db.query(
          'SELECT * FROM time_slots ORDER BY sort_order'
        )
        slots = tsRows.map(ts => {
          const base = bookedMap[ts.id] || (isRestDay ? 0 : (Math.floor(Math.random() * 3) + 1))
          const bookedCount = isRestDay ? 0 : Math.min(base, 6)
          let status
          if (isRestDay) status = 'rest'
          else if (bookedCount >= 6) status = 'full'
          else status = 'available'
          return {
            id: ts.id,
            name: ts.name,
            start: ts.start_time.slice(0, 5),
            end: ts.end_time.slice(0, 5),
            period: ts.period,
            status,
            bookedCount,
            maxCount: 6,
          }
        })
      }

      schedule.push({
        date,
        weekday: WEEK_DAYS[dayIdx],
        dayNum: dateObj.getDate(),
        month: dateObj.getMonth() + 1,
        isRestDay,
        isToday: i === 0,
        slots,
      })
    }
    return schedule
  },

  async getReviews(coachId) {
    if (db.getMode() !== 'mysql') {
      return memory.reviews
        .filter(r => r.coachId === coachId)
        .map(r => ({ ...r, tags: [...(r.tags || [])] }))
    }
    const [rows] = await db.query(`
      SELECT * FROM reviews WHERE coach_id = ? ORDER BY created_at DESC
    `, [coachId])
    return rows.map(r => ({
      id: r.id,
      coachId: r.coach_id,
      studentName: r.student_name,
      avatar: r.student_avatar,
      date: r.created_at ? String(r.created_at).slice(0, 10) : '',
      courseId: r.course_id,
      ratings: {
        attitude: r.attitude,
        professionalism: r.professionalism,
        patience: r.patience,
        punctuality: r.punctuality,
      },
      content: r.content,
      tags: r.tags ? r.tags.split(',').filter(Boolean) : [],
    }))
  },

  async updateRating(coachId) {
    if (db.getMode() !== 'mysql') {
      const coach = memory.coaches.find(c => c.id === coachId)
      if (!coach) return
      const coachReviews = memory.reviews.filter(r => r.coachId === coachId)
      coach.ratingCount = coachReviews.length
      const dims = ['attitude', 'professionalism', 'patience', 'punctuality']
      const dimSums = { attitude: 0, professionalism: 0, patience: 0, punctuality: 0 }
      coachReviews.forEach(r => {
        dims.forEach(d => { dimSums[d] += (r.ratings && r.ratings[d]) || 0 })
      })
      if (coachReviews.length) {
        dims.forEach(d => {
          coach.ratings[d] = Number((dimSums[d] / coachReviews.length).toFixed(1))
        })
        const totalAvg = dims.reduce((s, d) => s + coach.ratings[d], 0) / dims.length
        coach.rating = Number(totalAvg.toFixed(1))
      }
      return
    }
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS cnt,
        AVG(attitude)        AS a,
        AVG(professionalism) AS p,
        AVG(patience)        AS pa,
        AVG(punctuality)     AS pu
      FROM reviews WHERE coach_id = ?
    `, [coachId])
    const row = rows[0]
    const cnt = Number(row.cnt)
    if (!cnt) return
    const a = Number(row.a), p = Number(row.p), pa = Number(row.pa), pu = Number(row.pu)
    const avg = Number(((a + p + pa + pu) / 4).toFixed(1))
    await db.query(`
      UPDATE coaches SET rating = ?, rating_count = ? WHERE id = ?
    `, [avg, cnt, coachId])
    await db.query(`
      UPDATE coach_ratings
      SET attitude = ?, professionalism = ?, patience = ?, punctuality = ?
      WHERE coach_id = ?
    `, [a.toFixed(1), p.toFixed(1), pa.toFixed(1), pu.toFixed(1), coachId])
  },
}

/* ================================================================
 *  课程相关 DAO
 * ================================================================ */
const courseDao = {
  async listByStudent(studentId, status) {
    if (db.getMode() !== 'mysql') {
      let list = memory.courses.filter(c => c.studentId === studentId)
      if (status && status !== 'all') list = list.filter(c => c.status === status)
      const pri = { upcoming: 0, completed: 1, cancelled: 2 }
      return list.sort((a, b) => {
        if (pri[a.status] !== pri[b.status]) return pri[a.status] - pri[b.status]
        return new Date(b.date) - new Date(a.date)
      })
    }
    let sql = `
      SELECT c.*, ts.start_time, ts.end_time, ts.name AS slot_name
      FROM courses c
      LEFT JOIN time_slots ts ON c.time_slot_id = ts.id
      WHERE c.student_id = ?
    `
    const params = [studentId]
    if (status && status !== 'all') {
      sql += ' AND c.status = ?'
      params.push(status)
    }
    sql += ' ORDER BY FIELD(c.status, "upcoming", "completed", "cancelled"), c.course_date DESC'
    const [rows] = await db.query(sql, params)
    return rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      coachId: row.coach_id,
      coachName: row.coach_name,
      coachAvatar: row.coach_avatar,
      date: row.course_date ? String(row.course_date).slice(0, 10) : '',
      timeSlot: {
        id: row.time_slot_id,
        name: row.slot_name || '',
        start: row.start_time ? String(row.start_time).slice(0, 5) : '',
        end: row.end_time ? String(row.end_time).slice(0, 5) : '',
      },
      location: row.location,
      subject: row.subject,
      hours: Number(row.hours || 2),
      status: row.status,
      message: row.message || '',
      reviewed: !!row.reviewed,
      cancelReason: row.cancel_reason,
      cancelledAt: row.cancelled_at,
    }))
  },

  async getById(id) {
    if (db.getMode() !== 'mysql') {
      const c = memory.courses.find(c => c.id === id)
      return c ? { ...c } : null
    }
    const [rows] = await db.query(`
      SELECT c.*, ts.start_time, ts.end_time, ts.name AS slot_name
      FROM courses c
      LEFT JOIN time_slots ts ON c.time_slot_id = ts.id
      WHERE c.id = ?
    `, [id])
    if (!rows.length) return null
    const row = rows[0]
    return {
      id: row.id,
      studentId: row.student_id,
      coachId: row.coach_id,
      coachName: row.coach_name,
      coachAvatar: row.coach_avatar,
      date: row.course_date ? String(row.course_date).slice(0, 10) : '',
      timeSlot: {
        id: row.time_slot_id,
        name: row.slot_name || '',
        start: row.start_time ? String(row.start_time).slice(0, 5) : '',
        end: row.end_time ? String(row.end_time).slice(0, 5) : '',
      },
      location: row.location,
      subject: row.subject,
      hours: Number(row.hours || 2),
      status: row.status,
      message: row.message || '',
      reviewed: !!row.reviewed,
    }
  },

  async hasBooked(coachId, date, timeSlotId) {
    if (db.getMode() !== 'mysql') {
      return memory.courses.some(c =>
        c.coachId === coachId &&
        c.date === date &&
        c.timeSlot.id === timeSlotId &&
        c.status !== 'cancelled'
      )
    }
    const [rows] = await db.query(`
      SELECT COUNT(*) AS cnt FROM courses
      WHERE coach_id = ? AND course_date = ? AND time_slot_id = ? AND status != 'cancelled'
    `, [coachId, date, timeSlotId])
    return Number(rows[0].cnt) > 0
  },

  async create(data) {
    if (await this.hasBooked(data.coachId, data.date, data.timeSlot.id)) {
      return null
    }
    if (db.getMode() !== 'mysql') {
      const newCourse = {
        id: memory.getNextCourseId(),
        ...data,
        status: 'upcoming',
        createdAt: getDateStr(0),
        hours: 2,
        reviewed: false,
      }
      memory.courses.unshift(newCourse)
      return newCourse
    }
    const [result] = await db.query(`
      INSERT INTO courses
      (student_id, coach_id, coach_name, coach_avatar, course_date,
       time_slot_id, time_start, time_end, location, subject, hours, status, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?)
    `, [
      data.studentId, data.coachId, data.coachName, data.coachAvatar,
      data.date,
      data.timeSlot.id,
      data.timeSlot.start + ':00', data.timeSlot.end + ':00',
      data.location, data.subject, 2, data.message || '',
    ])
    return await this.getById(result.insertId)
  },

  async cancel(id, reason) {
    if (db.getMode() !== 'mysql') {
      const course = memory.courses.find(c => c.id === id)
      if (!course) return null
      course.status = 'cancelled'
      course.cancelReason = reason || '个人原因'
      course.cancelledAt = getDateStr(0)
      return course
    }
    await db.query(`
      UPDATE courses
      SET status = 'cancelled', cancel_reason = ?, cancelled_at = NOW()
      WHERE id = ?
    `, [reason || '个人原因', id])
    return await this.getById(id)
  },

  async markReviewed(id) {
    if (db.getMode() !== 'mysql') {
      const c = memory.courses.find(c => c.id === id)
      if (c) c.reviewed = true
      return c
    }
    await db.query('UPDATE courses SET reviewed = 1 WHERE id = ?', [id])
    return await this.getById(id)
  },
}

/* ================================================================
 *  评价相关 DAO
 * ================================================================ */
const reviewDao = {
  async listByCoach(coachId) {
    return coachDao.getReviews(coachId)
  },

  async create(data) {
    if (db.getMode() !== 'mysql') {
      const newReview = {
        id: memory.getNextReviewId(),
        date: getDateStr(0),
        ...data,
        tags: [...(data.tags || [])],
      }
      memory.reviews.unshift(newReview)
      await coachDao.updateRating(data.coachId)
      return newReview
    }
    const tagsStr = Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || '')
    await db.query(`
      INSERT INTO reviews
      (coach_id, student_id, student_name, student_avatar, course_id,
       attitude, professionalism, patience, punctuality, content, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.coachId, data.studentId, data.studentName,
      data.avatar || '🧑', data.courseId,
      data.ratings.attitude, data.ratings.professionalism,
      data.ratings.patience, data.ratings.punctuality,
      data.content || '', tagsStr,
    ])
    await coachDao.updateRating(data.coachId)
    const [last] = await db.query('SELECT LAST_INSERT_ID() AS id')
    const id = last[0].id
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [id])
    const r = rows[0]
    return {
      id: r.id,
      coachId: r.coach_id,
      studentName: r.student_name,
      avatar: r.student_avatar,
      date: String(r.created_at).slice(0, 10),
      courseId: r.course_id,
      ratings: {
        attitude: r.attitude,
        professionalism: r.professionalism,
        patience: r.patience,
        punctuality: r.punctuality,
      },
      content: r.content,
      tags: r.tags ? r.tags.split(',').filter(Boolean) : [],
    }
  },
}

/* ================================================================
 *  模拟训练相关 DAO
 * ================================================================ */
const simulatorDao = {
  async getInfo() {
    if (db.getMode() !== 'mysql') {
      return {
        ...memory.simulatorInfo,
        notice: [...memory.simulatorInfo.notice],
        faq: memory.simulatorInfo.faq.map(f => ({ ...f })),
      }
    }
    const [rows] = await db.query('SELECT * FROM simulator_info LIMIT 1')
    if (!rows.length) return null
    const r = rows[0]
    return {
      name: r.name,
      description: r.description,
      duration: r.duration,
      location: r.location,
      notice: r.notice ? r.notice.split('|').filter(Boolean) : [],
      faq: (() => {
        if (!r.faq) return []
        return r.faq.split('|').map(pair => {
          const idx = pair.indexOf('？')
          if (idx < 0) return null
          return { q: pair.slice(0, idx + 1), a: pair.slice(idx + 1) || '' }
        }).filter(Boolean)
      })(),
    }
  },

  async getSessions() {
    if (db.getMode() !== 'mysql') {
      return memory.simulatorSessions.map(s => ({
        ...s,
        slots: s.slots.map(x => ({ ...x })),
      }))
    }
    const [rows] = await db.query(`
      SELECT * FROM simulator_sessions
      WHERE session_date >= CURDATE()
      ORDER BY session_date, slot_id
    `)
    const map = {}
    rows.forEach(r => {
      const d = String(r.session_date).slice(0, 10)
      if (!map[d]) {
        const dateObj = new Date(d)
        map[d] = {
          id: 'sim-' + d,
          date: d,
          weekday: WEEK_DAYS[dateObj.getDay()],
          dayNum: dateObj.getDate(),
          month: dateObj.getMonth() + 1,
          slots: [],
        }
      }
      map[d].slots.push({
        id: r.slot_id,
        start: String(r.start_time).slice(0, 5),
        end: String(r.end_time).slice(0, 5),
        status: r.status,
        price: Number(r.price),
        maxCount: r.max_count,
        bookedCount: r.booked_count,
      })
    })
    return Object.values(map)
  },

  async getMyBookings(studentId) {
    if (db.getMode() !== 'mysql') {
      return memory.bookedSimulators
        .filter(b => b.studentId === studentId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(b => ({ ...b, slot: { ...b.slot } }))
    }
    const [rows] = await db.query(`
      SELECT * FROM simulator_bookings
      WHERE student_id = ? ORDER BY session_date DESC
    `, [studentId])
    return rows.map(r => ({
      id: r.id,
      studentId: r.student_id,
      date: String(r.session_date).slice(0, 10),
      slot: {
        start: String(r.start_time).slice(0, 5),
        end: String(r.end_time).slice(0, 5),
      },
      price: Number(r.price),
      status: r.status,
    }))
  },

  async hasBooked(studentId, date, slotStart) {
    if (db.getMode() !== 'mysql') {
      return memory.bookedSimulators.some(s =>
        s.studentId === studentId &&
        s.date === date &&
        s.slot.start === slotStart &&
        s.status !== 'cancelled'
      )
    }
    const [rows] = await db.query(`
      SELECT COUNT(*) AS cnt FROM simulator_bookings
      WHERE student_id = ? AND session_date = ?
        AND TIME_FORMAT(start_time, '%H:%i') = ?
        AND status != 'cancelled'
    `, [studentId, date, slotStart])
    return Number(rows[0].cnt) > 0
  },

  async book(studentId, sessionDate, slot) {
    if (await this.hasBooked(studentId, sessionDate, slot.start)) {
      return null
    }
    if (db.getMode() !== 'mysql') {
      const daySession = memory.simulatorSessions.find(s => s.date === sessionDate)
      if (daySession) {
        const ts = daySession.slots.find(sl => sl.id === slot.id)
        if (ts && ts.status === 'available') {
          ts.bookedCount += 1
          if (ts.bookedCount >= ts.maxCount) ts.status = 'full'
        }
      }
      const booking = {
        id: 'sim-booked-' + Date.now(),
        studentId,
        date: sessionDate,
        slot: { start: slot.start, end: slot.end },
        price: slot.price,
        status: 'upcoming',
      }
      memory.bookedSimulators.unshift(booking)
      return booking
    }
    const [rows] = await db.query(`
      SELECT id, booked_count, max_count, status FROM simulator_sessions
      WHERE session_date = ? AND slot_id = ?
    `, [sessionDate, slot.id])
    if (rows.length) {
      const sess = rows[0]
      if (sess.status === 'available') {
        const nb = Math.min(sess.booked_count + 1, sess.max_count)
        const ns = nb >= sess.max_count ? 'full' : 'available'
        await db.query(`
          UPDATE simulator_sessions
          SET booked_count = ?, status = ? WHERE id = ?
        `, [nb, ns, sess.id])
      }
    }
    const [result] = await db.query(`
      INSERT INTO simulator_bookings
      (student_id, session_date, slot_id, start_time, end_time, price, status)
      VALUES (?, ?, ?, ?, ?, ?, 'upcoming')
    `, [studentId, sessionDate, slot.id,
        slot.start + ':00', slot.end + ':00', slot.price])
    return {
      id: result.insertId,
      studentId,
      date: sessionDate,
      slot: { start: slot.start, end: slot.end },
      price: slot.price,
      status: 'upcoming',
    }
  },
}

/* ================================================================
 *  时段字典 DAO
 * ================================================================ */
async function getTimeSlots() {
  if (db.getMode() !== 'mysql') return memory.timeSlots
  const [rows] = await db.query('SELECT * FROM time_slots ORDER BY sort_order')
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    start: String(r.start_time).slice(0, 5),
    end: String(r.end_time).slice(0, 5),
    period: r.period,
  }))
}

module.exports = {
  student: studentDao,
  coach: coachDao,
  course: courseDao,
  review: reviewDao,
  simulator: simulatorDao,
  getTimeSlots,
}
