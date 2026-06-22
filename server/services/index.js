const db = require('../db/index')
const DEFAULT_STUDENT_ID = 1

const studentService = {
  async getById(id) { return db.getStudentById(id) },
  async getByPhone(phone) { return db.getStudentByPhone(phone) },
  async getProgress(studentId) { return db.getStudentProgress(studentId) },
}

const coachService = {
  async list(subject) { return db.listCoaches(subject) },
  async getById(id) { return db.getCoachById(id) },
  async getSchedule(coachId) { return db.getCoachSchedule(coachId) },
  async getReviews(coachId) { return db.listCoachReviews(coachId) },
}

const courseService = {
  async listByStudent(studentId, status) { return db.listCoursesByStudent(studentId, status) },
  async getById(id) { return db.getCourseById(id) },
  async hasBooked(coachId, date, timeSlotId) { return db.hasBookedCourse(coachId, date, timeSlotId) },
  async create(data) {
    return db.createCourse({
      studentId: DEFAULT_STUDENT_ID,
      coachId: data.coachId,
      coachName: data.coachName,
      coachAvatar: data.coachAvatar,
      date: data.date,
      timeSlot: data.timeSlot,
      location: data.location,
      subject: data.subject,
      message: data.message || '',
      hours: data.hours || 2,
    })
  },
  async cancel(id, reason) { return db.cancelCourse(id, reason) },
  async markReviewed(id) { return db.markCourseReviewed(id) },
  async getStatus(id) { return db.getCourseStatus(id) },
}

const reviewService = {
  async listByCoach(coachId) { return db.listReviewsByCoach(coachId) },
  async create(data) {
    const res = await db.createReview({
      coachId: data.coachId,
      studentId: DEFAULT_STUDENT_ID,
      studentName: data.studentName || '我',
      studentAvatar: data.avatar || '🧑',
      courseId: data.courseId,
      ratings: data.ratings,
      content: data.content || '',
      tags: data.tags || [],
    })
    if (res) {
      await db.recalcCoachRating(data.coachId)
      await db.markCourseReviewed(data.courseId)
    }
    return res
  },
}

const simulatorService = {
  async getInfo() { return db.getSimulatorInfo() },
  async getSessions() { return db.listSimulatorSessions() },
  async getMyBookings(studentId) { return db.listMySimulatorBookings(studentId) },
  async hasBooked(studentId, date, slotId) { return db.hasBookedSimulator(studentId, date, slotId) },
  async book(studentId, sessionDate, slot) { return db.bookSimulator(studentId, sessionDate, slot) },
}

module.exports = {
  DEFAULT_STUDENT_ID,
  student: studentService,
  coach: coachService,
  course: courseService,
  review: reviewService,
  simulator: simulatorService,
  async timeSlots() { return db.listTimeSlots() },
}
