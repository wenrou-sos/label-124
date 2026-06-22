<template>
  <div class="booking-page">
    <van-nav-bar title="预约练车" fixed placeholder />

    <van-notice-bar
      left-icon="warning-o"
      text="取消规则：课程开始前2小时可免费取消，超时需扣50学分"
      color="#f56c6c"
      background="#fef0f0"
    />

    <div class="coach-list">
      <div
        v-for="coach in coachList"
        :key="coach.id"
        class="coach-card"
        @click="goToDetail(coach.id)"
      >
        <div class="coach-avatar">{{ coach.avatar }}</div>
        <div class="coach-info">
          <div class="coach-name">
            {{ coach.name }}
            <span class="subject-tag" :class="'subject-' + coach.subject">
              科{{ coach.subject }}
            </span>
          </div>
          <div class="coach-stats">
            <span class="rating">
              <van-rate v-model="dumRating" readonly size="12" color="#ff976a" />
              {{ coach.rating }}分
            </span>
            <span class="pass-rate">通过率 {{ coach.passRate }}</span>
            <span class="students">{{ coach.students }}人</span>
          </div>
          <div class="coach-detail">
            <span>{{ coach.carModel }}</span>
            <span>{{ coach.experience }}年教龄</span>
          </div>
          <div class="coach-tags">
            <span v-for="tag in coach.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        <van-button type="primary" size="small" round>
          去预约
        </van-button>
      </div>
    </div>

    <div class="legend-section">
      <div class="legend-title">时段状态说明</div>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-dot available"></span>
          <span>可约</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot full"></span>
          <span>约满</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot rest"></span>
          <span>休息</span>
        </div>
      </div>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-time morning"></span>
          <span>上午</span>
        </div>
        <div class="legend-item">
          <span class="legend-time afternoon"></span>
          <span>下午</span>
        </div>
        <div class="legend-item">
          <span class="legend-time evening"></span>
          <span>晚上</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCoachList } from '../api'
import { showLoadingToast, closeToast } from 'vant'

const router = useRouter()
const coachList = ref([])
const dumRating = ref(5)

function goToDetail(coachId) {
  router.push(`/booking-detail/${coachId}`)
}

async function loadCoaches() {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    const data = await getCoachList()
    coachList.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('加载教练列表失败', e)
  } finally {
    closeToast()
  }
}

onMounted(() => {
  loadCoaches()
})
</script>

<style scoped>
.booking-page {
  padding-bottom: 20px;
}

.coach-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coach-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.coach-avatar {
  font-size: 44px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
  border-radius: 50%;
  flex-shrink: 0;
}

.coach-info {
  flex: 1;
  min-width: 0;
}

.coach-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.subject-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: normal;
}

.subject-2 {
  background: #e8f3ff;
  color: #1989fa;
}

.subject-3 {
  background: #fff3e0;
  color: #ff976a;
}

.coach-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #969799;
  margin-bottom: 6px;
}

.rating {
  color: #ff976a;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.coach-detail {
  font-size: 12px;
  color: #646566;
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
}

.coach-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  background: #f7f8fa;
  color: #969799;
  border-radius: 10px;
}

.legend-section {
  margin: 20px 16px 0;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #646566;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.available {
  background: #07c160;
}

.legend-dot.full {
  background: #dcdee0;
}

.legend-dot.rest {
  background: #ee0a24;
}

.legend-time {
  width: 16px;
  height: 12px;
  border-radius: 2px;
}

.legend-time.morning {
  background: #ff976a;
}

.legend-time.afternoon {
  background: #1989fa;
}

.legend-time.evening {
  background: #7232dd;
}
</style>
