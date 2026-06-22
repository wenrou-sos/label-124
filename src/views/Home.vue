<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <h2 class="greeting">你好，{{ student.name || '学员' }}</h2>
        <p class="subtitle">{{ student.school || '阳光驾校' }}</p>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ student.usedHours || 0 }}</div>
            <div class="stat-label">已练学时</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">{{ student.remainingHours || 0 }}</div>
            <div class="stat-label">剩余学时</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">{{ student.credits || 0 }}</div>
            <div class="stat-label">学分</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-title">
      <h3>学习进度</h3>
      <span class="more" @click="$router.push('/profile')">查看全部</span>
    </div>

    <div class="progress-grid">
      <div
        v-for="item in progressList"
        :key="item.subject"
        class="progress-card"
        :style="{ background: item.color }"
      >
        <div class="card-header">
          <span class="card-icon">{{ item.icon }}</span>
          <span class="card-status" :class="item.status">
            {{ statusText(item.status) }}
          </span>
        </div>
        <div class="card-title">{{ item.subjectName }}</div>
        <div class="card-subtitle">{{ item.fullName }}</div>
        <div v-if="item.status === 'training'" class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent(item) + '%' }"></div>
        </div>
        <div v-if="item.status === 'training'" class="hours-text">
          已练 {{ item.trainingHours }} / {{ item.requiredHours }} 学时
        </div>
        <div v-if="item.status === 'passed'" class="pass-info">
          <span class="pass-score">{{ item.score }}分</span>
        </div>
      </div>
    </div>

    <div class="section-title">
      <h3>快捷功能</h3>
    </div>

    <div class="quick-grid">
      <div class="quick-item" @click="$router.push('/booking')">
        <div class="quick-icon bg-blue">📅</div>
        <span>预约练车</span>
      </div>
      <div class="quick-item" @click="$router.push('/simulator')">
        <div class="quick-icon bg-orange">🎯</div>
        <span>考场模拟</span>
      </div>
      <div class="quick-item" @click="$router.push('/courses')">
        <div class="quick-icon bg-green">📋</div>
        <span>我的课程</span>
      </div>
      <div class="quick-item" @click="$router.push('/profile')">
        <div class="quick-icon bg-purple">👤</div>
        <span>个人中心</span>
      </div>
    </div>

    <div class="section-title">
      <h3>近期课程</h3>
      <span class="more" @click="$router.push('/courses')">全部课程</span>
    </div>

    <div v-if="upcomingCourses.length > 0" class="upcoming-list">
      <div v-for="course in upcomingCourses" :key="course.id" class="upcoming-card" @click="$router.push('/courses')">
        <div class="upcoming-date">
          <div class="date-day">{{ formatDay(course.date) }}</div>
          <div class="date-month">{{ formatMonth(course.date) }}月</div>
          <div class="date-weekday">{{ formatWeekday(course.date) }}</div>
        </div>
        <div class="upcoming-info">
          <div class="upcoming-time">{{ course.timeSlot.start }} - {{ course.timeSlot.end }}</div>
          <div class="upcoming-coach">{{ course.coachName }} · 科{{ course.subject }}</div>
          <div class="upcoming-location">📍 {{ course.location }}</div>
        </div>
        <div class="upcoming-status upcoming">待上课</div>
      </div>
    </div>
    <van-empty v-else description="暂无近期课程" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStudentProfile, getStudentProgress, getCourseList } from '../api'
import { showLoadingToast, closeToast } from 'vant'

const student = ref({})
const progressList = ref([])
const upcomingCourses = ref([])

function statusText(status) {
  const map = {
    not_started: '未开始',
    training: '学习中',
    passed: '已通过',
  }
  return map[status] || status
}

function progressPercent(item) {
  if (!item.requiredHours) return 0
  return Math.min(100, (item.trainingHours / item.requiredHours) * 100)
}

function formatDay(dateStr) {
  return new Date(dateStr).getDate()
}

function formatMonth(dateStr) {
  return new Date(dateStr).getMonth() + 1
}

function formatWeekday(dateStr) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date(dateStr).getDay()]
}

async function loadData() {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    const [profile, progress, courses] = await Promise.all([
      getStudentProfile(),
      getStudentProgress(),
      getCourseList('upcoming'),
    ])
    student.value = profile
    progressList.value = progress
    upcomingCourses.value = Array.isArray(courses) ? courses.slice(0, 3) : []
  } catch (e) {
    console.error('加载首页数据失败', e)
  } finally {
    closeToast()
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-page {
  padding-bottom: 20px;
}

.hero-section {
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 100%);
  padding: 30px 20px 50px;
  color: #fff;
  border-radius: 0 0 24px 24px;
}

.greeting {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 6px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.85;
  margin: 0 0 20px;
}

.stats-row {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 16px 0;
  backdrop-filter: blur(10px);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.85;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.3);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 12px;
}

.section-title h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: #323233;
}

.more {
  font-size: 13px;
  color: #969799;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
}

.progress-card {
  border-radius: 16px;
  padding: 16px;
  color: #fff;
  min-height: 130px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-icon {
  font-size: 24px;
}

.card-status {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
}

.card-status.passed {
  background: rgba(255, 255, 255, 0.9);
  color: #07c160;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.card-subtitle {
  font-size: 12px;
  opacity: 0.85;
  margin-bottom: 10px;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-top: auto;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 3px;
  transition: width 0.3s;
}

.hours-text {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 6px;
}

.pass-info {
  margin-top: auto;
}

.pass-score {
  font-size: 13px;
  background: rgba(255, 255, 255, 0.9);
  color: #07c160;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 16px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.bg-blue {
  background: linear-gradient(135deg, #e8f3ff 0%, #d0e8ff 100%);
}

.bg-orange {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.bg-green {
  background: linear-gradient(135deg, #e8f8ef 0%, #c8eed8 100%);
}

.bg-purple {
  background: linear-gradient(135deg, #f3e8ff 0%, #e0c8ff 100%);
}

.quick-item span {
  font-size: 12px;
  color: #646566;
}

.upcoming-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upcoming-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.upcoming-date {
  width: 56px;
  text-align: center;
  background: #f7f8fa;
  border-radius: 12px;
  padding: 8px 0;
}

.date-day {
  font-size: 20px;
  font-weight: 700;
  color: #323233;
}

.date-month {
  font-size: 11px;
  color: #969799;
}

.date-weekday {
  font-size: 11px;
  color: #969799;
}

.upcoming-info {
  flex: 1;
}

.upcoming-time {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.upcoming-coach {
  font-size: 13px;
  color: #646566;
  margin-bottom: 4px;
}

.upcoming-location {
  font-size: 12px;
  color: #969799;
}

.upcoming-status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.upcoming-status.upcoming {
  background: #e8f3ff;
  color: #1989fa;
}
</style>
