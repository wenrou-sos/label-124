import request from './request'

export function listCoachReviews(coachId) {
  return request.get(`/review/coach/${coachId}`)
}

export function submitReview(data) {
  return request.post('/review', data)
}
