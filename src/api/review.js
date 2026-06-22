import request from './request'

export function getReviewsByCoach(coachId) {
  return request.get(`/review/coach/${coachId}`)
}

export function getReviewsByStudent(studentId) {
  return request.get(`/review/student/${studentId}`)
}

export function getReviewByCourse(courseId) {
  return request.get(`/review/course/${courseId}`)
}

export function submitReview(data) {
  return request.post('/review', data)
}
