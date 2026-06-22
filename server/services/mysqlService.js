const db = require('../db/pool')
const { getDateStr, isWithinCancelWindow } = require('../utils/date')

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function formatCoach(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    gender: row.gender,
    age: row.age,
    experience: row.experience,
    carModel: row.car_model,
    carNo: row.car_no,
    rating: Number(row.rating),
    ratingCount: row.rating_count,
    students: row.students,
    passRate: row.pass_rate,
    tags: row.tags ? row.tags.split(',') : [],
    phone: row.phone,
    subject: row.subject,
    restDay: row.rest_day,
    ratings: {
      attitude: Number(row.attitude || 5),
      professionalism: Number(row.professionalism || 5),
      patience: Number(row.patience || 5),
      punctuality: Number(row.punctuality || 5),
    },
  }
}

function formatCourse(row) {
  if (!row) return null
  return {
    id: row.id,
    studentId: row.student_id,
    coachId: row.coach_id,
    coachName: row.coach_name,
    coachAvatar: row.coach_avatar,
    date: row.course_date,
    timeSlot: {
      id: row.time_slot_id,
      name: row.time_name,
      start: row.time_start,
      end: row.time_end,
      period: row.time_period,
    },
    location: row.location,
    subject: row.subject,
    hours: Number(row.hours),
    status: row.status,
    message: row.message,
    cancelReason: row.cancel_reason,
    cancelledAt: row.cancelled_at,
    reviewed: Boolean(row.reviewed),
    createdAt: row.created_at,
  }
}

function formatReview(row) {
  if (!row) return null
  return {
    id: row.id,
    coachId: row.coach_id,
    coachName: row.coach_name,
    coachAvatar: row.coach_avatar,
    studentId: row.student_id,
    studentName: row.student_name,
    avatar: row.student_avatar,
    date: row.created_at ? row.created_at.split('T')[0] : '',
    courseId: row.course_id,
    subject: row.subject,
    ratings: {
      attitude: row.attitude,
      professionalism: row.professionalism,
      patience: row.patience,
      punctuality: row.punctuality,
    },
    content: row.content,
    tags: row.tags ? row.tags.split(',') : [],
  }
}

const studentService = {
  async getById(id) {
    const row = await db.getOne('SELECT * FROM students WHERE id = ?', [id])
    if (!row) return null
    return {
      id: row.id,
      studentNo: row.student_no,
      name: row.name,
      avatar: row.avatar,
      phone: row.phone,
      school: row.school,
      enrollDate: row.enroll_date,
      totalHours: Number(row.total_hours),
      usedHours: Number(row.used_hours),
      remainingHours: Number(row.remaining_hours),
      credits: row.credits,
    }
  },

  async getByPhone(phone) {
    const row = await db.getOne('SELECT * FROM students WHERE phone = ?', [phone])
    if (!row) return null
    return {
      id: row.id,
      studentNo: row.student_no,
      name: row.name,
      avatar: row.avatar,
      phone: row.phone,
      password: row.password,
      school: row.school,
      enrollDate: row.enroll_date,
      totalHours: Number(row.total_hours),
      usedHours: Number(row.used_hours),
      remainingHours: Number(row.remaining_hours),
      credits: row.credits,
    }
  },

  async getProgress(studentId) {
    const rows = await db.query(
      'SELECT * FROM subject_progress WHERE student_id = ? ORDER BY subject',
      [studentId]
    )
    return rows.map(r => ({
      id: r.id,
      studentId: r.student_id,
      subject: r.subject,
      subjectName: r.subject_name,
      fullName: r.full_name,
      status: r.status,
      icon: r.icon,
      color: r.color,
      trainingHours: Number(r.training_hours),
      requiredHours: Number(r.required_hours),
      passDate: r.pass_date,
      score: r.score,
    }))
  },
}

const coachService = {
  async list(subject) {
    let sql = `
      SELECT c.*, r.attitude, r.professionalism, r.patience, r.punctuality
      FROM coaches c
      LEFT JOIN coach_ratings r ON c.id = r.coach_id
    `
    const params = []
    if (subject) {
      sql += ' WHERE c.subject = ?'
      params.push(Number(subject))
    }
    sql += ' ORDER BY c.id'
    const rows = await db.query(sql, params)
    return rows.map(formatCoach)
  },

  async getById(id) {
    const row = await db.getOne(`
      SELECT c.*, r.attitude, r.professionalism, r.patience, r.punctuality
      FROM coaches c
      LEFT JOIN coach_ratings r ON c.id = r.coach_id
      WHERE c.id = ?
    `, [id])
    return formatCoach(row)
  },

  async getSchedule(coachId) {
    const coach = await this.getById(coachId)
    if (!coach) return []

    const schedule = []
    for (let i = 0; i < 7; i++) {
      const date = getDateStr(i)
      const dateObj = new Date(date)
      const dayIdx = dateObj.getDay()
      const weekday = WEEK_DAYS[dayIdx]
      const dayNum = dateObj.getDate()
      const month = dateObj.getMonth() + 1
      const isRestDay = coach.restDay === dayIdx

      const timeSlots = await db.query('SELECT * FROM time_slots ORDER BY sort_order')

      const slots = []
      for (const ts of timeSlots) {
        let status = 'available'
        let bookedCount = 2 + Math.floor(Math.random() * 2)

        if (isRestDay) {
          status = 'rest'
          bookedCount = 0
        } else {
          const [bookedRow] = await db.query(`
            SELECT COUNT(*) as cnt FROM courses
            WHERE coach_id = ? AND course_date = ? AND time_slot_id = ? AND status != 'cancelled'
          `, [coachId, date, ts.id])
          bookedCount = bookedRow.cnt + Math.floor(Math.random() * 2)
          if (bookedCount >= 6) {
            status = 'full'
            bookedCount = 6
          }
        }

        slots.push({
          id: ts.id,
          name: ts.name,
          start: ts.start_time,
          end: ts.end_time,
          period: ts.period,
          status,
          bookedCount,
          maxCount: 6,
        })
      }

      schedule.push({
        date,
        weekday,
        dayNum,
        month,
        isRestDay,
        isToday: i === 0,
        slots,
      })
    }
    return schedule
  },

  async getReviews(coachId) {
    const rows = await db.query(`
      SELECT * FROM reviews WHERE coach_id = ? ORDER BY created_at DESC
    `, [coachId])
    return rows.map(formatReview)
  },

  async updateRating(coachId) {
    const avgRow = await db.getOne(`
      SELECT
        AVG(attitude) as attitude,
        AVG(professionalism) as professionalism,
        AVG(patience) as patience,
        AVG(punctuality) as punctuality,
        COUNT(*) as cnt
      FROM reviews WHERE coach_id = ?
    `, [coachId])

    if (!avgRow || avgRow.cnt === 0) return

    const totalAvg = (Number(avgRow.attitude) + Number(avgRow.professionalism) + Number(avgRow.patience) + Number(avgRow.punctuality)) / 4

    await db.execute(`
      UPDATE coach_ratings
      SET attitude = ?, professionalism = ?, patience = ?, punctuality = ?
      WHERE coach_id = ?
    `, [
      Number(avgRow.attitude).toFixed(1),
      Number(avgRow.professionalism).toFixed(1),
      Number(avgRow.patience).toFixed(1),
      Number(avgRow.punctuality).toFixed(1),
      coachId,
    ])

    await db.execute(`
      UPDATE coaches SET rating = ?, rating_count = ? WHERE id = ?
    `, [totalAvg.toFixed(1), avgRow.cnt, coachId])
  },
}

const courseService = {
  async listByStudent(studentId, status) {
    let sql = 'SELECT * FROM courses WHERE student_id = ?'
    const params = [studentId]
    if (status && status !== 'all') {
      sql += ' AND status = ?'
      params.push(status)
    }
    sql += ' ORDER BY FIELD(status, "upcoming", "completed", "cancelled"), course_date DESC'
    const rows = await db.query(sql, params)
    return rows.map(formatCourse)
  },

  async getById(id) {
    const row = await db.getOne('SELECT * FROM courses WHERE id = ?', [id])
    return formatCourse(row)
  },

  async hasBooked(coachId, date, timeSlotId) {
    const row = await db.getOne(`
      SELECT COUNT(*) as cnt FROM courses
      WHERE coach_id = ? AND course_date = ? AND time_slot_id = ? AND status != 'cancelled'
    `, [coachId, date, timeSlotId])
    return row.cnt > 0
  },

  async create(data) {
    const { studentId, coachId, coachName, coachAvatar, date, timeSlot, location, subject, message } = data

    if (await this.hasBooked(coachId, date, timeSlot.id)) {
      return null
    }

    const timeSlotRow = await db.getOne('SELECT * FROM time_slots WHERE id = ?', [timeSlot.id])

    const result = await db.insert(`
      INSERT INTO courses
      (student_id, coach_id, coach_name, coach_avatar, course_date, time_slot_id, time_start, time_end, time_name, time_period, location, subject, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId,
      coachId,
      coachName,
      coachAvatar,
      date,
      timeSlot.id,
      timeSlot.start,
      timeSlot.end,
      timeSlotRow ? timeSlotRow.name : timeSlot.name || '时段',
      timeSlotRow ? timeSlotRow.period : timeSlot.period || 'morning',
      location,
      subject,
      message || '',
    ])

    return await this.getById(result)
  },

  async cancel(id, reason = '个人原因') {
    const course = await this.getById(id)
    if (!course || course.status !== 'upcoming') {
      return null
    }

    const canCancelFree = isWithinCancelWindow(course.date, course.timeSlot.start, 2)

    await db.execute(`
      UPDATE courses SET status = 'cancelled', cancel_reason = ?, cancelled_at = NOW() WHERE id = ?
    `, [reason, id])

    const updated = await this.getById(id)
    return { course: updated, canCancelFree }
  },

  async markReviewed(id) {
    await db.execute('UPDATE courses SET reviewed = 1 WHERE id = ?', [id])
    return await this.getById(id)
  },
}

const reviewService = {
  async listByCoach(coachId) {
    const rows = await db.query(`
      SELECT * FROM reviews WHERE coach_id = ? ORDER BY created_at DESC
    `, [coachId])
    return rows.map(formatReview)
  },

  async getByCourseId(courseId) {
    const row = await db.getOne('SELECT * FROM reviews WHERE course_id = ?', [courseId])
    return formatReview(row)
  },

  async listByStudent(studentId) {
    const rows = await db.query(`
      SELECT r.*, c.name as coach_name, c.avatar as coach_avatar, co.subject
      FROM reviews r
      LEFT JOIN coaches c ON r.coach_id = c.id
      LEFT JOIN courses co ON r.course_id = co.id
      WHERE r.student_id = ?
      ORDER BY r.created_at DESC
    `, [studentId])
    return rows.map(formatReview)
  },

  async create(data) {
    const { coachId, studentId, studentName, studentAvatar, courseId, ratings, content, tags } = data

    const course = await courseService.getById(courseId)
    if (!course) {
      throw new Error('课程不存在')
    }
    if (course.status !== 'completed') {
      throw new Error('只有已完成的课程才能评价')
    }
    if (course.reviewed) {
      throw new Error('该课程已评价过')
    }

    const id = await db.insert(`
      INSERT INTO reviews
      (coach_id, student_id, student_name, student_avatar, course_id, attitude, professionalism, patience, punctuality, content, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      coachId,
      studentId,
      studentName,
      studentAvatar,
      courseId,
      ratings.attitude,
      ratings.professionalism,
      ratings.patience,
      ratings.punctuality,
      content || '',
      (tags || []).join(','),
    ])

    await courseService.markReviewed(courseId)
    await coachService.updateRating(coachId)

    return await this.getById(id)
  },

  async getById(id) {
    const row = await db.getOne('SELECT * FROM reviews WHERE id = ?', [id])
    return formatReview(row)
  },
}

const simulatorService = {
  async getInfo() {
    const row = await db.getOne('SELECT * FROM simulator_info LIMIT 1')
    if (!row) return null
    return {
      name: row.name,
      description: row.description,
      duration: row.duration,
      location: row.location,
      notice: row.notice ? row.notice.split('|') : [],
      faq: (row.faq || '').split('|').filter(Boolean).map(item => {
        const [q, a] = item.split('？').map(s => s.trim())
        return { q: q + '？', a }
      }),
    }
  },

  async getSessions() {
    const rows = await db.query(`
      SELECT * FROM simulator_sessions
      WHERE session_date >= CURDATE()
      ORDER BY session_date, start_time
    `)

    const sessionsMap = {}
    for (const row of rows) {
      const date = row.session_date
      if (!sessionsMap[date]) {
        const dateObj = new Date(date)
        sessionsMap[date] = {
          id: 'sim-' + date,
          date,
          weekday: WEEK_DAYS[dateObj.getDay()],
          dayNum: dateObj.getDate(),
          month: dateObj.getMonth() + 1,
          slots: [],
        }
      }
      sessionsMap[date].slots.push({
        id: row.slot_id,
        start: row.start_time,
        end: row.end_time,
        status: row.status,
        price: Number(row.price),
        maxCount: row.max_count,
        bookedCount: row.booked_count,
      })
    }

    return Object.values(sessionsMap).sort((a, b) => new Date(a.date) - new Date(b.date))
  },

  async getMyBookings(studentId) {
    const rows = await db.query(`
      SELECT * FROM simulator_bookings
      WHERE student_id = ?
      ORDER BY session_date DESC
    `, [studentId])
    return rows.map(r => ({
      id: r.id,
      studentId: r.student_id,
      date: r.session_date,
      slot: { start: r.start_time, end: r.end_time },
      price: Number(r.price),
      status: r.status,
      createdAt: r.created_at,
    }))
  },

  async hasBooked(studentId, date, slotId) {
    const row = await db.getOne(`
      SELECT COUNT(*) as cnt FROM simulator_bookings
      WHERE student_id = ? AND session_date = ? AND slot_id = ? AND status != 'cancelled'
    `, [studentId, date, slotId])
    return row.cnt > 0
  },

  async book(studentId, sessionDate, slot) {
    if (await this.hasBooked(studentId, sessionDate, slot.id)) {
      return null
    }

    const sessionRow = await db.getOne(`
      SELECT * FROM simulator_sessions WHERE session_date = ? AND slot_id = ?
    `, [sessionDate, slot.id])

    if (!sessionRow || sessionRow.status !== 'available') {
      return null
    }

    const result = await db.transaction(async (conn) => {
      const [insertRes] = await conn.execute(`
        INSERT INTO simulator_bookings
        (student_id, session_date, slot_id, start_time, end_time, price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [studentId, sessionDate, slot.id, slot.start, slot.end, slot.price])

      const newBookedCount = sessionRow.booked_count + 1
      const newStatus = newBookedCount >= sessionRow.max_count ? 'full' : 'available'

      await conn.execute(`
        UPDATE simulator_sessions
        SET booked_count = ?, status = ?
        WHERE session_date = ? AND slot_id = ?
      `, [newBookedCount, newStatus, sessionDate, slot.id])

      return insertRes.insertId
    })

    const bookingRow = await db.getOne('SELECT * FROM simulator_bookings WHERE id = ?', [result])
    return {
      id: bookingRow.id,
      studentId: bookingRow.student_id,
      date: bookingRow.session_date,
      slot: { start: bookingRow.start_time, end: bookingRow.end_time },
      price: Number(bookingRow.price),
      status: bookingRow.status,
    }
  },
}

module.exports = {
  student: studentService,
  coach: coachService,
  course: courseService,
  review: reviewService,
  simulator: simulatorService,
}
