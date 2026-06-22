import request from './request'

export function getStudentProfile() {
  return request.get('/student/profile')
}

export function getStudentProgress() {
  return request.get('/student/progress')
}

export function loginStudent(data) {
  return request.post('/student/login', data)
}
