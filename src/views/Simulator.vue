<template>
  <div class="simulator-page">
    <van-nav-bar
      title="考场模拟预约"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="page-container">
      <div class="notice-bar-wrap">
        <van-notice-bar
          left-icon="warning-o"
          background="linear-gradient(90deg, #fff3e8 0%, #fffaf2 100%)"
          color="#ff7d00"
          :scrollable="false"
        >
          <template #default>
            <span style="font-weight: 500;">额外收费 · 不包含在学时卡内</span>
          </template>
        </van-notice-bar>
      </div>

      <div class="hero-card fade-in">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="hero-title">{{ simulatorInfo.name }}</div>
          <div class="hero-desc">{{ simulatorInfo.description }}</div>
          <div class="hero-meta">
            <div class="meta-item">
              <van-icon name="clock-o" size="14" color="#fff" />
              <span>{{ simulatorInfo.duration }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="location-o" size="14" color="#fff" />
              <span>{{ simulatorInfo.location }}</span>
            </div>
          </div>
          <div class="price-row">
            <span class="price-label">价格</span>
            <span class="price-value">
              <span class="currency">¥</span>
              180
              <span class="price-unit">起/次</span>
            </span>
          </div>
        </div>
      </div>

      <div class="section-title fade-in">选择日期和时段</div>
      <div class="date-scroll fade-in">
        <div
          v-for="day in simulatorSessions"
          :key="day.id"
          class="date-item"
          :class="{ active: selectedSession === day.id }"
          @click="selectedSession = day.id"
        >
          <div class="date-week">{{ formatShort(day.date).week }}</div>
          <div class="date-day">{{ formatShort(day.date).day }}</div>
          <div class="date-month">{{ formatShort(day.date).month }}月</div>
        </div>
      </div>

      <div class="slots-section fade-in" v-if="currentSession">
        <div class="slots-grid">
          <div
            v-for="slot in currentSession.slots"
            :key="slot.id"
            class="sim-slot-card"
            :class="slot.status"
            @click="handleSlotClick(slot)"
          >
            <div class="slot-time">{{ slot.start }}-{{ slot.end }}</div>
            <div class="slot-price">
              <template v-if="slot.status === 'available'">
                <span class="price">¥{{ slot.price }}</span>
              </template>
              <template v-else-if="slot.status === 'full'">
                <span class="sold-out">已约满</span>
              </template>
              <template v-else>
                <span class="rest">休息</span>
              </template>
            </div>
            <div class="slot-status-tag" :class="'tag-' + slot.status">
              <template v-if="slot.status === 'available'">可预约</template>
              <template v-else-if="slot.status === 'full'">已满</template>
              <template v-else>休息中</template>
            </div>
          </div>
        </div>
      </div>

      <div class="section-title fade-in">注意事项</div>
      <div class="notice-card fade-in">
        <div
          v-for="(item, idx) in simulatorInfo.notice"
          :key="idx"
          class="notice-item"
        >
          <span class="notice-num">{{ idx + 1 }}</span>
          <span class="notice-text">{{ item }}</span>
        </div>
      </div>

      <div class="section-title fade-in">常见问题</div>
      <van-cell-group inset class="faq-group fade-in">
        <van-cell
          v-for="(faq, idx) in simulatorInfo.faq"
          :key="idx"
          :title="faq.q"
          is-link
          size="large"
          @click="toggleFaq(idx)"
        >
          <template #value>
            <van-icon
              :name="openFaq === idx ? 'arrow-up' : 'arrow-down'"
              size="14"
              color="#969799"
            />
          </template>
        </van-cell>
        <div v-if="openFaq !== null" class="faq-answer">
          {{ simulatorInfo.faq[openFaq].a }}
        </div>
      </van-cell-group>

      <div class="section-title fade-in">我的预约记录</div>
      <div class="booked-list fade-in">
        <div
          v-for="booked in bookedSimulators"
          :key="booked.id"
          class="booked-card"
        >
          <div class="booked-left">
            <div class="booked-icon">
              <van-icon name="fire-o" size="20" color="#ff7d00" />
            </div>
          </div>
          <div class="booked-right">
            <div class="booked-row">
              <span class="booked-date">{{ formatBookedDate(booked.date) }}</span>
              <span :class="'booked-status ' + booked.status">
                {{ booked.status === 'completed' ? '已完成' : '待使用' }}
              </span>
            </div>
            <div class="booked-row mt-8">
              <van-icon name="clock-o" size="12" color="#646566" />
              <span>{{ booked.slot.start }}-{{ booked.slot.end }}</span>
            </div>
            <div class="booked-row mt-8">
              <van-icon name="gold-coin-o" size="12" color="#ffb300" />
              <span class="fee">¥{{ booked.price }}</span>
            </div>
          </div>
        </div>
        <van-empty v-if="bookedSimulators.length === 0" description="暂无预约记录" image-size="80" />
      </div>
    </div>

    <van-popup
      v-model:show="showConfirm"
      position="bottom"
      round
      :style="{ height: 'auto' }"
    >
      <div class="confirm-header">
        <div class="confirm-title">确认预约</div>
        <van-icon name="cross" size="22" color="#969799" @click="showConfirm = false" />
      </div>
      <div class="confirm-body" v-if="selectedSlot">
        <div class="summary-grid">
          <div class="sum-row">
            <span class="sum-label">项目</span>
            <span class="sum-value">{{ simulatorInfo.name }}</span>
          </div>
          <div class="sum-row">
            <span class="sum-label">日期</span>
            <span class="sum-value">{{ formatFullDate(currentSession?.date) }}</span>
          </div>
          <div class="sum-row">
            <span class="sum-label">时段</span>
            <span class="sum-value">{{ selectedSlot.start }} - {{ selectedSlot.end }}</span>
          </div>
          <div class="sum-row">
            <span class="sum-label">时长</span>
            <span class="sum-value">2小时</span>
          </div>
          <div class="sum-row">
            <span class="sum-label">地点</span>
            <span class="sum-value">{{ simulatorInfo.location }}</span>
          </div>
          <div class="sum-row price">
            <span class="sum-label">费用</span>
            <span class="sum-value price-val">¥{{ selectedSlot.price }}</span>
          </div>
        </div>

        <div class="pay-tip">
          <van-icon name="info-o" size="13" color="#969799" />
          <span>预约成功后费用立即扣除，开始前24小时可免费改期一次</span>
        </div>
      </div>
      <div class="confirm-footer">
        <van-button
          block
          round
          size="large"
          type="warning"
          color="linear-gradient(135deg, #ff976a 0%, #ff7d00 100%)"
          :loading="confirmLoading"
          @click="doConfirm"
        >
          支付 ¥{{ selectedSlot?.price || 0 }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showSuccessToast, showToast } from 'vant'
import {
  simulatorInfo,
  simulatorSessions,
  bookedSimulators,
  addBookedSimulator,
} from '../mock'

const selectedSession = ref(simulatorSessions[0]?.id || '')
const openFaq = ref(null)
const showConfirm = ref(false)
const selectedSlot = ref(null)
const confirmLoading = ref(false)

const currentSession = computed(() => {
  return simulatorSessions.find((s) => s.id === selectedSession.value)
})

function formatShort(dateStr) {
  const d = new Date(dateStr)
  const dayIdx = d.getDay()
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return {
    week: weeks[dayIdx],
    day: d.getDate(),
    month: d.getMonth() + 1,
  }
}

function formatFullDate(dateStr) {
  const d = new Date(dateStr)
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weeks[d.getDay()]}`
}

function formatBookedDate(dateStr) {
  const d = new Date(dateStr)
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}/${d.getDate()} ${weeks[d.getDay()]}`
}

function toggleFaq(idx) {
  openFaq.value = openFaq.value === idx ? null : idx
}

function handleSlotClick(slot) {
  if (slot.status === 'full') {
    showToast('该时段已约满')
    return
  }
  if (slot.status === 'rest') {
    showToast('该时段不开放')
    return
  }
  selectedSlot.value = slot
  showConfirm.value = true
}

async function doConfirm() {
  if (!selectedSlot.value || !currentSession.value) return
  confirmLoading.value = true
  await new Promise((r) => setTimeout(r, 900))
  addBookedSimulator({
    date: currentSession.value.date,
    slot: { start: selectedSlot.value.start, end: selectedSlot.value.end },
    price: selectedSlot.value.price,
  })
  confirmLoading.value = false
  showConfirm.value = false
  showSuccessToast('预约支付成功')
}
</script>

<style scoped>
.simulator-page {
  padding-bottom: 20px;
}

.notice-bar-wrap {
  margin: 0 -12px 16px;
}

.hero-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  padding: 24px 20px;
  margin-bottom: 4px;
  box-shadow: 0 6px 20px rgba(255, 125, 0, 0.2);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #ff976a 0%, #ff7d00 60%, #ffb84d 100%);
}

.hero-bg::after {
  content: '';
  position: absolute;
  top: -60%;
  right: -30%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-content {
  position: relative;
  z-index: 1;
  color: #fff;
}

.hero-title {
  font-size: 20px;
  font-weight: 700;
}

.hero-desc {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.9;
}

.hero-meta {
  display: flex;
  gap: 16px;
  margin-top: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  opacity: 0.92;
}

.price-row {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.price-label {
  font-size: 13px;
  opacity: 0.9;
}

.price-value {
  font-size: 30px;
  font-weight: 700;
}

.currency {
  font-size: 16px;
  margin-right: 2px;
}

.price-unit {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.9;
}

.date-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px 10px;
  scrollbar-width: none;
}

.date-scroll::-webkit-scrollbar { display: none; }

.date-item {
  flex-shrink: 0;
  width: 58px;
  padding: 10px 6px;
  background: #fff;
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.date-item:active { transform: scale(0.95); }

.date-item.active {
  border-color: #ff7d00;
  background: linear-gradient(135deg, #fff7ef 0%, #fffaf2 100%);
}

.date-week {
  font-size: 11px;
  color: #646566;
}

.date-item.active .date-week {
  color: #ff7d00;
  font-weight: 600;
}

.date-day {
  font-size: 20px;
  font-weight: 700;
  color: #323233;
  line-height: 1.2;
  margin: 2px 0;
}

.date-month {
  font-size: 10px;
  color: #969799;
}

.slots-section {
  margin-bottom: 8px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.sim-slot-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 2px solid transparent;
}

.sim-slot-card:active { transform: scale(0.96); }

.sim-slot-card.available:active {
  border-color: #ff7d00;
  background: #fffaf2;
}

.sim-slot-card.full,
.sim-slot-card.rest {
  opacity: 0.65;
  cursor: not-allowed;
  background: #f7f8fa;
}

.slot-time {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.slot-price {
  margin-top: 6px;
}

.slot-price .price {
  font-size: 18px;
  font-weight: 700;
  color: #ff7d00;
}

.slot-price .sold-out,
.slot-price .rest {
  font-size: 13px;
  color: #969799;
  font-weight: 500;
}

.slot-status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.tag-available {
  background: rgba(255, 125, 0, 0.1);
  color: #ff7d00;
}

.tag-full {
  background: rgba(148, 149, 152, 0.1);
  color: #969799;
}

.tag-rest {
  background: rgba(238, 10, 36, 0.08);
  color: #ee0a24;
}

.notice-card {
  background: #fff;
  border-radius: 16px;
  padding: 8px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.notice-item {
  display: flex;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f6f7;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #ff976a 0%, #ff7d00 100%);
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.notice-text {
  flex: 1;
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
  padding-top: 1px;
}

.faq-group {
  margin: 0;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.faq-answer {
  background: #fffaf2;
  padding: 12px 16px;
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
  border-top: 1px solid #f5f6f7;
}

.booked-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 20px;
}

.booked-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.booked-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 125, 0, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.booked-right {
  flex: 1;
  min-width: 0;
}

.booked-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #646566;
}

.booked-date {
  font-weight: 600;
  color: #323233;
  font-size: 14px;
}

.booked-status {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.booked-status.upcoming {
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.booked-status.completed {
  background: rgba(148, 149, 152, 0.1);
  color: #969799;
}

.fee {
  color: #ff7d00;
  font-weight: 600;
}

.confirm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebedf0;
}

.confirm-title {
  font-size: 17px;
  font-weight: 700;
  color: #323233;
}

.confirm-body {
  padding: 16px 20px;
}

.summary-grid {
  background: linear-gradient(135deg, #fffaf2 0%, #fff5e6 100%);
  border-radius: 14px;
  padding: 12px 16px;
  border: 1px solid #ffddb3;
}

.sum-row {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 14px;
}

.sum-label {
  color: #646566;
}

.sum-value {
  color: #323233;
  font-weight: 500;
  max-width: 60%;
  text-align: right;
}

.sum-row.price {
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px dashed #ffddb3;
}

.price-val {
  font-size: 18px !important;
  color: #ff7d00 !important;
  font-weight: 700 !important;
}

.pay-tip {
  margin-top: 14px;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
}

.confirm-footer {
  padding: 14px 20px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid #ebedf0;
}
</style>
