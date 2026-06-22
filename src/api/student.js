import request from './request'

export const MESSAGE_PRESETS = [
  '想练倒库',
  '需要加强坡道起步',
  '多练侧方停车',
  '练习S弯和直角转弯',
  '综合训练为主',
  '考前冲刺训练',
]

export function getStudentProfile() {
  return request.get('/student/profile')
}

export function getStudentProgress() {
  return request.get('/student/progress')
}

export function loginStudent(data) {
  return request.post('/student/login', data)
}
