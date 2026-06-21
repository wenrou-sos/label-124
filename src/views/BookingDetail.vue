<template>
  <div class="booking-detail-page">
    <van-nav-bar
      title="预约时段"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="page-container">
      <div class="coach-header-card fade-in">
        <div class="header-left">
          <span class="coach-avatar">{{ coach.avatar }}</span>
        </div>
        <div class="header-info">
          <div class="coach-name-row">
            <span class="coach-name">{{ coach.name }}</span>
            <span class="subject-tag">科{{ coach.subject }}</span>
          </div>
          <div class="coach-rating">
            <van-rate :model-value="coach.rating" :count="5" size="14" color="#ffb300" readonly />
            <span class="rating-score">{{ coach.rating }}</span>
          </div>
          <div class="coach-car mt-8">
            <van-icon name="car-o" size="12" color="#646566" />
            <span>{{ coach.carModel }} · {{ coach.carNo }}</span>
          </div>
        </div>
        <div class="header-action" @click="$router.push(`/coach/${coach.id}`)">
          <van-icon name="info-o" size="18" color="#1989fa" />
        </div>
      </div>

      <div class="section-title">选择日期</div>
      <div class="date-scroll">
        <div
          v-for="(day, idx) in schedule"
          :key="day.date"
          class="date-item"
          :class="{ active: selectedDate === day.date, disabled: day.isRestDay, today: day.isToday }"
          @click="!day.isRestDay && (selectedDate = day.date)"
        >
          <div class="date-week">{{ day.isToday ? '今天' : day.weekday }}</div>
          <div class="date-day">{{ day.dayNum }}</div>
          <div class="date-month">{{ day.month }}月</div>
          <div v-if="day.isRestDay" class="date-rest">休息</div>
        </div>
      </div>

      <div class="section-title">选择时段</div>
      <div class="slots-wrapper" v-if="selectedDay">
        <template v-if="selectedDay.isRestDay">
          <div class="rest-day-tip">
            <van-icon name="warning-o" size="28" color="#ff976a" />
            <p class="tip-title">教练休息日</p>
            <p class="tip-desc">该教练本日休息，请选择其他日期或教练</p>
          </div>
        </template>
        <template v-else>
          <div class="period-section" v-for="period in periods" :key="period.key">
            <div class="period-title">
              <span class="period-badge" :style="{ background: period.color }">{{ period.label }}</span>
              <span class="period-name">{{ period.name }}</span>
            </div>
            <div class="slots-grid">
              <div
                v-for="slot in getSlotsByPeriod(period.key)"
                :key="slot.id"
                class="slot-card"
                :class="slot.status"
                @click="handleSlotClick(slot)"
              >
                <div class="slot-time">{{ slot.start }}-{{ slot.end }}</div>
                <template v-if="slot.status === 'available'">
                  <div class="slot-seats">剩余{{ slot.maxCount - slot.bookedCount }}/6</div>
                  <div class="slot-tag available-tag">可约</div>
                </template>
                <template v-else-if="slot.status === 'full'">
                  <div class="slot-seats">已约满</div>
                  <div class="slot-tag full-tag">已满</div>
                </template>
                <template v-else>
                  <div class="slot-seats">教练休息</div>
                  <div class="slot-tag rest-tag">休息</div>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <van-popup
      v-model:show="showMessagePopup"
      position="bottom"
      round
      :style="{ height: 'auto', maxHeight: '85%' }"
    >
      <div class="popup-header">
        <div class="popup-title">预约确认</div>
        <van-icon name="cross" size="22" color="#969799" @click="showMessagePopup = false" />
      </div>

      <div class="popup-body">
        <div class="summary-card">
          <div class="summary-row">
            <span class="label">教练</span>
            <span class="value">{{ coach.name }}</span>
          </div>
          <div class="summary-row">
            <span class="label">日期</span>
            <span class="value">{{ formatDateStr(selectedDate) }}</span>
          </div>
          <div class="summary-row">
            <span class="label">时段</span>
            <span class="value">{{ selectedSlot?.start }} - {{ selectedSlot?.end }}</span>
          </div>
          <div class="summary-row">
            <span class="label">地点</span>
            <span class="value">{{ coach.subject === 2 ? '阳光驾校训练场A区' : '市区道路训练场' }}</span>
          </div>
          <div class="summary-row">
            <span class="label">学时</span>
            <span class="value text-primary">2学时</span>
          </div>
        </div>

        <div class="message-section">
          <div class="section-label">想对教练说点什么？<span class="optional">（选填）</span></div>
          <div class="preset-tags">
            <span
              v-for="preset in MESSAGE_PRESETS"
              :key="preset"
              class="preset-tag"
              :class="{ active: selectedMessage === preset }"
              @click="togglePreset(preset)"
            >
              {{ preset }}
            </span>
          </div>
          <van-field
            v-model="customMessage"
            type="textarea"
            rows="3"
            placeholder="也可以自己输入备注信息..."
            maxlength="100"
            show-word-limit
          />
        </div>
      </div>

      <div class="popup-footer">
        <van-button
          block
          round
          size="large"
          class="gradient-btn"
          :loading="bookingLoading"
          @click="confirmBooking"
        >
          确认预约
        </van-button>
        <div class="footer-tip">
          <van-icon name="info-o" size="12" color="#969799" />
          课程开始前2小时可免费取消
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import {
  coaches,
  generateSchedule,
  addCourse,
  formatDate,
  hasBookedCourse,
  MESSAGE_PRESETS,
} from '../mock'

const route = useRoute()
const router = useRouter()

const coachId = Number(route.params.coachId)
const coach = computed(() => coaches.find((c) => c.id === coachId) || coaches[0])

const schedule = ref([])
const selectedDate = ref('')
const showMessagePopup = ref(false)
const selectedSlot = ref(null)
const selectedMessage = ref('')
const customMessage = ref('')
const bookingLoading = ref(false)

const periods = [
  { key: 'morning', label: '早', name: '上午时段', color: 'linear-gradient(135deg, #ffd591 0%, #ffb84d 100%)' },
  { key: 'afternoon', label: '中', name: '下午时段', color: 'linear-gradient(135deg, #95de64 0%, #73d13d 100%)' },
  { key: 'evening', label: '晚', name: '晚间时段', color: 'linear-gradient(135deg, #85a5ff 0%, #597ef7 100%)' },
]

const selectedDay = computed(() => schedule.value.find((d) => d.date === selectedDate.value))

function getSlotsByPeriod(period) {
  if (!selectedDay.value) return []
  return selectedDay.value.slots.filter((s) => s.period === period)
}

function formatDateStr(dateStr) {
  const d = new Date(dateStr)
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日 ${week}`
}

function handleSlotClick(slot) {
  if (slot.status === 'full') {
    showToast('该时段已约满，请选择其他时段')
    return
  }
  if (slot.status === 'rest') {
    showToast('该时段教练休息')
    return
  }
  if (hasBookedCourse(coachId, selectedDate.value, slot.id)) {
    showToast('您已预约该时段，请勿重复预约')
    return
  }
  selectedSlot.value = slot
  selectedMessage.value = ''
  customMessage.value = ''
  showMessagePopup.value = true
}

function togglePreset(preset) {
  if (selectedMessage.value === preset) {
    selectedMessage.value = ''
  } else {
    selectedMessage.value = preset
    customMessage.value = ''
  }
}

async function confirmBooking() {
  if (!selectedSlot.value) return
  bookingLoading.value = true
  await new Promise((r) => setTimeout(r, 800))

  const message = selectedMessage.value || customMessage.value
  const newCourse = addCourse({
    coachId: coach.value.id,
    coachName: coach.value.name,
    coachAvatar: coach.value.avatar,
    date: selectedDate.value,
    timeSlot: selectedSlot.value,
    location:
      coach.value.subject === 2 ? '阳光驾校训练场地A区 - 3号位' : '市区道路训练场',
    subject: coach.value.subject,
    message,
  })

  bookingLoading.value = false
  showMessagePopup.value = false

  if (newCourse) {
    const day = schedule.value.find((d) => d.date === selectedDate.value)
    if (day) {
      const slot = day.slots.find((s) => s.id === selectedSlot.value.id)
      if (slot) {
        slot.bookedCount = Math.min(slot.maxCount, slot.bookedCount + 1)
        if (slot.bookedCount >= slot.maxCount) {
          slot.status = 'full'
        }
      }
    }
    showSuccessToast('预约成功')
    setTimeout(() => {
      router.push('/courses')
    }, 1000)
  } else {
    showToast('预约失败，该时段可能已被预约')
  }
}

onMounted(() => {
  schedule.value = generateSchedule(coachId)
  const firstAvailable = schedule.value.find((d) => !d.isRestDay)
  if (firstAvailable) selectedDate.value = firstAvailable.date
})
</script>

<style scoped>
.booking-detail-page {
  padding-bottom: 20px;
}

.coach-header-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.05);
}

.header-left {
  flex-shrink: 0;
}

.coach-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #e8f3ff 0%, #f0f7ff 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.coach-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coach-name {
  font-size: 17px;
  font-weight: 700;
  color: #323233;
}

.subject-tag {
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 100%);
  color: #fff;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 6px;
  font-weight: 500;
}

.coach-rating {
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

.coach-car {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #646566;
}

.header-action {
  padding: 8px;
  cursor: pointer;
}

.date-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.date-scroll::-webkit-scrollbar {
  display: none;
}

.date-item {
  flex-shrink: 0;
  width: 62px;
  padding: 10px 6px;
  background: #fff;
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.date-item:active {
  transform: scale(0.95);
}

.date-item.active {
  border-color: #1989fa;
  background: linear-gradient(135deg, #e6f0ff 0%, #f0f7ff 100%);
}

.date-item.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.date-week {
  font-size: 12px;
  color: #646566;
}

.date-item.today .date-week {
  color: #1989fa;
  font-weight: 600;
}

.date-item.active .date-week {
  color: #1989fa;
  font-weight: 600;
}

.date-day {
  font-size: 20px;
  font-weight: 700;
  color: #323233;
  margin: 2px 0;
  line-height: 1.2;
}

.date-month {
  font-size: 10px;
  color: #969799;
}

.date-rest {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  background: #ee0a24;
  color: #fff;
  padding: 1px 5px;
  border-radius: 6px;
}

.rest-day-tip {
  background: #fff;
  border-radius: 14px;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.tip-title {
  margin: 12px 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.tip-desc {
  font-size: 13px;
  color: #646566;
  margin: 0;
}

.period-section {
  margin-bottom: 16px;
}

.period-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 0 2px;
}

.period-badge {
  width: 24px;
  height: 24px;
  color: #fff;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.period-name {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.slot-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 2px solid transparent;
}

.slot-card:active {
  transform: scale(0.96);
}

.slot-card.available:hover,
.slot-card.available:active {
  border-color: #07c160;
  background: #f2fffa;
}

.slot-card.full {
  background: #f7f8fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.slot-card.rest {
  background: #fff7f7;
  cursor: not-allowed;
  opacity: 0.7;
}

.slot-time {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.slot-seats {
  margin-top: 4px;
  font-size: 12px;
  color: #646566;
}

.slot-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 6px;
  font-weight: 500;
}

.available-tag {
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.full-tag {
  background: rgba(148, 149, 152, 0.1);
  color: #969799;
}

.rest-tag {
  background: rgba(238, 10, 36, 0.1);
  color: #ee0a24;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebedf0;
}

.popup-title {
  font-size: 17px;
  font-weight: 700;
  color: #323233;
}

.popup-body {
  padding: 16px 20px;
  max-height: 50vh;
  overflow-y: auto;
}

.summary-card {
  background: linear-gradient(135deg, #f5faff 0%, #eef7ff 100%);
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid #d6e8ff;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.summary-row .label {
  color: #646566;
}

.summary-row .value {
  color: #323233;
  font-weight: 500;
  max-width: 60%;
  text-align: right;
}

.message-section {
  margin-top: 18px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 10px;
}

.optional {
  font-weight: 400;
  font-size: 12px;
  color: #969799;
}

.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.preset-tag {
  padding: 6px 12px;
  background: #f2f3f5;
  border-radius: 16px;
  font-size: 13px;
  color: #646566;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.preset-tag:active {
  transform: scale(0.95);
}

.preset-tag.active {
  background: rgba(25, 137, 250, 0.1);
  color: #1989fa;
  border-color: #1989fa;
}

.popup-footer {
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  border-top: 1px solid #ebedf0;
}

.footer-tip {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: #969799;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
