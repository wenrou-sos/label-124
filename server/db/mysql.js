const mysql = require('mysql2/promise')
const config = require('../config')

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  connectionLimit: config.mysql.connectionLimit || 10,
  timezone: '+08:00',
})

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
  const [rows] = await pool.execute(sql, params)
  return rows
}

async function getStudentById(id) {
  const rows = await query(
    'SELECT id, student_no, name, avatar, phone, school, enroll_date, total_hours, used_hours, remaining_hours, credits FROM students WHERE id = ?',
    [id]
  )
  return rows.length > 0 ? toCamel(rows[0]) : null
}

async function getStudentByPhone(phone) {
  const rows = await query(
    'SELECT id, student_no, name, avatar, phone, password, school, enroll_date, total_hours, used_hours, remaining_hours, credits FROM students WHERE phone = ?',
    [phone]
  )
  return rows.length > 0 ? toCamel(rows[0]) : null
}

async function getStudentProgress(studentId) {
  const rows = await query(
    'SELECT id, student_id, subject, subject_name, full_name, status, icon, training_hours, required_hours, pass_date, score, color FROM subject_progress WHERE student_id = ? ORDER BY subject',
    [studentId]
  )
  return toCamelArr(rows)
}

async function listCoaches(subject) {
  let sql = `
    SELECT 
      c.id, c.name, c.avatar, c.gender, c.age, c.experience, c.car_model, c.car_no,
      c.rating, c.rating_count, c.students, c.pass_rate, c.tags, c.phone, c.subject, c.rest_day,
      r.attitude, r.professionalism, r.patience, r.punctuality
    FROM coaches c
    LEFT JOIN coach_ratings r ON c.id = r.coach_id
  `
  const params = []
  if (subject !== undefined && subject !== null) {
    sql += ' WHERE c.subject = ?'
    params.push(subject)
  }
  sql += ' ORDER BY c.rating DESC'
  const rows = await query(sql, params)
  return rows.map(row => {
    const camel = toCamel(row)
    return {
      id: camel.id,
      name: camel.name,
      avatar: camel.avatar,
      gender: camel.gender,
      age: camel.age,
      experience: camel.experience,
      carModel: camel.carModel,
      carNo: camel.carNo,
      rating: Number(camel.rating),
      ratingCount: camel.ratingCount,
      students: camel.students,
      passRate: camel.passRate,
      tags: camel.tags ? camel.tags.split(',') : [],
      phone: camel.phone,
      subject: camel.subject,
      restDay: camel.restDay,
      ratings: {
        attitude: Number(camel.attitude ?? 5.0),
        professionalism: Number(camel.professionalism ?? 5.0),
        patience: Number(camel.patience ?? 5.0),
        punctuality: Number(camel.punctuality ?? 5.0),
      },
    }
  })
}

async function getCoachById(id) {
  const rows = await query(
    `SELECT 
      c.id, c.name, c.avatar, c.gender, c.age, c.experience, c.car_model, c.car_no,
      c.rating, c.rating_count, c.students, c.pass_rate, c.tags, c.phone, c.subject, c.rest_day,
      r.attitude, r.professionalism, r.patience, r.punctuality
    FROM coaches c
    LEFT JOIN coach_ratings r ON c.id = r.coach_id
    WHERE c.id = ?`,
    [id]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  const camel = toCamel(row)
  return {
    id: camel.id,
    name: camel.name,
    avatar: camel.avatar,
    gender: camel.gender,
    age: camel.age,
    experience: camel.experience,
    carModel: camel.carModel,
    carNo: camel.carNo,
    rating: Number(camel.rating),
    ratingCount: camel.ratingCount,
    students: camel.students,
    passRate: camel.passRate,
    tags: camel.tags ? camel.tags.split(',') : [],
    phone: camel.phone,
    subject: camel.subject,
    restDay: camel.restDay,
    ratings: {
      attitude: Number(camel.attitude ?? 5.0),
      professionalism: Number(camel.professionalism ?? 5.0),
      patience: Number(camel.patience ?? 5.0),
      punctuality: Number(camel.punctuality ?? 5.0),
    },
  }
}

async function listCoachReviews(coachId) {
  const rows = await query(
    `SELECT 
      id, coach_id, student_name, student_avatar, created_at, course_id,
      attitude, professionalism, patience, punctuality, content, tags
    FROM reviews
    WHERE coach_id = ?
    ORDER BY created_at DESC`,
    [coachId]
  )
  return rows.map(row => {
    const d = new Date(row.created_at)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return {
      id: row.id,
      coachId: row.coach_id,
      studentName: row.student_name,
      avatar: row.student_avatar,
      date: dateStr,
      courseId: row.course_id,
      ratings: {
        attitude: row.attitude,
        professionalism: row.professionalism,
        patience: row.patience,
        punctuality: row.punctuality,
      },
      content: row.content,
      tags: row.tags ? row.tags.split(',') : [],
    }
  })
}

async function getCoachSchedule(coachId) {
  const coach = await getCoachById(coachId)
  if (!coach) return []

  const timeSlots = await listTimeSlots()
  const maxCount = 6
  const schedule = []

  for (let i = 0; i < 7; i++) {
    const dateObj = new Date()
    dateObj.setDate(dateObj.getDate() + i + 1)
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
    const weekday = dateObj.getDay()
    const isRestDay = coach.restDay === weekday

    const bookedCounts = {}
    for (const ts of timeSlots) {
      const rows = await query(
        `SELECT COUNT(*) as cnt FROM courses 
         WHERE coach_id = ? AND course_date = ? AND time_slot_id = ? AND status != 'cancelled'`,
        [coachId, dateStr, ts.id]
      )
      bookedCounts[ts.id] = rows[0].cnt
    }

    const slots = timeSlots.map(ts => {
      const bookedCount = bookedCounts[ts.id]
      return {
        id: ts.id,
        name: ts.name,
        start: ts.start,
        end: ts.end,
        period: ts.period,
        bookedCount,
        maxCount,
        isRestDay,
        full: isRestDay || bookedCount >= maxCount,
        available: !isRestDay && bookedCount < maxCount,
      }
    })

    schedule.push({
      id: `day-${i}`,
      date: dateStr,
      weekday: WEEK_DAYS[weekday],
      dayNum: dateObj.getDate(),
      month: dateObj.getMonth() + 1,
      isRestDay,
      slots,
    })
  }

  return schedule
}

async function listTimeSlots() {
  const rows = await query(
    'SELECT id, name, start_time, end_time, period FROM time_slots ORDER BY sort_order'
  )
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    start: String(row.start_time).substring(0, 5),
    end: String(row.end_time).substring(0, 5),
    period: row.period,
  }))
}

async function listStudentCourses(studentId, status) {
  let sql = `
    SELECT 
      id, student_id, coach_id, coach_name, coach_avatar, course_date,
      time_slot_id, time_slot_name, time_start, time_end, time_period,
      location, subject, hours, status, message, cancel_reason, cancelled_at, reviewed, created_at
    FROM courses
    WHERE student_id = ?
  `
  const params = [studentId]
  if (status) {
    sql += ' AND status = ?'
    params.push(status)
  }
  sql += ' ORDER BY FIELD(status, "upcoming", "completed", "cancelled"), course_date DESC'
  const rows = await query(sql, params)

  return rows.map(row => {
    const camel = toCamel(row)
    return {
      id: camel.id,
      studentId: camel.studentId,
      coachId: camel.coachId,
      coachName: camel.coachName,
      coachAvatar: camel.coachAvatar,
      date: camel.courseDate,
      timeSlot: {
        id: camel.timeSlotId,
        name: camel.timeSlotName,
        start: String(camel.timeStart).substring(0, 5),
        end: String(camel.timeEnd).substring(0, 5),
        period: camel.timePeriod,
      },
      location: camel.location,
      subject: camel.subject,
      hours: Number(camel.hours),
      status: camel.status,
      message: camel.message,
      cancelReason: camel.cancelReason,
      cancelledAt: camel.cancelledAt,
      reviewed: !!camel.reviewed,
      createdAt: camel.createdAt,
    }
  })
}

async function getCourseById(id) {
  const rows = await query(
    `SELECT 
      id, student_id, coach_id, coach_name, coach_avatar, course_date,
      time_slot_id, time_slot_name, time_start, time_end, time_period,
      location, subject, hours, status, message, cancel_reason, cancelled_at, reviewed, created_at
    FROM courses
    WHERE id = ?`,
    [id]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  const camel = toCamel(row)
  return {
    id: camel.id,
    studentId: camel.studentId,
    coachId: camel.coachId,
    coachName: camel.coachName,
    coachAvatar: camel.coachAvatar,
    date: camel.courseDate,
    timeSlot: {
      id: camel.timeSlotId,
      name: camel.timeSlotName,
      start: String(camel.timeStart).substring(0, 5),
      end: String(camel.timeEnd).substring(0, 5),
      period: camel.timePeriod,
    },
    location: camel.location,
    subject: camel.subject,
    hours: Number(camel.hours),
    status: camel.status,
    message: camel.message,
    cancelReason: camel.cancelReason,
    cancelledAt: camel.cancelledAt,
    reviewed: !!camel.reviewed,
    createdAt: camel.createdAt,
  }
}

async function hasBookedCourse(coachId, date, timeSlotId) {
  const rows = await query(
    `SELECT COUNT(*) as cnt FROM courses 
     WHERE coach_id = ? AND course_date = ? AND time_slot_id = ? AND status != 'cancelled'`,
    [coachId, date, timeSlotId]
  )
  return rows[0].cnt > 0
}

async function createCourse(studentId, coachId, coachName, coachAvatar, date, timeSlot, location, subject, message, hours = 2) {
  const result = await query(
    `INSERT INTO courses 
      (student_id, coach_id, coach_name, coach_avatar, course_date,
       time_slot_id, time_slot_name, time_start, time_end, time_period,
       location, subject, hours, message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      studentId, coachId, coachName, coachAvatar, date,
      timeSlot.id, timeSlot.name, timeSlot.start, timeSlot.end, timeSlot.period,
      location, subject, hours, message || '',
    ]
  )
  return { id: result.insertId }
}

async function cancelCourse(id, reason = '个人原因') {
  await query(
    `UPDATE courses SET status = 'cancelled', cancel_reason = ?, cancelled_at = NOW() WHERE id = ?`,
    [reason, id]
  )
  return true
}

async function markCourseReviewed(id) {
  await query('UPDATE courses SET reviewed = 1 WHERE id = ?', [id])
  return true
}

async function getCourseStatus(id) {
  const rows = await query('SELECT status, reviewed FROM courses WHERE id = ?', [id])
  if (rows.length === 0) return null
  return {
    status: rows[0].status,
    reviewed: !!rows[0].reviewed,
  }
}

async function listReviewsByCoach(coachId) {
  return listCoachReviews(coachId)
}

async function createReview(coachId, studentId, studentName, studentAvatar, courseId, ratings, content, tags) {
  const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '')
  const result = await query(
    `INSERT INTO reviews 
      (coach_id, student_id, student_name, student_avatar, course_id,
       attitude, professionalism, patience, punctuality, content, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      coachId, studentId, studentName, studentAvatar || '🧑', courseId,
      ratings.attitude, ratings.professionalism, ratings.patience, ratings.punctuality,
      content || '', tagsStr,
    ]
  )
  return { id: result.insertId }
}

async function recalcCoachRating(coachId) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [rows] = await conn.execute(
      `SELECT 
        AVG(attitude) as avg_attitude,
        AVG(professionalism) as avg_professionalism,
        AVG(patience) as avg_patience,
        AVG(punctuality) as avg_punctuality,
        COUNT(*) as review_count
      FROM reviews WHERE coach_id = ?`,
      [coachId]
    )

    const stat = rows[0] || {}
    const avgAttitude = Number(stat.avg_attitude ?? 5.0)
    const avgProfessionalism = Number(stat.avg_professionalism ?? 5.0)
    const avgPatience = Number(stat.avg_patience ?? 5.0)
    const avgPunctuality = Number(stat.avg_punctuality ?? 5.0)
    const reviewCount = Number(stat.review_count ?? 0)
    const overallRating = Number(((avgAttitude + avgProfessionalism + avgPatience + avgPunctuality) / 4).toFixed(1))

    const [existRows] = await conn.execute('SELECT id FROM coach_ratings WHERE coach_id = ?', [coachId])
    if (existRows.length > 0) {
      await conn.execute(
        `UPDATE coach_ratings SET attitude = ?, professionalism = ?, patience = ?, punctuality = ? WHERE coach_id = ?`,
        [avgAttitude, avgProfessionalism, avgPatience, avgPunctuality, coachId]
      )
    } else {
      await conn.execute(
        `INSERT INTO coach_ratings (coach_id, attitude, professionalism, patience, punctuality) VALUES (?, ?, ?, ?, ?)`,
        [coachId, avgAttitude, avgProfessionalism, avgPatience, avgPunctuality]
      )
    }

    await conn.execute(
      `UPDATE coaches SET rating = ?, rating_count = ? WHERE id = ?`,
      [overallRating, reviewCount, coachId]
    )

    await conn.commit()
    return true
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

async function getSimulatorInfo() {
  const rows = await query('SELECT name, description, duration, location, notice, faq FROM simulator_info LIMIT 1')
  if (rows.length === 0) return null
  const row = rows[0]
  const noticeArr = row.notice ? row.notice.split('|') : []
  const faqArr = row.faq
    ? row.faq.split('||').map(item => {
        const parts = item.split('|')
        return { q: parts[0] || '', a: parts[1] || '' }
      })
    : []
  return {
    name: row.name,
    description: row.description,
    duration: row.duration,
    location: row.location,
    notice: noticeArr,
    faq: faqArr,
  }
}

async function listSimulatorSessions() {
  const rows = await query(
    `SELECT session_date, slot_id, start_time, end_time, status, price, max_count, booked_count
     FROM simulator_sessions
     WHERE session_date >= CURDATE()
     ORDER BY session_date, slot_id`
  )

  const dayMap = {}
  for (const row of rows) {
    const dateStr = String(row.session_date)
    if (!dayMap[dateStr]) {
      const d = new Date(dateStr + 'T00:00:00')
      const yy = String(d.getFullYear()).slice(-2)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      dayMap[dateStr] = {
        id: 'sim' + yy + mm + dd,
        date: dateStr,
        weekday: WEEK_DAYS[d.getDay()],
        dayNum: d.getDate(),
        month: d.getMonth() + 1,
        slots: [],
      }
    }
    dayMap[dateStr].slots.push({
      id: row.slot_id,
      start: String(row.start_time).substring(0, 5),
      end: String(row.end_time).substring(0, 5),
      status: row.status,
      price: Number(row.price),
      maxCount: row.max_count,
      bookedCount: row.booked_count,
    })
  }

  const result = Object.values(dayMap)
  result.sort((a, b) => a.date.localeCompare(b.date))
  return result
}

async function listMySimulatorBookings(studentId) {
  const rows = await query(
    `SELECT id, student_id, session_date, start_time, end_time, price, status, created_at
     FROM simulator_bookings
     WHERE student_id = ?
     ORDER BY session_date DESC`,
    [studentId]
  )
  return rows.map(row => ({
    id: row.id,
    studentId: row.student_id,
    date: String(row.session_date),
    slot: {
      start: String(row.start_time).substring(0, 5),
      end: String(row.end_time).substring(0, 5),
    },
    price: Number(row.price),
    status: row.status,
  }))
}

async function hasBookedSimulator(studentId, date, slotId) {
  const rows = await query(
    `SELECT COUNT(*) as cnt FROM simulator_bookings
     WHERE student_id = ? AND session_date = ? AND slot_id = ? AND status != 'cancelled'`,
    [studentId, date, slotId]
  )
  return rows[0].cnt > 0
}

async function bookSimulator(studentId, sessionDate, slot) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [insertResult] = await conn.execute(
      `INSERT INTO simulator_bookings (student_id, session_date, slot_id, start_time, end_time, price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, sessionDate, slot.id, slot.start, slot.end, slot.price]
    )

    const [updateResult] = await conn.execute(
      `UPDATE simulator_sessions 
       SET booked_count = booked_count + 1,
           status = CASE WHEN booked_count + 1 >= max_count THEN 'full' ELSE status END
       WHERE session_date = ? AND slot_id = ? AND status = 'available'`,
      [sessionDate, slot.id]
    )

    if (updateResult.affectedRows === 0) {
      await conn.rollback()
      throw new Error('该时段不可预约')
    }

    await conn.commit()
    return { id: insertResult.insertId }
  } catch (err) {
    if (conn) {
      try { await conn.rollback() } catch (_) {}
    }
    throw err
  } finally {
    if (conn) conn.release()
  }
}

async function tryAddMissingSimulatorSessions() {
  const defaultSlots = [
    { id: 's1', start: '09:00', end: '11:00', price: 180 },
    { id: 's2', start: '13:00', end: '15:00', price: 180 },
    { id: 's3', start: '15:30', end: '17:30', price: 180 },
    { id: 's4', start: '18:00', end: '20:00', price: 200 },
  ]

  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    for (const s of defaultSlots) {
      const rows = await query(
        `SELECT id FROM simulator_sessions WHERE session_date = ? AND slot_id = ?`,
        [dateStr, s.id]
      )
      if (rows.length === 0) {
        await query(
          `INSERT INTO simulator_sessions (session_date, slot_id, start_time, end_time, status, price, max_count, booked_count)
           VALUES (?, ?, ?, ?, 'available', ?, 6, 0)`,
          [dateStr, s.id, s.start, s.end, s.price]
        )
      }
    }
  }
  return true
}

module.exports = {
  pool,
  query,
  toCamel,
  toCamelArr,
  getStudentById,
  getStudentByPhone,
  getStudentProgress,
  listCoaches,
  getCoachById,
  listCoachReviews,
  getCoachSchedule,
  listTimeSlots,
  listStudentCourses,
  getCourseById,
  hasBookedCourse,
  createCourse,
  cancelCourse,
  markCourseReviewed,
  getCourseStatus,
  listReviewsByCoach,
  createReview,
  recalcCoachRating,
  getSimulatorInfo,
  listSimulatorSessions,
  listMySimulatorBookings,
  hasBookedSimulator,
  bookSimulator,
  tryAddMissingSimulatorSessions,
}
