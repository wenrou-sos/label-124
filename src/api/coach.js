import request from './request'

export function listCoaches(subject) {
  return request.get('/coach', { params: subject ? { subject } : {} })
}

export function getCoach(id) {
  return request.get(`/coach/${id}`)
}

export function getCoachSchedule(id) {
  return request.get(`/coach/${id}/schedule`)
}

export function getCoachReviews(id) {
  return request.get(`/coach/${id}/reviews`)
}
