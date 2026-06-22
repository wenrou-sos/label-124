const db = require('./memory')
const { getDateStr } = require('../utils/date')

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function generateSchedule(coachId) {
  const coach = db.coaches.find(c => c.id === coachId)
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

    const slots = db.timeSlots.map(slot => {
      let status = 'available'
      let bookedCount = Math.floor(Math.random() * 3) + 1

      if (isRestDay) {
        status = 'rest'
        bookedCount = 0
      } else {
        const existing = db.courses.find(c =>
          c.coachId === coachId &&
          c.date === date &&
          c.timeSlot.id === slot.id &&
          c.status !== 'cancelled'
        )
        if (existing) {
          bookedCount += 1
        }
        if (bookedCount >= 6) {
          status = 'full'
          bookedCount = 6
        }
      }

      return {
        ...slot,
        status,
        bookedCount,
        maxCount: 6,
      }
    })

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
}

const studentService = {
  getById(id) {
    return db.students.find(s => s.id === id)
  },
  getByPhone(phone) {
    return db.students.find(s => s.phone === phone)
  },
  getProgress(studentId) {
    return db.subjectProgress.filter(p => p.studentId === studentId)
  },
}

const coachService = {
  list(subject) {
    if (subject) {
      return db.coaches.filter(c => c.subject === Number(subject))
    }
    return db.coaches
  },
  getById(id) {
    return db.coaches.find(c => c.id === id)
  },
  getSchedule(coachId) {
    return generateSchedule(coachId)
  },
  getReviews(coachId) {
    return db.reviews.filter(r => r.coachId === coachId)
  },
}

const courseService = {
  listByStudent(studentId, status) {
    let list = db.courses.filter(c => c.studentId === studentId)
    if (status && status !== 'all') {
      list = list.filter(c => c.status === status)
    }
    return list.sort((a, b) => {
      const priority = { upcoming: 0, completed: 1, cancelled: 2 }
      if (priority[a.status] !== priority[b.status]) {
        return priority[a.status] - priority[b.status]
      }
      return new Date(b.date) - new Date(a.date)
    })
  },
  getById(id) {
    return db.courses.find(c => c.id === id)
  },
  hasBooked(coachId, date, timeSlotId) {
    return db.courses.some(c =>
      c.coachId === coachId &&
      c.date === date &&
      c.timeSlot.id === timeSlotId &&
      c.status !== 'cancelled'
    )
  },
  create(data) {
    if (this.hasBooked(data.coachId, data.date, data.timeSlot.id)) {
      return null
    }
    const newCourse = {
      id: db.getNextCourseId(),
      ...data,
      status: 'upcoming',
      createdAt: getDateStr(0),
      hours: 2,
      reviewed: false,
    }
    db.courses.unshift(newCourse)
    return newCourse
  },
  cancel(id, reason = '个人原因') {
    const course = db.courses.find(c => c.id === id)
    if (course) {
      course.status = 'cancelled'
      course.cancelReason = reason
      course.cancelledAt = getDateStr(0)
      return course
    }
    return null
  },
  markReviewed(id) {
    const course = db.courses.find(c => c.id === id)
    if (course) {
      course.reviewed = true
      return course
    }
    return null
  },
}

const reviewService = {
  listByCoach(coachId) {
    return db.reviews.filter(r => r.coachId === coachId)
  },
  create(data) {
    const newReview = {
      id: db.getNextReviewId(),
      date: getDateStr(0),
      ...data,
    }
    db.reviews.unshift(newReview)

    const coach = db.coaches.find(c => c.id === data.coachId)
    if (coach) {
      const coachReviews = db.reviews.filter(r => r.coachId === data.coachId)
      coach.ratingCount = coachReviews.length

      const dims = ['attitude', 'professionalism', 'patience', 'punctuality']
      const dimSums = { attitude: 0, professionalism: 0, patience: 0, punctuality: 0 }
      coachReviews.forEach(r => {
        dims.forEach(d => {
          dimSums[d] += r.ratings[d] || 0
        })
      })
      dims.forEach(d => {
        coach.ratings[d] = Number((dimSums[d] / coachReviews.length).toFixed(1))
      })

      const totalAvg = dims.reduce((sum, d) => sum + coach.ratings[d], 0) / dims.length
      coach.rating = Number(totalAvg.toFixed(1))
    }

    return newReview
  },
}

const simulatorService = {
  getInfo() {
    return db.simulatorInfo
  },
  getSessions() {
    return db.simulatorSessions
  },
  getMyBookings(studentId) {
    return db.bookedSimulators.filter(b => b.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  hasBooked(studentId, date, slotStart) {
    return db.bookedSimulators.some(s =>
      s.studentId === studentId &&
      s.date === date &&
      s.slot.start === slotStart &&
      s.status !== 'cancelled'
    )
  },
  book(studentId, sessionDate, slot) {
    if (this.hasBooked(studentId, sessionDate, slot.start)) {
      return null
    }

    const daySession = db.simulatorSessions.find(s => s.date === sessionDate)
    if (daySession) {
      const targetSlot = daySession.slots.find(sl => sl.id === slot.id)
      if (targetSlot && targetSlot.status === 'available') {
        targetSlot.bookedCount += 1
        if (targetSlot.bookedCount >= targetSlot.maxCount) {
          targetSlot.status = 'full'
        }
      }
    }

    const newBooking = {
      id: 'sim-booked-' + Date.now(),
      studentId,
      date: sessionDate,
      slot: { start: slot.start, end: slot.end },
      price: slot.price,
      status: 'upcoming',
    }
    db.bookedSimulators.unshift(newBooking)
    return newBooking
  },
}

module.exports = {
  student: studentService,
  coach: coachService,
  course: courseService,
  review: reviewService,
  simulator: simulatorService,
  timeSlots: db.timeSlots,
}
