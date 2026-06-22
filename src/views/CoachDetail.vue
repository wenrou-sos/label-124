<template>
  <div class="coach-detail-page">
    <van-nav-bar
      title="教练详情"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="page-container" v-if="coach">
      <div class="profile-header fade-in">
        <div class="header-bg"></div>
        <div class="profile-content">
          <div class="avatar-wrap">
            <span class="coach-avatar">{{ coach.avatar }}</span>
          </div>
          <div class="profile-info">
            <div class="name-row">
              <span class="coach-name">{{ coach.name }}</span>
              <span class="coach-gender">{{ coach.gender }} · {{ coach.age }}岁</span>
              <span class="subject-tag s{{ coach.subject }}">科{{ coach.subject }}</span>
            </div>
            <div class="rating-row">
              <van-rate :model-value="coach.rating" :count="5" size="16" color="#ffb300" readonly />
              <span class="rating-score">{{ coach.rating }}</span>
              <span class="rating-count">{{ coach.ratingCount }}条评价</span>
            </div>
            <div class="tags-row">
              <span v-for="tag in coach.tags" :key="tag" class="coach-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-grid fade-in stagger-1">
        <div class="stat-item">
          <div class="stat-icon pass">
            <van-icon name="shield-o" size="20" color="#07c160" />
          </div>
          <div class="stat-value">{{ coach.passRate }}</div>
          <div class="stat-label">通过率</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon time">
            <van-icon name="clock-o" size="20" color="#1989fa" />
          </div>
          <div class="stat-value">{{ coach.experience }}年</div>
          <div class="stat-label">教龄</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon stu">
            <van-icon name="friends-o" size="20" color="#7232dd" />
          </div>
          <div class="stat-value">{{ coach.students }}</div>
          <div class="stat-label">学员</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon car">
            <van-icon name="car-o" size="20" color="#ff976a" />
          </div>
          <div class="stat-value car-val">{{ coach.carModel.slice(0, 4) }}</div>
          <div class="stat-label">车型</div>
        </div>
      </div>

      <div class="section-title fade-in stagger-2">综合评分</div>
      <div class="rating-detail-card fade-in stagger-2">
        <div class="rating-main">
          <div class="main-score">{{ coach.rating.toFixed(1) }}</div>
          <div class="main-stars">
            <van-rate :model-value="coach.rating" :count="5" size="20" color="#ffb300" readonly />
          </div>
          <div class="main-sub">平台综合统计</div>
        </div>
        <div class="rating-dims">
          <div v-for="dim in ratingDims" :key="dim.key" class="dim-row">
            <span class="dim-label">{{ dim.label }}</span>
            <div class="dim-bar-bg">
              <div
                class="dim-bar-fill"
                :style="{ width: `${(coach.ratings[dim.key] / 5) * 100}%` }"
              ></div>
            </div>
            <span class="dim-score">{{ coach.ratings[dim.key].toFixed(1) }}</span>
          </div>
        </div>
      </div>

      <div class="section-title fade-in stagger-3">车辆信息</div>
      <div class="car-card fade-in stagger-3">
        <div class="car-row">
          <span class="car-label">车型</span>
          <span class="car-value">{{ coach.carModel }}</span>
        </div>
        <div class="car-row">
          <span class="car-label">车牌号</span>
          <span class="car-value mono">{{ coach.carNo }}</span>
        </div>
        <div class="car-row">
          <span class="car-label">联系电话</span>
          <span class="car-value">{{ coach.phone }}</span>
        </div>
      </div>

      <div class="section-title fade-in stagger-4">学员评价 ({{ reviewList.length }})</div>
      <div class="review-list">
        <div
          v-for="review in reviewList"
          :key="review.id"
          class="review-card fade-in"
        >
          <div class="review-header">
            <div class="reviewer-info">
              <span class="reviewer-avatar">{{ review.avatar }}</span>
              <div>
                <div class="reviewer-name">{{ review.studentName }}</div>
                <div class="review-date">{{ review.date }}</div>
              </div>
            </div>
            <van-rate :model-value="getAvgRating(review)" :count="5" size="13" color="#ffb300" readonly />
          </div>
          <div class="review-tags" v-if="review.tags && review.tags.length">
            <span v-for="t in review.tags" :key="t" class="r-tag">{{ t }}</span>
          </div>
          <div class="review-content">{{ review.content }}</div>
        </div>
        <van-empty v-if="reviewList.length === 0" description="暂无评价" />
      </div>
    </div>

    <div class="bottom-bar">
      <van-button
        block
        round
        size="large"
        class="gradient-btn"
        @click="$router.push(`/booking-detail/${coachId}`)"
      >
        立即预约
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCoachDetail, getReviewsByCoach } from '../api'
import { showLoadingToast, closeToast } from 'vant'

const route = useRoute()
const router = useRouter()
const coachId = Number(route.params.coachId)

const coach = ref(null)
const reviewList = ref([])

const ratingDims = [
  { key: 'attitude', label: '教学态度' },
  { key: 'professionalism', label: '专业程度' },
  { key: 'patience', label: '耐心程度' },
  { key: 'punctuality', label: '守时程度' },
]

function getAvgRating(review) {
  const vals = Object.values(review.ratings)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function goBooking() {
  router.push(`/booking-detail/${coachId}`)
}

async function loadData() {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    const [coachData, reviewsData] = await Promise.all([
      getCoachDetail(coachId),
      getReviewsByCoach(coachId),
    ])
    coach.value = coachData
    reviewList.value = Array.isArray(reviewsData) ? reviewsData : []
  } catch (e) {
    console.error('加载教练详情失败', e)
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
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 60%, #6bc0ff 100%);
}

.header-bg::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.profile-content {
  position: relative;
  z-index: 1;
  padding: 24px 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.avatar-wrap {
  flex-shrink: 0;
  padding: 4px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 22px;
  backdrop-filter: blur(6px);
}

.coach-avatar {
  width: 72px;
  height: 72px;
  background: #fff;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-info {
  flex: 1;
  min-width: 0;
  color: #fff;
  padding-top: 4px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.coach-name {
  font-size: 20px;
  font-weight: 700;
}

.coach-gender {
  font-size: 12px;
  opacity: 0.85;
}

.subject-tag {
  font-size: 10px;
  padding: 1px 7px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.subject-tag.s3 {
  background: rgba(255, 255, 255, 0.25);
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.rating-score {
  font-size: 15px;
  font-weight: 600;
}

.rating-count {
  font-size: 12px;
  opacity: 0.8;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.coach-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 4px;
}

.stat-item {
  background: #fff;
  border-radius: 14px;
  padding: 14px 6px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 6px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.pass { background: rgba(7, 193, 96, 0.1); }
.stat-icon.time { background: rgba(25, 137, 250, 0.1); }
.stat-icon.stu { background: rgba(114, 50, 221, 0.1); }
.stat-icon.car { background: rgba(255, 151, 106, 0.1); }

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #323233;
  line-height: 1.2;
}

.car-val {
  font-size: 13px;
}

.stat-label {
  font-size: 11px;
  color: #969799;
  margin-top: 2px;
}

.rating-detail-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.rating-main {
  width: 100px;
  flex-shrink: 0;
  text-align: center;
  padding-right: 16px;
  border-right: 1px dashed #ebedf0;
}

.main-score {
  font-size: 40px;
  font-weight: 700;
  color: #ffb300;
  line-height: 1;
}

.main-stars {
  margin: 6px 0 4px;
}

.main-sub {
  font-size: 11px;
  color: #969799;
}

.rating-dims {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.dim-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.dim-label {
  width: 56px;
  color: #646566;
  flex-shrink: 0;
}

.dim-bar-bg {
  flex: 1;
  height: 6px;
  background: #f2f3f5;
  border-radius: 3px;
  overflow: hidden;
}

.dim-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd666 0%, #ffb300 100%);
  border-radius: 3px;
}

.dim-score {
  width: 32px;
  text-align: right;
  font-weight: 600;
  color: #ffb300;
}

.car-card {
  background: #fff;
  border-radius: 16px;
  padding: 6px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.car-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f6f7;
}

.car-row:last-child {
  border-bottom: none;
}

.car-label {
  font-size: 14px;
  color: #646566;
}

.car-value {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
}

.car-value.mono {
  font-family: 'SF Mono', Menlo, monospace;
  letter-spacing: 0.5px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 80px;
}

.review-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.reviewer-info {
  display: flex;
  gap: 10px;
}

.reviewer-avatar {
  width: 36px;
  height: 36px;
  background: #f5f6f7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.review-date {
  font-size: 11px;
  color: #969799;
  margin-top: 2px;
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

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent 0%, rgba(245, 247, 250, 0.95) 30%);
}
</style>
