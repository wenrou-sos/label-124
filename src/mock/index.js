import { reactive } from 'vue'

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const TIME_SLOTS = [
  { id: 'morning1', name: '早班1', start: '08:00', end: '10:00', period: 'morning' },
  { id: 'morning2', name: '早班2', start: '10:00', end: '12:00', period: 'morning' },
  { id: 'afternoon1', name: '下午1', start: '14:00', end: '16:00', period: 'afternoon' },
  { id: 'afternoon2', name: '下午2', start: '16:00', end: '18:00', period: 'afternoon' },
  { id: 'evening', name: '晚班', start: '18:00', end: '20:00', period: 'evening' },
]

const MESSAGE_PRESETS = [
  '想练倒库',
  '需要加强坡道起步',
  '多练侧方停车',
  '练习S弯技巧',
  '熟悉直角转弯',
  '综合训练为主',
]

export const studentInfo = reactive({
  id: 'S2024001',
  name: '张同学',
  avatar: '👨‍🎓',
  phone: '138****8888',
  school: '阳光驾校',
  enrollDate: '2024-03-15',
  totalHours: 62,
  usedHours: 18.5,
  remainingHours: 43.5,
  credits: 380,
})

export const subjectProgress = reactive([
  {
    id: 1,
    name: '科一',
    fullName: '理论知识',
    status: 'passed',
    icon: '📚',
    passDate: '2024-04-10',
    score: 96,
    color: 'linear-gradient(135deg, #07c160 0%, #10b981 100%)',
  },
  {
    id: 2,
    name: '科二',
    fullName: '场地驾驶',
    status: 'training',
    icon: '🚗',
    trainingHours: 8.5,
    requiredHours: 16,
    color: 'linear-gradient(135deg, #1989fa 0%, #3da5ff 100%)',
  },
  {
    id: 3,
    name: '科三',
    fullName: '道路驾驶',
    status: 'not_started',
    icon: '🛣️',
    color: 'linear-gradient(135deg, #969799 0%, #b0b1b3 100%)',
  },
  {
    id: 4,
    name: '科四',
    fullName: '文明驾驶',
    status: 'not_started',
    icon: '🎯',
    color: 'linear-gradient(135deg, #969799 0%, #b0b1b3 100%)',
  },
])

export const coaches = reactive([
  {
    id: 1,
    name: '李教练',
    avatar: '👨‍🏫',
    gender: '男',
    age: 42,
    experience: 12,
    carModel: '大众朗逸',
    carNo: '京A·12345学',
    rating: 4.9,
    ratingCount: 328,
    students: 56,
    passRate: '95.8%',
    tags: ['耐心细致', '通过率高', '教学专业'],
    phone: '139****1234',
    subject: 2,
    ratings: {
      attitude: 4.9,
      professionalism: 4.9,
      patience: 4.8,
      punctuality: 5.0,
    },
  },
  {
    id: 2,
    name: '王教练',
    avatar: '👩‍🏫',
    gender: '女',
    age: 38,
    experience: 8,
    carModel: '丰田卡罗拉',
    carNo: '京A·67890学',
    rating: 4.8,
    ratingCount: 256,
    students: 42,
    passRate: '93.2%',
    tags: ['温柔耐心', '讲解清晰', '通过率高'],
    phone: '138****5678',
    subject: 2,
    ratings: {
      attitude: 4.9,
      professionalism: 4.7,
      patience: 5.0,
      punctuality: 4.7,
    },
  },
  {
    id: 3,
    name: '陈教练',
    avatar: '🧑‍🏫',
    gender: '男',
    age: 45,
    experience: 15,
    carModel: '大众速腾',
    carNo: '京A·11111学',
    rating: 4.7,
    ratingCount: 412,
    students: 68,
    passRate: '96.5%',
    tags: ['资深教练', '教学严谨', '经验丰富'],
    phone: '137****9012',
    subject: 3,
    ratings: {
      attitude: 4.6,
      professionalism: 4.9,
      patience: 4.6,
      punctuality: 4.8,
    },
  },
  {
    id: 4,
    name: '刘教练',
    avatar: '👨‍🏫',
    gender: '男',
    age: 36,
    experience: 6,
    carModel: '雪铁龙爱丽舍',
    carNo: '京A·22222学',
    rating: 4.6,
    ratingCount: 178,
    students: 35,
    passRate: '91.5%',
    tags: ['年轻活力', '教学新颖', '善于沟通'],
    phone: '136****3456',
    subject: 2,
    ratings: {
      attitude: 4.7,
      professionalism: 4.5,
      patience: 4.6,
      punctuality: 4.5,
    },
  },
])

export const reviews = reactive([
  {
    id: 1,
    coachId: 1,
    studentName: '李同学',
    avatar: '👩‍🎓',
    date: '2024-06-15',
    courseId: 101,
    ratings: { attitude: 5, professionalism: 5, patience: 5, punctuality: 5 },
    content: '李教练教得特别好，非常有耐心，每次练车都很有收获！倒库教的方法特别实用，一学就会。',
    tags: ['有耐心', '讲解清晰', '方法实用'],
  },
  {
    id: 2,
    coachId: 1,
    studentName: '王同学',
    avatar: '👨‍🎓',
    date: '2024-06-12',
    courseId: 98,
    ratings: { attitude: 5, professionalism: 5, patience: 4, punctuality: 5 },
    content: '教练非常专业，经验丰富，每次都能指出我操作中的问题，进步很快。',
    tags: ['经验丰富', '专业细致'],
  },
  {
    id: 3,
    coachId: 2,
    studentName: '赵同学',
    avatar: '👩‍🎓',
    date: '2024-06-10',
    courseId: 95,
    ratings: { attitude: 5, professionalism: 5, patience: 5, punctuality: 4 },
    content: '王教练特别温柔，练车时从来不会紧张，坡道起步练了很多次才学会，教练一直很有耐心。',
    tags: ['温柔耐心', '缓解紧张'],
  },
])

function getDateStr(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function generateSchedule(coachId) {
  const schedule = []
  for (let i = 0; i < 7; i++) {
    const date = getDateStr(i)
    const dateObj = new Date(date)
    const dayIdx = dateObj.getDay()
    const weekday = WEEK_DAYS[dayIdx]
    const dayNum = dateObj.getDate()
    const month = dateObj.getMonth() + 1

    const isRestDay = (coachId === 1 && dayIdx === 1) ||
      (coachId === 2 && dayIdx === 3) ||
      (coachId === 3 && dayIdx === 6) ||
      (coachId === 4 && dayIdx === 0)

    const slots = TIME_SLOTS.map((slot) => {
      let status = 'available'
      let bookedCount = Math.floor(Math.random() * 6)

      if (isRestDay) {
        status = 'rest'
        bookedCount = 0
      } else if (i === 0) {
        const rand = Math.random()
        if (rand < 0.4) status = 'full'
        else if (rand < 0.5) status = 'rest'
      } else if (i < 3) {
        if (Math.random() < 0.3) status = 'full'
      } else {
        if (Math.random() < 0.15) status = 'full'
      }

      if (status === 'full') bookedCount = 6
      if (status === 'available' && bookedCount < 2) bookedCount = 2 + Math.floor(Math.random() * 3)

      return {
        ...slot,
        status,
        bookedCount,
        maxCount: 6,
      }
    })

    schedule.push({
      date,
      weekday,
      dayNum,
      month,
      isRestDay,
      isToday: i === 0,
      slots,
    })
  }
  return schedule
}

export const courses = reactive([
  {
    id: 101,
    coachId: 1,
    coachName: '李教练',
    coachAvatar: '👨‍🏫',
    date: getDateStr(1),
    timeSlot: TIME_SLOTS[1],
    location: '阳光驾校训练场地A区 - 3号位',
    subject: 2,
    status: 'upcoming',
    message: '想练倒库',
    createdAt: getDateStr(-3),
    hours: 2,
  },
  {
    id: 102,
    coachId: 2,
    coachName: '王教练',
    coachAvatar: '👩‍🏫',
    date: getDateStr(2),
    timeSlot: TIME_SLOTS[2],
    location: '阳光驾校训练场地B区 - 1号位',
    subject: 2,
    status: 'upcoming',
    message: '需要加强坡道起步',
    createdAt: getDateStr(-1),
    hours: 2,
  },
  {
    id: 103,
    coachId: 1,
    coachName: '李教练',
    coachAvatar: '👨‍🏫',
    date: getDateStr(4),
    timeSlot: TIME_SLOTS[0],
    location: '阳光驾校训练场地A区 - 3号位',
    subject: 2,
    status: 'upcoming',
    message: '',
    createdAt: getDateStr(0),
    hours: 2,
  },
  {
    id: 98,
    coachId: 1,
    coachName: '李教练',
    coachAvatar: '👨‍🏫',
    date: getDateStr(-3),
    timeSlot: TIME_SLOTS[3],
    location: '阳光驾校训练场地A区 - 3号位',
    subject: 2,
    status: 'completed',
    message: '综合训练为主',
    createdAt: getDateStr(-7),
    hours: 2,
    reviewed: true,
  },
  {
    id: 97,
    coachId: 2,
    coachName: '王教练',
    coachAvatar: '👩‍🏫',
    date: getDateStr(-5),
    timeSlot: TIME_SLOTS[1],
    location: '阳光驾校训练场地B区 - 1号位',
    subject: 2,
    status: 'completed',
    message: '多练侧方停车',
    createdAt: getDateStr(-10),
    hours: 2,
    reviewed: false,
  },
  {
    id: 96,
    coachId: 3,
    coachName: '陈教练',
    coachAvatar: '🧑‍🏫',
    date: getDateStr(-2),
    timeSlot: TIME_SLOTS[2],
    location: '市区道路训练场',
    subject: 3,
    status: 'cancelled',
    message: '',
    createdAt: getDateStr(-8),
    hours: 2,
    cancelReason: '个人原因',
    cancelledAt: getDateStr(-3),
  },
])

export const simulatorSessions = reactive([
  {
    id: 'sim1',
    date: getDateStr(1),
    slots: [
      { id: 's1', start: '09:00', end: '11:00', status: 'available', price: 180 },
      { id: 's2', start: '13:00', end: '15:00', status: 'available', price: 180 },
      { id: 's3', start: '15:30', end: '17:30', status: 'full', price: 180 },
      { id: 's4', start: '18:00', end: '20:00', status: 'available', price: 200 },
    ],
  },
  {
    id: 'sim2',
    date: getDateStr(2),
    slots: [
      { id: 's1', start: '09:00', end: '11:00', status: 'full', price: 180 },
      { id: 's2', start: '13:00', end: '15:00', status: 'available', price: 180 },
      { id: 's3', start: '15:30', end: '17:30', status: 'available', price: 180 },
      { id: 's4', start: '18:00', end: '20:00', status: 'available', price: 200 },
    ],
  },
  {
    id: 'sim3',
    date: getDateStr(3),
    slots: [
      { id: 's1', start: '09:00', end: '11:00', status: 'available', price: 180 },
      { id: 's2', start: '13:00', end: '15:00', status: 'available', price: 180 },
      { id: 's3', start: '15:30', end: '17:30', status: 'full', price: 180 },
      { id: 's4', start: '18:00', end: '20:00', status: 'rest', price: 200 },
    ],
  },
  {
    id: 'sim4',
    date: getDateStr(4),
    slots: [
      { id: 's1', start: '09:00', end: '11:00', status: 'available', price: 180 },
      { id: 's2', start: '13:00', end: '15:00', status: 'available', price: 180 },
      { id: 's3', start: '15:30', end: '17:30', status: 'available', price: 180 },
      { id: 's4', start: '18:00', end: '20:00', status: 'available', price: 200 },
    ],
  },
  {
    id: 'sim5',
    date: getDateStr(5),
    slots: [
      { id: 's1', start: '09:00', end: '11:00', status: 'available', price: 180 },
      { id: 's2', start: '13:00', end: '15:00', status: 'rest', price: 180 },
      { id: 's3', start: '15:30', end: '17:30', status: 'available', price: 180 },
      { id: 's4', start: '18:00', end: '20:00', status: 'available', price: 200 },
    ],
  },
  {
    id: 'sim6',
    date: getDateStr(6),
    slots: [
      { id: 's1', start: '09:00', end: '11:00', status: 'available', price: 180 },
      { id: 's2', start: '13:00', end: '15:00', status: 'available', price: 180 },
      { id: 's3', start: '15:30', end: '17:30', status: 'available', price: 180 },
      { id: 's4', start: '18:00', end: '20:00', status: 'available', price: 200 },
    ],
  },
  {
    id: 'sim7',
    date: getDateStr(7),
    slots: [
      { id: 's1', start: '09:00', end: '11:00', status: 'available', price: 180 },
      { id: 's2', start: '13:00', end: '15:00', status: 'available', price: 180 },
      { id: 's3', start: '15:30', end: '17:30', status: 'available', price: 180 },
      { id: 's4', start: '18:00', end: '20:00', status: 'available', price: 200 },
    ],
  },
])

export const simulatorInfo = reactive({
  name: '科二考场模拟训练',
  description: '1:1还原真实考场环境，助您熟悉考试流程',
  duration: '2小时/次',
  location: '阳光驾校考场模拟中心',
  notice: [
    '模拟训练需额外收费，不包含在学时卡内',
    '请提前15分钟到达模拟中心签到',
    '携带本人身份证原件',
    '模拟训练前建议先完成16学时基础训练',
  ],
  faq: [
    { q: '模拟训练和真实考场一样吗？', a: '是的，我们采用1:1还原真实考场的场地布局、标线和设备。' },
    { q: '可以反复模拟吗？', a: '可以，建议考前进行2-3次模拟训练，通过率提升明显。' },
  ],
})

export const bookedSimulators = reactive([
  {
    id: 'sim-booked-1',
    date: getDateStr(-2),
    slot: { start: '13:00', end: '15:00' },
    price: 180,
    status: 'completed',
  },
])

export function addCourse(course) {
  const newCourse = {
    id: Date.now(),
    ...course,
    status: 'upcoming',
    createdAt: getDateStr(0),
    hours: 2,
  }
  courses.unshift(newCourse)
  return newCourse
}

export function cancelCourse(courseId) {
  const idx = courses.findIndex((c) => c.id === courseId)
  if (idx !== -1) {
    courses[idx].status = 'cancelled'
    courses[idx].cancelReason = '个人原因'
    courses[idx].cancelledAt = getDateStr(0)
  }
}

export function markReviewed(courseId) {
  const idx = courses.findIndex((c) => c.id === courseId)
  if (idx !== -1) {
    courses[idx].reviewed = true
  }
}

export function addReview(review) {
  reviews.unshift({
    id: Date.now(),
    date: getDateStr(0),
    ...review,
  })
}

export function addBookedSimulator(sim) {
  bookedSimulators.unshift({
    id: 'sim-booked-' + Date.now(),
    ...sim,
    status: 'upcoming',
  })
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const week = WEEK_DAYS[d.getDay()]
  return `${month}月${day}日 ${week}`
}

export function isWithinCancelWindow(dateStr, timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const courseTime = new Date(dateStr)
  courseTime.setHours(h, m, 0, 0)
  const now = new Date()
  const diff = courseTime.getTime() - now.getTime()
  const twoHours = 2 * 60 * 60 * 1000
  return diff >= twoHours
}

export { TIME_SLOTS, MESSAGE_PRESETS, WEEK_DAYS }
