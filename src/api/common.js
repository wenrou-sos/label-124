import request from './request'

export function getMeta() {
  return request.get('/common/meta')
}
