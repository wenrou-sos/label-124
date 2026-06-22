import request from './request'

export function getCoachList(subject) {
  return request.get('/coach', { params: { subject } })
}

export function getCoachDetail(id) {
  return request.get(`/coach/${id}`)
}

export function getCoachSchedule(id) {
  return request.get(`/coach/${id}/schedule`)
}

export function getCoachReviews(id, page, pageSize) {
  return request.get(`/coach/${id}/reviews`, { params: { page, pageSize } })
}
