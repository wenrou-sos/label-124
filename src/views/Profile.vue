<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="user-row">
          <div class="avatar-wrap">
            <span class="avatar">{{ studentInfo.avatar }}</span>
            <div class="online-dot"></div>
          </div>
          <div class="user-info">
            <div class="user-name">
              {{ studentInfo.name }}
              <span class="id-tag">ID: {{ studentInfo.id }}</span>
            </div>
            <div class="user-school">
              <van-icon name="shop-o" size="12" color="rgba(255,255,255,0.85)" />
              {{ studentInfo.school }}
            </div>
            <div class="enroll-date">入学：{{ studentInfo.enrollDate }}</div>
          </div>
          <div class="settings-btn" @click="showSettings">
            <van-icon name="setting-o" size="22" color="#fff" />
          </div>
        </div>

        <div class="stats-card">
          <div class="stat-row">
            <div class="col">
              <div class="num">{{ studentInfo.totalHours }}<span class="unit">h</span></div>
              <div class="lbl">总学时</div>
            </div>
            <div class="col">
              <div class="num used">{{ studentInfo.usedHours }}<span class="unit">h</span></div>
              <div class="lbl">已使用</div>
            </div>
            <div class="col">
              <div class="num remain">{{ studentInfo.remainingHours }}<span class="unit">h</span></div>
              <div class="lbl">剩余</div>
            </div>
            <div class="col">
              <div class="num credit">{{ studentInfo.credits }}</div>
              <div class="lbl">学分</div>
            </div>
          </div>
          <div class="progress-wrap">
            <div class="bar-bg">
              <div
                class="bar-fill"
                :style="{ width: `${(studentInfo.usedHours / studentInfo.totalHours) * 100}%` }"
              ></div>
            </div>
            <div class="bar-tip">已完成 {{ ((studentInfo.usedHours / studentInfo.totalHours) * 100).toFixed(0) }}% 学车进度</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-container" style="padding-top: 8px;">
      <div class="section-title fade-in">学习进度</div>
      <div class="progress-mini-list fade-in">
        <div
          v-for="item in subjectProgress"
          :key="item.id"
          class="mini-item"
        >
          <div class="mini-left">
            <span class="mini-icon">{{ item.icon }}</span>
            <div class="mini-info">
              <div class="mini-name">{{ item.name }} · {{ item.fullName }}</div>
              <template v-if="item.status === 'passed'">
                <div class="mini-sub text-success">已通过 · {{ item.score }}分</div>
              </template>
              <template v-else-if="item.status === 'training'">
                <div class="mini-bar-wrap">
                  <div class="mini-bar-bg">
                    <div
                      class="mini-bar-fill"
                      :style="{
                        width: `${(item.trainingHours / item.requiredHours) * 100}%`,
                        background: item.color,
                      }"
                    ></div>
                  </div>
                  <span class="mini-bar-text">{{ item.trainingHours }}/{{ item.requiredHours }}h</span>
                </div>
              </template>
              <template v-else>
                <div class="mini-sub text-muted">未开始</div>
              </template>
            </div>
          </div>
          <div class="mini-right">
            <span :class="'status ' + item.status">
              <template v-if="item.status === 'passed'">通过</template>
              <template v-else-if="item.status === 'training'">进行中</template>
              <template v-else>待学</template>
            </span>
          </div>
        </div>
      </div>

      <div class="section-title fade-in">快捷入口</div>
      <div class="entry-grid fade-in">
        <div class="entry-item" @click="$router.push('/courses')">
          <div class="entry-icon" style="background: linear-gradient(135deg, #1989fa 0%, #3da5ff 100%);">
            <van-icon name="orders-o" size="20" color="#fff" />
          </div>
          <span class="entry-name">我的课程</span>
        </div>
        <div class="entry-item" @click="$router.push('/simulator')">
          <div class="entry-icon" style="background: linear-gradient(135deg, #ff976a 0%, #ff7d00 100%);">
            <van-icon name="fire-o" size="20" color="#fff" />
            <span class="hot-tag">收费</span>
          </div>
          <span class="entry-name">考场模拟</span>
        </div>
        <div class="entry-item" @click="tip('考试成绩')">
          <div class="entry-icon" style="background: linear-gradient(135deg, #07c160 0%, #10b981 100%);">
            <van-icon name="medal-o" size="20" color="#fff" />
          </div>
          <span class="entry-name">考试成绩</span>
        </div>
        <div class="entry-item" @click="tip('学时记录')">
          <div class="entry-icon" style="background: linear-gradient(135deg, #7232dd 0%, #9c62ee 100%);">
            <van-icon name="clock-o" size="20" color="#fff" />
          </div>
          <span class="entry-name">学时记录</span>
        </div>
        <div class="entry-item" @click="tip('学车资料')">
          <div class="entry-icon" style="background: linear-gradient(135deg, #e14ffa 0%, #b84dff 100%);">
            <van-icon name="book-o" size="20" color="#fff" />
          </div>
          <span class="entry-name">学车资料</span>
        </div>
        <div class="entry-item" @click="tip('题库练习')">
          <div class="entry-icon" style="background: linear-gradient(135deg, #00bcd4 0%, #4dd0e1 100%);">
            <van-icon name="edit" size="20" color="#fff" />
          </div>
          <span class="entry-name">题库练习</span>
        </div>
        <div class="entry-item" @click="tip('消息中心')">
          <div class="entry-icon" style="background: linear-gradient(135deg, #ff5c8a 0%, #ff8aab 100%);">
            <van-icon name="chat-o" size="20" color="#fff" />
            <van-badge content="3" class="badge" />
          </div>
          <span class="entry-name">消息中心</span>
        </div>
        <div class="entry-item" @click="tip('帮助中心')">
          <div class="entry-icon" style="background: linear-gradient(135deg, #f5a623 0%, #ffc53d 100%);">
            <van-icon name="question-o" size="20" color="#fff" />
          </div>
          <span class="entry-name">帮助中心</span>
        </div>
      </div>

      <div class="section-title fade-in">最近评价</div>
      <div class="my-reviews fade-in">
        <template v-if="myReviews.length > 0">
          <div
            v-for="review in myReviews"
            :key="review.id"
            class="review-item"
          >
            <div class="review-top">
              <div class="review-left">
                <van-rate :model-value="getAvg(review)" :count="5" size="13" color="#ffb300" readonly />
                <span class="review-course">科{{ courses.find(c => c.id === review.courseId)?.subject || 2 }}</span>
              </div>
              <span class="review-date">{{ review.date }}</span>
            </div>
            <div v-if="review.tags && review.tags.length" class="review-tags">
              <span v-for="t in review.tags" :key="t" class="r-tag">{{ t }}</span>
            </div>
            <div v-if="review.content" class="review-content">{{ review.content }}</div>
          </div>
        </template>
        <van-empty v-else description="暂无评价记录" image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getStudentProfile, getStudentProgress, getCourseList } from '../api'

const studentInfo = ref({})
const subjectProgress = ref([])
const myReviews = ref([])
const courseList = ref([])

function getAvg(review) {
  const vals = Object.values(review.ratings || {})
  if (vals.length === 0) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function tip(name) {
  showToast(`${name}功能开发中`)
}

function showSettings() {
  showToast('设置功能开发中')
}

function getCourseSubject(courseId) {
  const course = courseList.value.find(c => c.id === courseId)
  return course ? course.subject : 2
}

async function loadData() {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    const [profile, progress, courses] = await Promise.all([
      getStudentProfile(),
      getStudentProgress(),
      getCourseList(),
    ])
    studentInfo.value = profile || {}
    subjectProgress.value = Array.isArray(progress) ? progress : []
    courseList.value = Array.isArray(courses) ? courses : []
  } catch (e) {
    console.error('加载个人中心数据失败', e)
  } finally {
    closeToast()
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.profile-header {
  position: relative;
  padding-bottom: 90px;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 50%, #6bc0ff 100%);
  border-radius: 0 0 32px 32px;
}

.header-bg::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -40px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.header-bg::after {
  content: '';
  position: absolute;
  bottom: -40px;
  left: -20px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 20px 16px 0;
}

.user-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 68px;
  height: 68px;
  background: #fff;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.online-dot {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 14px;
  height: 14px;
  background: #07c160;
  border-radius: 50%;
  border: 2px solid #fff;
}

.user-info {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
  color: #fff;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.id-tag {
  font-size: 10px;
  font-weight: 400;
  padding: 1px 7px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.user-school {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 4px;
}

.enroll-date {
  margin-top: 3px;
  font-size: 11px;
  opacity: 0.75;
}

.settings-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.2s;
}

.settings-btn:active {
  background: rgba(255, 255, 255, 0.25);
}

.stats-card {
  margin-top: 20px;
  background: #fff;
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 8px 24px rgba(25, 137, 250, 0.15);
  margin-left: -4px;
  margin-right: -4px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.col {
  text-align: center;
}

.num {
  font-size: 22px;
  font-weight: 700;
  color: #323233;
  line-height: 1.2;
}

.num.used { color: #1989fa; }
.num.remain { color: #07c160; }
.num.credit { color: #ff7d00; }

.num .unit {
  font-size: 11px;
  font-weight: 400;
  margin-left: 1px;
  opacity: 0.7;
}

.lbl {
  font-size: 11px;
  color: #969799;
  margin-top: 4px;
}

.progress-wrap {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f2f3f5;
}

.bar-bg {
  height: 8px;
  background: #f2f3f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1989fa 0%, #3da5ff 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.bar-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #646566;
  text-align: center;
}

.progress-mini-list {
  background: #fff;
  border-radius: 16px;
  padding: 6px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.mini-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f6f7;
}

.mini-item:last-child {
  border-bottom: none;
}

.mini-left {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.mini-icon {
  width: 40px;
  height: 40px;
  background: #f5f6f7;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.mini-info {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.mini-name {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.mini-sub {
  font-size: 12px;
  margin-top: 6px;
}

.mini-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.mini-bar-bg {
  flex: 1;
  max-width: 120px;
  height: 5px;
  background: #f2f3f5;
  border-radius: 3px;
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  border-radius: 3px;
}

.mini-bar-text {
  font-size: 11px;
  color: #646566;
  flex-shrink: 0;
}

.status {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 7px;
  font-weight: 500;
}

.status.passed {
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.status.training {
  background: rgba(25, 137, 250, 0.1);
  color: #1989fa;
}

.status.not_started {
  background: rgba(148, 149, 152, 0.1);
  color: #969799;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px 0;
  background: #fff;
  border-radius: 16px;
  padding: 16px 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.entry-item:active {
  transform: scale(0.93);
}

.entry-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.hot-tag {
  position: absolute;
  top: -4px;
  right: -6px;
  font-size: 9px;
  background: #ee0a24;
  color: #fff;
  padding: 1px 5px;
  border-radius: 7px;
  font-weight: 600;
}

.badge {
  position: absolute !important;
  top: -4px !important;
  right: -4px !important;
}

.entry-name {
  margin-top: 8px;
  font-size: 12px;
  color: #323233;
}

.my-reviews {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 30px;
}

.review-item {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.review-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-course {
  font-size: 11px;
  padding: 2px 7px;
  background: rgba(25, 137, 250, 0.1);
  color: #1989fa;
  border-radius: 5px;
  font-weight: 500;
}

.review-date {
  font-size: 11px;
  color: #969799;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 8px;
}

.r-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 179, 0, 0.1);
  color: #ff9500;
  border-radius: 4px;
}

.review-content {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}
</style>
