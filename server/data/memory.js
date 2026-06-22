const { getDateStr } = require('../utils/date')

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const students = [
  {
    id: 1,
    studentNo: 'S2024001',
    name: '张同学',
    avatar: '👨‍🎓',
    phone: '13888888888',
    password: '123456',
    school: '阳光驾校',
    enrollDate: '2024-03-15',
    totalHours: 62,
    usedHours: 18.5,
    remainingHours: 43.5,
    credits: 380,
  },
]

const subjectProgress = [
  { id: 1, studentId: 1, subject: 1, subjectName: '科一', fullName: '理论知识', status: 'passed', icon: '📚', trainingHours: 0, requiredHours: 0, passDate: '2024-04-10', score: 96, color: 'linear-gradient(135deg, #07c160 0%, #10b981 100%)' },
  { id: 2, studentId: 1, subject: 2, subjectName: '科二', fullName: '场地驾驶', status: 'training', icon: '🚗', trainingHours: 8.5, requiredHours: 16, passDate: null, score: null, color: 'linear-gradient(135deg, #1989fa 0%, #3da5ff 100%)' },
  { id: 3, studentId: 1, subject: 3, subjectName: '科三', fullName: '道路驾驶', status: 'not_started', icon: '🛣️', trainingHours: 0, requiredHours: 16, passDate: null, score: null, color: 'linear-gradient(135deg, #969799 0%, #b0b1b3 100%)' },
  { id: 4, studentId: 1, subject: 4, subjectName: '科四', fullName: '文明驾驶', status: 'not_started', icon: '🎯', trainingHours: 0, requiredHours: 0, passDate: null, score: null, color: 'linear-gradient(135deg, #969799 0%, #b0b1b3 100%)' },
]

const coaches = [
  { id: 1, name: '李教练', avatar: '👨‍🏫', gender: '男', age: 42, experience: 12, carModel: '大众朗逸', carNo: '京A·12345学', rating: 4.9, ratingCount: 328, students: 56, passRate: '95.8%', tags: ['耐心细致', '通过率高', '教学专业'], phone: '139****1234', subject: 2, restDay: 1, ratings: { attitude: 4.9, professionalism: 4.9, patience: 4.8, punctuality: 5.0 } },
  { id: 2, name: '王教练', avatar: '👩‍🏫', gender: '女', age: 38, experience: 8, carModel: '丰田卡罗拉', carNo: '京A·67890学', rating: 4.8, ratingCount: 256, students: 42, passRate: '93.2%', tags: ['温柔耐心', '讲解清晰', '通过率高'], phone: '138****5678', subject: 2, restDay: 3, ratings: { attitude: 4.9, professionalism: 4.7, patience: 5.0, punctuality: 4.7 } },
  { id: 3, name: '陈教练', avatar: '🧑‍🏫', gender: '男', age: 45, experience: 15, carModel: '大众速腾', carNo: '京A·11111学', rating: 4.7, ratingCount: 412, students: 68, passRate: '96.5%', tags: ['资深教练', '教学严谨', '经验丰富'], phone: '137****9012', subject: 3, restDay: 6, ratings: { attitude: 4.6, professionalism: 4.9, patience: 4.6, punctuality: 4.8 } },
  { id: 4, name: '刘教练', avatar: '👨‍🏫', gender: '男', age: 36, experience: 6, carModel: '雪铁龙爱丽舍', carNo: '京A·22222学', rating: 4.6, ratingCount: 178, students: 35, passRate: '91.5%', tags: ['年轻活力', '教学新颖', '善于沟通'], phone: '136****3456', subject: 2, restDay: 0, ratings: { attitude: 4.7, professionalism: 4.5, patience: 4.6, punctuality: 4.5 } },
]

const timeSlots = [
  { id: 'morning1', name: '早班1', start: '08:00', end: '10:00', period: 'morning' },
  { id: 'morning2', name: '早班2', start: '10:00', end: '12:00', period: 'morning' },
  { id: 'afternoon1', name: '下午1', start: '14:00', end: '16:00', period: 'afternoon' },
  { id: 'afternoon2', name: '下午2', start: '16:00', end: '18:00', period: 'afternoon' },
  { id: 'evening', name: '晚班', start: '18:00', end: '20:00', period: 'evening' },
]

let courses = [
  { id: 101, studentId: 1, coachId: 1, coachName: '李教练', coachAvatar: '👨‍🏫', date: getDateStr(1), timeSlot: timeSlots[1], location: '阳光驾校训练场地A区 - 3号位', subject: 2, status: 'upcoming', message: '想练倒库', createdAt: getDateStr(-3), hours: 2, reviewed: false },
  { id: 102, studentId: 1, coachId: 2, coachName: '王教练', coachAvatar: '👩‍🏫', date: getDateStr(2), timeSlot: timeSlots[2], location: '阳光驾校训练场地B区 - 1号位', subject: 2, status: 'upcoming', message: '需要加强坡道起步', createdAt: getDateStr(-1), hours: 2, reviewed: false },
  { id: 103, studentId: 1, coachId: 1, coachName: '李教练', coachAvatar: '👨‍🏫', date: getDateStr(4), timeSlot: timeSlots[0], location: '阳光驾校训练场地A区 - 3号位', subject: 2, status: 'upcoming', message: '', createdAt: getDateStr(0), hours: 2, reviewed: false },
  { id: 98, studentId: 1, coachId: 1, coachName: '李教练', coachAvatar: '👨‍🏫', date: getDateStr(-3), timeSlot: timeSlots[3], location: '阳光驾校训练场地A区 - 3号位', subject: 2, status: 'completed', message: '综合训练为主', createdAt: getDateStr(-7), hours: 2, reviewed: true },
  { id: 97, studentId: 1, coachId: 2, coachName: '王教练', coachAvatar: '👩‍🏫', date: getDateStr(-5), timeSlot: timeSlots[1], location: '阳光驾校训练场地B区 - 1号位', subject: 2, status: 'completed', message: '多练侧方停车', createdAt: getDateStr(-10), hours: 2, reviewed: false },
]

let reviews = [
  { id: 1, coachId: 1, studentId: 2, studentName: '李同学', avatar: '👩‍🎓', date: '2024-06-15', courseId: 101, ratings: { attitude: 5, professionalism: 5, patience: 5, punctuality: 5 }, content: '李教练教得特别好，非常有耐心，每次练车都很有收获！倒库教的方法特别实用，一学就会。', tags: ['有耐心', '讲解清晰', '方法实用'] },
  { id: 2, coachId: 1, studentId: 3, studentName: '王同学', avatar: '👨‍🎓', date: '2024-06-12', courseId: 98, ratings: { attitude: 5, professionalism: 5, patience: 4, punctuality: 5 }, content: '教练非常专业，经验丰富，每次都能指出我操作中的问题，进步很快。', tags: ['经验丰富', '专业细致'] },
  { id: 3, coachId: 2, studentId: 4, studentName: '赵同学', avatar: '👩‍🎓', date: '2024-06-10', courseId: 95, ratings: { attitude: 5, professionalism: 5, patience: 5, punctuality: 4 }, content: '王教练特别温柔，练车时从来不会紧张，坡道起步练了很多次才学会，教练一直很有耐心。', tags: ['温柔耐心', '缓解紧张'] },
  { id: 4, coachId: 1, studentId: 1, studentName: '张同学', avatar: '👨‍🎓', date: '2024-06-08', courseId: 98, ratings: { attitude: 5, professionalism: 5, patience: 5, punctuality: 5 }, content: '李教练很专业，倒库和侧方停车都教得很好，每次都能有进步。', tags: ['专业', '有耐心'] },
]

const simulatorInfo = {
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
}

let simulatorSessions = []

function initSimulatorSessions() {
  simulatorSessions = []
  for (let i = 1; i <= 7; i++) {
    const date = getDateStr(i)
    const dateObj = new Date(date)
    const dayIdx = dateObj.getDay()
    const slots = [
      { id: 's1', start: '09:00', end: '11:00', status: 'available', price: 180, maxCount: 6, bookedCount: 0 },
      { id: 's2', start: '13:00', end: '15:00', status: 'available', price: 180, maxCount: 6, bookedCount: 0 },
      { id: 's3', start: '15:30', end: '17:30', status: 'available', price: 180, maxCount: 6, bookedCount: 0 },
      { id: 's4', start: '18:00', end: '20:00', status: 'available', price: 200, maxCount: 6, bookedCount: 0 },
    ]

    if (i === 1) {
      slots[2].status = 'full'
      slots[2].bookedCount = 6
    } else if (i === 2) {
      slots[0].status = 'full'
      slots[0].bookedCount = 6
    } else if (i === 3) {
      slots[2].status = 'full'
      slots[2].bookedCount = 6
      slots[3].status = 'rest'
    } else if (i === 5) {
      slots[1].status = 'rest'
    }

    simulatorSessions.push({
      id: 'sim' + i,
      date,
      weekday: WEEK_DAYS[dayIdx],
      dayNum: dateObj.getDate(),
      month: dateObj.getMonth() + 1,
      slots,
    })
  }
}

initSimulatorSessions()

let bookedSimulators = [
  {
    id: 'sim-booked-1',
    studentId: 1,
    date: getDateStr(-2),
    slot: { start: '13:00', end: '15:00' },
    price: 180,
    status: 'completed',
  },
]

let nextCourseId = 200
let nextReviewId = 10

module.exports = {
  students,
  subjectProgress,
  coaches,
  timeSlots,
  courses,
  reviews,
  simulatorInfo,
  simulatorSessions,
  bookedSimulators,
  WEEK_DAYS,
  getNextCourseId: () => ++nextCourseId,
  getNextReviewId: () => ++nextReviewId,
  initSimulatorSessions,
}
