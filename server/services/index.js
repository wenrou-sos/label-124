const config = require('../config')

let services

if (config.dataSource === 'mysql') {
  services = require('./mysqlService')
} else {
  const memoryData = require('../data/memory')
  const { getDateStr, isWithinCancelWindow } = require('../utils/date')

  const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  const studentService = {
    async getById(id) {
      return memoryData.students.find(s => s.id === id) || null
    },
    async getByPhone(phone) {
      return memoryData.students.find(s => s.phone === phone) || null
    },
    async getProgress(studentId) {
      return memoryData.subjectProgress.filter(p => p.studentId === studentId)
    },
  }

  const coachService = {
    async list(subject) {
      if (subject) {
        return memoryData.coaches.filter(c => c.subject === Number(subject))
      }
      return memoryData.coaches
    },
    async getById(id) {
      return memoryData.coaches.find(c => c.id === id) || null
    },
    async getSchedule(coachId) {
      const coach = memoryData.coaches.find(c => c.id === coachId)
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

        const slots = memoryData.timeSlots.map(ts => {
          let status = 'available'
          let bookedCount = 1 + Math.floor(Math.random() * 3)

          if (isRestDay) {
            status = 'rest'
            bookedCount = 0
          } else {
            const hasBooking = memoryData.courses.some(c =>
              c.coachId === coachId &&
              c.date === date &&
              c.timeSlot.id === ts.id &&
              c.status !== 'cancelled'
            )
            if (hasBooking) bookedCount += 1
            if (bookedCount >= 6) {
              status = 'full'
              bookedCount = 6
            }
          }

          return {
            id: ts.id,
            name: ts.name,
            start: ts.start,
            end: ts.end,
            period: ts.period,
            status,
            bookedCount,
            maxCount: 6,
          }
        })

        schedule.push({
          id: 'day-' + i,
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
      return memoryData.reviews.filter(r => r.coachId === coachId)
    },
    async updateRating(coachId) {
      const coachReviews = memoryData.reviews.filter(r => r.coachId === coachId)
      const coach = memoryData.coaches.find(c => c.id === coachId)
      if (!coach) return

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
    },
  }

  const courseService = {
    async listByStudent(studentId, status) {
      let list = memoryData.courses.filter(c => c.studentId === studentId)
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
    async getById(id) {
      return memoryData.courses.find(c => c.id === id) || null
    },
    async hasBooked(coachId, date, timeSlotId) {
      return memoryData.courses.some(c =>
        c.coachId === coachId &&
        c.date === date &&
        c.timeSlot.id === timeSlotId &&
        c.status !== 'cancelled'
      )
    },
    async create(data) {
      if (await this.hasBooked(data.coachId, data.date, data.timeSlot.id)) {
        return null
      }
      const newCourse = {
        id: memoryData.getNextCourseId(),
        ...data,
        status: 'upcoming',
        createdAt: getDateStr(0),
        hours: 2,
        reviewed: false,
      }
      memoryData.courses.unshift(newCourse)
      return newCourse
    },
    async cancel(id, reason = '个人原因') {
      const course = memoryData.courses.find(c => c.id === id)
      if (!course || course.status !== 'upcoming') {
        return null
      }
      const canCancelFree = isWithinCancelWindow(course.date, course.timeSlot.start, 2)
      course.status = 'cancelled'
      course.cancelReason = reason
      course.cancelledAt = getDateStr(0)
      return { course, canCancelFree }
    },
    async markReviewed(id) {
      const course = memoryData.courses.find(c => c.id === id)
      if (course) course.reviewed = true
      return course
    },
  }

  const reviewService = {
    async listByCoach(coachId) {
      return memoryData.reviews.filter(r => r.coachId === coachId)
    },
    async getByCourseId(courseId) {
      return memoryData.reviews.find(r => r.courseId === courseId) || null
    },
    async create(data) {
      const { coachId, studentId, courseId } = data

      const course = memoryData.courses.find(c => c.id === courseId)
      if (!course) throw new Error('课程不存在')
      if (course.status !== 'completed') throw new Error('只有已完成的课程才能评价')
      if (course.reviewed) throw new Error('该课程已评价过')

      const newReview = {
        id: memoryData.getNextReviewId(),
        date: getDateStr(0),
        ...data,
      }
      memoryData.reviews.unshift(newReview)

      course.reviewed = true

      await coachService.updateRating(coachId)

      return newReview
    },
  }

  const simulatorService = {
    async getInfo() {
      return memoryData.simulatorInfo
    },
    async getSessions() {
      return memoryData.simulatorSessions
    },
    async getMyBookings(studentId) {
      return memoryData.bookedSimulators
        .filter(b => b.studentId === studentId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    async hasBooked(studentId, date, slotId) {
      return memoryData.bookedSimulators.some(s =>
        s.studentId === studentId &&
        s.date === date &&
        s.slotId === slotId &&
        s.status !== 'cancelled'
      )
    },
    async book(studentId, sessionDate, slot) {
      if (await this.hasBooked(studentId, sessionDate, slot.id)) {
        return null
      }

      const daySession = memoryData.simulatorSessions.find(s => s.date === sessionDate)
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
        slotId: slot.id,
        slot: { start: slot.start, end: slot.end },
        price: slot.price,
        status: 'upcoming',
      }
      memoryData.bookedSimulators.unshift(newBooking)
      return newBooking
    },
  }

  services = {
    student: studentService,
    coach: coachService,
    course: courseService,
    review: reviewService,
    simulator: simulatorService,
  }
}

module.exports = services
