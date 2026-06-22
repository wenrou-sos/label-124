<template>
  <div class="booking-page page-container">
    <div class="page-title">预约练车</div>

    <van-notice-bar
      left-icon="info-o"
      background="linear-gradient(90deg, #e8f3ff 0%, #f0f7ff 100%)"
      color="#1989fa"
      text="预约后可在课程开始前2小时免费取消，超时取消将扣除相应学分"
    />

    <div class="section-title">选择教练</div>
    <div class="coach-list">
      <div
        v-for="coach in coaches"
        :key="coach.id"
        class="coach-card fade-in"
        :style="{ animationDelay: `${coach.id * 0.06}s` }"
        @click="$router.push(`/booking-detail/${coach.id}`)"
      >
        <div class="coach-avatar-wrap">
          <span class="coach-avatar">{{ coach.avatar }}</span>
          <span v-if="coach.subject === 2" class="coach-badge subject-2">科二</span>
          <span v-else class="coach-badge subject-3">科三</span>
        </div>
        <div class="coach-info">
          <div class="coach-name-row">
            <span class="coach-name">{{ coach.name }}</span>
            <span class="coach-gender">{{ coach.gender }} · {{ coach.age }}岁</span>
          </div>
          <div class="coach-rating-row">
            <van-rate
              :model-value="coach.rating"
              :count="5"
              size="14"
              color="#ffb300"
              void-color="#eee"
              readonly
            />
            <span class="rating-score">{{ coach.rating }}</span>
            <span class="rating-count">({{ coach.ratingCount }}条评价)</span>
          </div>
          <div class="coach-tags">
            <span v-for="tag in coach.tags" :key="tag" class="tag-item">{{ tag }}</span>
          </div>
          <div class="coach-meta">
            <div class="meta-item">
              <van-icon name="shield-o" size="12" />
              <span>通过率 {{ coach.passRate }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="car-o" size="12" />
              <span>{{ coach.carModel }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="clock-o" size="12" />
              <span>教龄{{ coach.experience }}年</span>
            </div>
          </div>
        </div>
        <div class="coach-action">
          <van-icon name="arrow" size="18" color="#969799" />
        </div>
      </div>
    </div>

    <div class="section-title">时段说明</div>
    <div class="legend-card">
      <div class="legend-row">
        <div class="legend-item">
          <span class="legend-dot available"></span>
          <span class="legend-label">可预约</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot full"></span>
          <span class="legend-label">已约满</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot rest"></span>
          <span class="legend-label">教练休息</span>
        </div>
      </div>
      <div class="legend-slots mt-12">
        <div class="slot-item">
          <span class="slot-badge">早</span>
          <span>08:00-12:00</span>
        </div>
        <div class="slot-item">
          <span class="slot-badge noon">中</span>
          <span>14:00-18:00</span>
        </div>
        <div class="slot-item">
          <span class="slot-badge night">晚</span>
          <span>18:00-20:00</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listCoaches } from '../api/coach'

const coaches = ref([])

onMounted(async () => {
  try {
    const data = await listCoaches()
    coaches.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('加载教练列表失败', e)
  }
})
</script>

<style scoped>
.coach-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coach-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 14px;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.coach-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.coach-avatar-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.coach-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #e8f3ff 0%, #f0f7ff 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.15);
}

.coach-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  color: #fff;
  font-weight: 500;
}

.subject-2 {
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 100%);
}

.subject-3 {
  background: linear-gradient(135deg, #7232dd 0%, #9c62ee 100%);
}

.coach-info {
  flex: 1;
  min-width: 0;
}

.coach-name-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.coach-name {
  font-size: 16px;
  font-weight: 700;
  color: #323233;
}

.coach-gender {
  font-size: 12px;
  color: #969799;
}

.coach-rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.rating-score {
  font-size: 13px;
  font-weight: 600;
  color: #ffb300;
}

.rating-count {
  font-size: 12px;
  color: #969799;
}

.coach-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag-item {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(25, 137, 250, 0.08);
  color: #1989fa;
  border-radius: 4px;
}

.coach-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #646566;
}

.coach-action {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.legend-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.legend-row {
  display: flex;
  justify-content: space-around;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #646566;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.legend-dot.available {
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
}

.legend-dot.full {
  background: linear-gradient(135deg, #dcdee0 0%, #ebedf0 100%);
}

.legend-dot.rest {
  background: linear-gradient(135deg, #ee0a24 0%, #ff4d4f 100%);
}

.legend-slots {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px dashed #ebedf0;
}

.slot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #646566;
}

.slot-badge {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ffd591 0%, #ffb84d 100%);
  color: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.slot-badge.noon {
  background: linear-gradient(135deg, #95de64 0%, #73d13d 100%);
}

.slot-badge.night {
  background: linear-gradient(135deg, #85a5ff 0%, #597ef7 100%);
}
</style>
