import request from './request'

export function getSimulatorInfo() {
  return request.get('/simulator/info')
}

export function getSimulatorSessions() {
  return request.get('/simulator/sessions')
}

export function getMySimulatorBookings() {
  return request.get('/simulator/my-bookings')
}

export function bookSimulator(sessionDate, slot) {
  return request.post('/simulator/book', { sessionDate, slot })
}
