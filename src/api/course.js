import request from './request'

export function listCourses(status) {
  return request.get('/course', { params: status ? { status } : {} })
}

export function getCourse(id) {
  return request.get(`/course/${id}`)
}

export function bookCourse(data) {
  return request.post('/course/book', data)
}

export function cancelCourse(id) {
  return request.post(`/course/${id}/cancel`)
}
