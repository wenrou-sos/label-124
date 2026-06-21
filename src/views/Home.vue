<template>
  <div class="home-page">
    <div class="hero-banner">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="greeting">
          <span class="wave">👋</span>
          <span class="greeting-text">下午好，{{ studentInfo.name }}</span>
        </div>
        <div class="hero-subtitle">学车路上，每一步都算数</div>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-value">{{ studentInfo.usedHours }}<span class="stat-unit">h</span></div>
            <div class="stat-label">已练学时</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">{{ studentInfo.remainingHours }}<span class="stat-unit">h</span></div>
            <div class="stat-label">剩余学时</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">{{ studentInfo.credits }}</div>
            <div class="stat-label">学分</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-container" style="margin-top: -30px; padding-top: 0;">
      <div class="section-title fade-in stagger-1">学习进度</div>
      <div class="progress-grid fade-in stagger-2">
        <div
          v-for="(item, idx) in subjectProgress"
          :key="item.id"
          class="progress-card"
          :style="{ background: item.color, animationDelay: `${idx * 0.08}s` }"
          @click="handleProgressClick(item)"
        >
          <div class="card-header">
            <span class="card-icon">{{ item.icon }}</span>
            <StatusTag :status="item.status" :data="item" />
          </div>
          <div class="card-body">
            <div class="card-name">{{ item.name }}</div>
            <div class="card-fullname">{{ item.fullName }}</div>
          </div>
          <div class="card-footer">
            <template v-if="item.status === 'passed'">
              <div class="pass-info">
                <van-icon name="passed" />
                <span>{{ item.score }}分 · {{ item.passDate.slice(5) }}</span>
              </div>
            </template>
            <template v-else-if="item.status === 'training'">
              <div class="training-bar">
                <div class="bar-bg">
                  <div
                    class="bar-fill"
                    :style="{ width: `${(item.trainingHours / item.requiredHours) * 100}%` }"
                  ></div>
                </div>
                <div class="bar-text">
                  已练{{ item.trainingHours }}/{{ item.requiredHours }}学时
                </div>
              </div>
            </template>
            <template v-else>
              <div class="pending-text">
                <van-icon name="clock-o" />
                <span>待开始</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="section-title fade-in stagger-3">快捷功能</div>
      <div class="quick-actions fade-in stagger-4">
        <div class="action-card" @click="$router.push('/booking')">
          <div class="action-icon-wrap" style="background: linear-gradient(135deg, #1989fa 0%, #3da5ff 100%);">
            <van-icon name="calendar-o" size="24" color="#fff" />
          </div>
          <div class="action-name">预约练车</div>
        </div>
        <div class="action-card" @click="$router.push('/courses')">
          <div class="action-icon-wrap" style="background: linear-gradient(135deg, #07c160 0%, #10b981 100%);">
            <van-icon name="orders-o" size="24" color="#fff" />
          </div>
          <div class="action-name">我的课程</div>
        </div>
        <div class="action-card" @click="$router.push('/simulator')">
          <div class="action-icon-wrap" style="background: linear-gradient(135deg, #ff976a 0%, #ffb088 100%);">
            <van-icon name="fire-o" size="24" color="#fff" />
            <span class="badge-tag">收费</span>
          </div>
          <div class="action-name">考场模拟</div>
        </div>
        <div class="action-card" @click="showTip()">
          <div class="action-icon-wrap" style="background: linear-gradient(135deg, #7232dd 0%, #9c62ee 100%);">
            <van-icon name="friends-o" size="24" color="#fff" />
          </div>
          <div class="action-name">教练团队</div>
        </div>
      </div>

      <div class="section-title fade-in">近期课程</div>
      <div class="upcoming-courses">
        <template v-if="upcomingCourses.length > 0">
          <div
            v-for="course in upcomingCourses"
            :key="course.id"
            class="course-card fade-in"
            @click="$router.push('/courses')"
          >
            <div class="course-left">
              <div class="course-date">
                <div class="date-month">{{ formatShortDate(course.date).month }}</div>
                <div class="date-day">{{ formatShortDate(course.date).day }}</div>
              </div>
            </div>
            <div class="course-right">
              <div class="course-row">
                <span class="coach-avatar">{{ course.coachAvatar }}</span>
                <span class="coach-name">{{ course.coachName }}</span>
                <span class="subject-tag">科{{ course.subject }}</span>
              </div>
              <div class="course-row mt-8">
                <van-icon name="clock-o" color="#646566" size="14" />
                <span class="course-time">{{ course.timeSlot.start }}-{{ course.timeSlot.end }}</span>
              </div>
              <div class="course-row mt-8">
                <van-icon name="location-o" color="#646566" size="14" />
                <span class="course-location">{{ course.location }}</span>
              </div>
            </div>
          </div>
        </template>
        <van-empty v-else description="暂无即将开始的课程" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { studentInfo, subjectProgress, courses } from '../mock'

const router = useRouter()

const StatusTag = {
  props: ['status', 'data'],
  template: `
    <span :class="'status-tag ' + statusClass">
      <template v-if="status === 'passed'">通过</template>
      <template v-else-if="status === 'training'">训练中</template>
      <template v-else>未开始</template>
    </span>
  `,
  computed: {
    statusClass() {
      return {
        passed: 'status-passed',
        training: 'status-training',
        not_started: 'status-pending',
      }[this.status]
    },
  },
}

const upcomingCourses = computed(() => {
  return courses
    .filter((c) => c.status === 'upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)
})

function formatShortDate(dateStr) {
  const d = new Date(dateStr)
  return {
    month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'][d.getMonth()],
    day: d.getDate(),
  }
}

function handleProgressClick(item) {
  if (item.status === 'training' && item.id === 2) {
    router.push('/booking')
  } else if (item.id === 2) {
    showToast('可前往约车页面预约训练')
  }
}

function showTip() {
  showToast('功能开发中，敬请期待')
}
</script>

<style scoped>
.home-page {
  padding-bottom: 0;
}

.hero-banner {
  position: relative;
  padding: 20px 16px 60px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 60%, #6bc0ff 100%);
  border-radius: 0 0 32px 32px;
}

.hero-bg::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-bg::after {
  content: '';
  position: absolute;
  bottom: -80px;
  left: -30px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.greeting {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.wave {
  font-size: 18px;
  animation: wave 1.5s ease infinite;
  display: inline-block;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(14deg); }
  40% { transform: rotate(-8deg); }
  60% { transform: rotate(14deg); }
  80% { transform: rotate(-4deg); }
}

.hero-subtitle {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.hero-stats {
  display: flex;
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.stat-unit {
  font-size: 12px;
  font-weight: 400;
  margin-left: 2px;
  opacity: 0.85;
}

.stat-label {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 4px 0;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.progress-card {
  border-radius: 16px;
  padding: 14px;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.progress-card:active {
  transform: scale(0.97);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-icon {
  font-size: 26px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.status-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.status-passed {
  background: rgba(255, 255, 255, 0.28);
}

.status-training {
  background: rgba(255, 255, 255, 0.28);
}

.status-pending {
  background: rgba(255, 255, 255, 0.25);
}

.card-body {
  margin-top: 10px;
}

.card-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.card-fullname {
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.85;
}

.card-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

.pass-info {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.95;
}

.training-bar {
  width: 100%;
}

.bar-bg {
  height: 6px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #fff;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.bar-text {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.9;
}

.pending-text {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.85;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.action-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 8px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.action-card:active {
  transform: scale(0.95);
}

.action-icon-wrap {
  width: 44px;
  height: 44px;
  margin: 0 auto;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.badge-tag {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #ee0a24;
  color: #fff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 500;
}

.action-name {
  margin-top: 8px;
  font-size: 12px;
  color: #323233;
  font-weight: 500;
}

.upcoming-courses {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.course-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.course-card:active {
  transform: scale(0.98);
}

.course-left {
  flex-shrink: 0;
}

.course-date {
  width: 56px;
  height: 64px;
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 100%);
  border-radius: 12px;
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
}

.date-month {
  font-size: 11px;
  opacity: 0.9;
}

.date-day {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.course-right {
  flex: 1;
  min-width: 0;
}

.course-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #323233;
}

.coach-avatar {
  font-size: 18px;
}

.coach-name {
  font-weight: 600;
  font-size: 14px;
}

.subject-tag {
  margin-left: 4px;
  background: rgba(25, 137, 250, 0.1);
  color: #1989fa;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.course-time,
.course-location {
  color: #646566;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
