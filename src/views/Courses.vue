<template>
  <div class="courses-page page-container">
    <div class="page-title">我的课程</div>

    <div class="tab-header">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span>{{ tab.label }}</span>
        <span v-if="getCountByTab(tab.key) > 0" class="tab-badge">
          {{ getCountByTab(tab.key) }}
        </span>
      </div>
    </div>

    <div class="course-list">
      <template v-if="filteredCourses.length > 0">
        <div
          v-for="(course, idx) in filteredCourses"
          :key="course.id"
          class="course-card fade-in"
          :style="{ animationDelay: `${idx * 0.05}s` }"
        >
          <div class="card-top">
            <div class="date-block">
              <div class="date-month">{{ formatDatePart(course.date).month }}</div>
              <div class="date-day">{{ formatDatePart(course.date).day }}</div>
              <div class="date-week">{{ course.status === 'upcoming' ? formatDatePart(course.date).week : formatDatePart(course.date).week }}</div>
            </div>
            <div class="info-block">
              <div class="info-row">
                <div class="coach-info">
                  <span class="coach-avatar">{{ course.coachAvatar }}</span>
                  <span class="coach-name">{{ course.coachName }}</span>
                  <span class="subject-tag" :class="'s' + course.subject">科{{ course.subject }}</span>
                </div>
                <StatusBadge :status="course.status" />
              </div>
              <div class="info-row mt-8">
                <van-icon name="clock-o" size="13" color="#646566" />
                <span class="info-text">{{ course.timeSlot.start }}-{{ course.timeSlot.end }}</span>
                <span class="info-divider">·</span>
                <span class="info-text">{{ course.hours }}学时</span>
              </div>
              <div class="info-row mt-8">
                <van-icon name="location-o" size="13" color="#646566" />
                <span class="info-text ellipsis">{{ course.location }}</span>
              </div>
              <div v-if="course.message" class="info-row mt-8">
                <van-icon name="chat-o" size="13" color="#1989fa" />
                <span class="info-text message-text">"{{ course.message }}"</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <template v-if="course.status === 'upcoming'">
              <van-button
                size="small"
                plain
                round
                @click="handleCall(course)"
              >
                <van-icon name="phone-o" size="13" /> 联系教练
              </van-button>
              <div class="footer-actions">
                <van-button
                  size="small"
                  plain
                  round
                  color="#ee0a24"
                  @click="handleCancel(course)"
                >
                  取消预约
                </van-button>
              </div>
            </template>

            <template v-else-if="course.status === 'completed'">
              <div v-if="course.cancelReason" class="cancel-reason">
                <van-icon name="info-o" size="12" color="#969799" />
                <span>取消原因：{{ course.cancelReason }}</span>
              </div>
              <div v-else class="flex-between" style="width: 100%">
                <div class="completion-info">
                  <van-icon name="clock-o" size="12" color="#969799" />
                  <span>预约于 {{ course.createdAt }}</span>
                </div>
                <template v-if="!course.reviewed">
                  <van-button
                    size="small"
                    round
                    class="gradient-btn"
                    @click="$router.push(`/review/${course.id}`)"
                  >
                    去评价
                  </van-button>
                </template>
                <template v-else>
                  <span class="reviewed-tag">
                    <van-icon name="description" size="12" /> 已评价
                  </span>
                </template>
              </div>
            </template>

            <template v-else-if="course.status === 'cancelled'">
              <div class="cancel-reason" style="width: 100%">
                <van-icon name="info-o" size="12" color="#ee0a24" />
                <span>取消于 {{ course.cancelledAt }} · {{ course.cancelReason }}</span>
              </div>
            </template>
          </div>
        </div>
      </template>
      <van-empty v-else :description="emptyText" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog, showToast, showConfirmDialog } from 'vant'
import { listCourses, cancelCourse as apiCancelCourse } from '../api/course'
import { getCoach } from '../api/coach'
import { getMeta } from '../api/common'

const router = useRouter()

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'upcoming', label: '待上课' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]

const activeTab = ref('all')
const courses = ref([])
const cancelWindowHours = ref(2)

async function loadCourses() {
  try {
    const status = activeTab.value === 'all' ? undefined : activeTab.value
    const data = await listCourses(status)
    courses.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('加载课程列表失败', e)
  }
}

watch(activeTab, loadCourses)

const StatusBadge = {
  props: ['status'],
  template: `
    <span :class="'status-badge ' + status">
      <template v-if="status === 'upcoming'">待上课</template>
      <template v-else-if="status === 'completed'">已完成</template>
      <template v-else-if="status === 'cancelled'">已取消</template>
    </span>
  `,
}

const filteredCourses = computed(() => {
  let list = [...courses.value]
  return list.sort((a, b) => {
    const priority = { upcoming: 0, completed: 1, cancelled: 2 }
    if (priority[a.status] !== priority[b.status]) {
      return priority[a.status] - priority[b.status]
    }
    return new Date(b.date) - new Date(a.date)
  })
})

const emptyText = computed(() => {
  const map = {
    all: '暂无课程记录，快去约车吧',
    upcoming: '没有待上的课程',
    completed: '还没有完成的课程',
    cancelled: '没有取消的课程',
  }
  return map[activeTab.value]
})

function getCountByTab(key) {
  if (key === 'all') return courses.value.length
  return courses.value.filter((c) => c.status === key).length
}

function formatDatePart(dateStr) {
  const d = new Date(dateStr)
  return {
    month: `${d.getMonth() + 1}月`,
    day: d.getDate(),
    week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()],
  }
}

function isWithinCancelWindow(dateStr, timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const courseTime = new Date(dateStr)
  courseTime.setHours(h, m, 0, 0)
  const now = new Date()
  const diff = courseTime.getTime() - now.getTime()
  const hoursMs = cancelWindowHours.value * 60 * 60 * 1000
  return diff >= hoursMs
}

async function handleCall(course) {
  let phone = course.coachPhone
  if (!phone) {
    try {
      const coach = await getCoach(course.coachId)
      phone = coach ? coach.phone : '暂无电话'
    } catch (e) {
      phone = '暂无电话'
    }
  }
  showDialog({
    title: '联系教练',
    message: `${course.coachName}：${phone}`,
    confirmButtonText: '拨打',
    showCancelButton: true,
  })
}

async function handleCancel(course) {
  const canCancelFree = isWithinCancelWindow(course.date, course.timeSlot.start)
  let title, message

  if (canCancelFree) {
    title = '确认取消预约？'
    message = `距离课程开始还有${cancelWindowHours.value}小时以上，可免费取消，不扣除学分。`
  } else {
    title = '超时取消提醒'
    message = `距离课程开始不足${cancelWindowHours.value}小时，取消将扣除50学分或扣除本次课时费，请确认是否继续取消？`
  }

  try {
    await showConfirmDialog({
      title,
      message,
      confirmButtonText: '确认取消',
      confirmButtonColor: canCancelFree ? undefined : '#ee0a24',
      cancelButtonText: '再想想',
    })
    await apiCancelCourse(course.id)
    await loadCourses()
    showToast('取消成功')
  } catch (e) {
    // 用户取消或API失败
  }
}

onMounted(async () => {
  try {
    const metaData = await getMeta()
    if (metaData && metaData.cancelWindowHours) {
      cancelWindowHours.value = metaData.cancelWindowHours
    }
  } catch (e) {
    console.error('加载meta失败', e)
  }
  await loadCourses()
})
</script>

<style scoped>
.tab-header {
  display: flex;
  background: #fff;
  border-radius: 14px;
  padding: 6px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 8px 4px;
  font-size: 14px;
  color: #646566;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tab-item.active {
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
}

.tab-badge {
  min-width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.25);
  color: inherit;
  border-radius: 9px;
  padding: 0 5px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-item:not(.active) .tab-badge {
  background: #f2f3f5;
  color: #969799;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.05);
}

.card-top {
  display: flex;
  gap: 14px;
  padding: 16px;
  padding-bottom: 12px;
}

.date-block {
  width: 60px;
  flex-shrink: 0;
  text-align: center;
  background: linear-gradient(135deg, #f5faff 0%, #e8f3ff 100%);
  border-radius: 12px;
  padding: 10px 6px;
}

.date-month {
  font-size: 11px;
  color: #1989fa;
  font-weight: 500;
}

.date-day {
  font-size: 24px;
  font-weight: 700;
  color: #323233;
  line-height: 1.1;
  margin: 2px 0;
}

.date-week {
  font-size: 11px;
  color: #646566;
}

.info-block {
  flex: 1;
  min-width: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.coach-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.coach-avatar {
  font-size: 20px;
}

.coach-name {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.subject-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
  color: #fff;
}

.subject-tag.s2 {
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 100%);
}

.subject-tag.s3 {
  background: linear-gradient(135deg, #7232dd 0%, #9c62ee 100%);
}

.status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  flex-shrink: 0;
}

.status-badge.upcoming {
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.status-badge.completed {
  background: rgba(100, 101, 102, 0.1);
  color: #646566;
}

.status-badge.cancelled {
  background: rgba(238, 10, 36, 0.1);
  color: #ee0a24;
}

.info-text {
  color: #646566;
  font-size: 12.5px;
}

.info-divider {
  color: #dcdee0;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.message-text {
  color: #1989fa;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.card-footer {
  padding: 10px 16px 14px;
  border-top: 1px dashed #f2f3f5;
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.cancel-reason {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #646566;
}

.completion-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #969799;
}

.reviewed-tag {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #07c160;
  background: rgba(7, 193, 96, 0.08);
  padding: 3px 8px;
  border-radius: 6px;
}
</style>
