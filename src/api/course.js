import request from './request'

export function getCourseList(status) {
  return request.get('/course', { params: { status } })
}

export function getCourseDetail(id) {
  return request.get(`/course/${id}`)
}

export function bookCourse(data) {
  return request.post('/course/book', data)
}

export function cancelCourse(id, reason) {
  return request.post(`/course/${id}/cancel`, { reason })
}

export function getCourseReviewStatus(id) {
  return request.get(`/course/${id}/review-status`)
}
