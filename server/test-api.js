const http = require('http')
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function request(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null
    const req = http.request({
      hostname: 'localhost', port: 3000, path, method,
      headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}
    }, (res) => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }) } catch (e) { resolve({ status: res.statusCode, raw: d }) }
      })
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}
function log(title, res) {
  const ok = res.body && res.body.code === 0
  console.log(`\n=== ${title} [${ok ? '✅ PASS' : '❌ FAIL'} HTTP ${res.status}] ===`)
  const b = res.body || res.raw
  try {
    const s = JSON.stringify(b, null, 2)
    console.log(s.length > 500 ? s.slice(0, 500) + '...(truncated)' : s)
  } catch { console.log(String(b).slice(0, 500)) }
}

;(async () => {
  const tests = []

  // 基础接口
  await sleep(100)
  tests.push(['健康检查', await request('/')])
  await sleep(50)
  tests.push(['GET /api/common/meta', await request('/api/common/meta')])
  await sleep(50)
  tests.push(['GET /api/student/profile', await request('/api/student/profile')])
  await sleep(50)
  tests.push(['GET /api/student/progress', await request('/api/student/progress')])
  await sleep(50)
  tests.push(['GET /api/coach (全部)', await request('/api/coach')])
  await sleep(50)
  tests.push(['GET /api/coach?subject=3 (科三筛选)', await request('/api/coach?subject=3')])
  await sleep(50)
  tests.push(['GET /api/coach/1', await request('/api/coach/1')])
  await sleep(50)
  tests.push(['GET /api/coach/1/schedule (7天课表)', await request('/api/coach/1/schedule')])
  await sleep(50)
  tests.push(['GET /api/coach/1/reviews', await request('/api/coach/1/reviews')])
  await sleep(50)
  tests.push(['GET /api/course (全部)', await request('/api/course')])
  await sleep(50)
  tests.push(['GET /api/course?status=upcoming', await request('/api/course?status=upcoming')])
  await sleep(50)
  tests.push(['GET /api/course?status=completed', await request('/api/course?status=completed')])

  // 预约测试
  const bookBody = { coachId: 3, date: '2099-06-01', timeSlot: { id: 'morning1', name: '早班1', start: '08:00', end: '10:00', period: 'morning' }, message: 'API测试' }
  await sleep(50)
  tests.push(['POST /api/course/book #1 (首次)', await request('/api/course/book', 'POST', bookBody)])
  await sleep(50)
  tests.push(['POST /api/course/book #2 (重复=失败)', await request('/api/course/book', 'POST', bookBody)])

  // 评价测试
  const comp = (await request('/api/course?status=completed')).body.data || []
  const unreviewed = comp.find(c => !c.reviewed)
  const upc = (await request('/api/course?status=upcoming')).body.data || []
  if (upc[0]) {
    await sleep(50)
    tests.push([`POST /api/review (未完成课程#${upc[0].id}=必须失败)`, await request('/api/review', 'POST', { coachId: upc[0].coachId, courseId: upc[0].id, ratings: { attitude: 5, professionalism: 5, patience: 5, punctuality: 5 }, content: 'bad' })])
  }
  if (unreviewed) {
    await sleep(50)
    tests.push([`POST /api/review (已完成未评价#${unreviewed.id}=成功)`, await request('/api/review', 'POST', { coachId: unreviewed.coachId, courseId: unreviewed.id, ratings: { attitude: 5, professionalism: 4, patience: 5, punctuality: 4 }, content: 'Good coach!', tags: ['专业', '耐心'] })])
    await sleep(50)
    tests.push([`POST /api/review 重复#${unreviewed.id}(必须失败)`, await request('/api/review', 'POST', { coachId: unreviewed.coachId, courseId: unreviewed.id, ratings: { attitude: 5, professionalism: 5, patience: 5, punctuality: 5 }, content: 'dup' })])
    await sleep(50)
    const cAfter = await request('/api/coach/' + unreviewed.coachId)
    console.log(`\n=== 📊 评价后教练#${unreviewed.coachId}最新数据 ===`)
    console.log(`综合评分: ${cAfter.body.data.rating}  | 评价总数: ${cAfter.body.data.ratingCount}`)
    console.log(`四维评分:`, cAfter.body.data.ratings)
  }

  // 模拟器
  await sleep(50)
  tests.push(['GET /api/simulator/info', await request('/api/simulator/info')])
  await sleep(50)
  tests.push(['GET /api/simulator/sessions', await request('/api/simulator/sessions')])
  await sleep(50)
  tests.push(['GET /api/simulator/my-bookings', await request('/api/simulator/my-bookings')])

  const sessions = (await request('/api/simulator/sessions')).body.data || []
  const avail = sessions[0] && sessions[0].slots.find(s => s.status === 'available')
  if (sessions[0] && avail) {
    const sb = { sessionDate: sessions[0].date, slot: { ...avail } }
    await sleep(50)
    tests.push([`POST /api/simulator/book #1 ${sessions[0].date} ${avail.start}(成功)`, await request('/api/simulator/book', 'POST', sb)])
    await sleep(50)
    tests.push([`POST /api/simulator/book #2 重复(必须失败)`, await request('/api/simulator/book', 'POST', sb)])
  }

  // 取消
  const up = (await request('/api/course?status=upcoming')).body.data || []
  if (up[0]) {
    await sleep(50)
    tests.push([`POST /api/course/${up[0].id}/cancel`, await request(`/api/course/${up[0].id}/cancel`, 'POST')])
  }

  // 汇总
  tests.forEach(([t, r]) => log(t, r))
  console.log('\n========================================')
  const pass = tests.filter(([, r]) => r.body && r.body.code === 0).length
  const total = tests.length
  const keyPassed = {
    '重复预约必须失败': tests.find(([t]) => t.includes('重复='))?.[1].body?.code !== 0,
    '评价未完成必须失败': tests.find(([t]) => t.includes('必须失败)'))?.[1].body?.code !== 0,
    '评价重复必须失败': tests.find(([t]) => t.includes('重复(必须'))?.[1].body?.code !== 0,
  }
  console.log(`📊 总接口: ${pass}/${total} 通过`)
  console.log(`🔒 关键业务约束:`, keyPassed)
  console.log('🎉 所有RESTful API测试完成')
})().catch(e => { console.error('❌ 测试异常:', e.message); process.exit(1) })
