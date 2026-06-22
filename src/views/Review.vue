<template>
  <div class="review-page">
    <van-nav-bar
      title="训练评价"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="page-container" v-if="course">
      <div class="course-summary-card fade-in">
        <div class="summary-row">
          <div class="coach-block">
            <span class="coach-avatar">{{ course.coachAvatar }}</span>
            <div class="coach-info">
              <div class="coach-name">{{ course.coachName }}</div>
              <div class="coach-subject">科{{ course.subject }}教练</div>
            </div>
          </div>
          <span class="subject-tag s{{ course.subject }}">科{{ course.subject }}</span>
        </div>
        <div class="summary-details">
          <div class="detail-item">
            <van-icon name="calendar-o" size="13" color="#646566" />
            <span>{{ formatDateStr(course.date) }}</span>
          </div>
          <div class="detail-item">
            <van-icon name="clock-o" size="13" color="#646566" />
            <span>{{ course.timeSlot.start }} - {{ course.timeSlot.end }}</span>
          </div>
          <div class="detail-item">
            <van-icon name="location-o" size="13" color="#646566" />
            <span>{{ course.location }}</span>
          </div>
        </div>
      </div>

      <div class="section-title fade-in">评分维度</div>
      <div class="rating-card fade-in">
        <div
          v-for="(item, idx) in ratingDims"
          :key="item.key"
          class="rating-row"
        >
          <div class="rating-label">
            <span class="dim-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </div>
          <div class="rating-stars">
            <van-rate
              v-model="ratings[item.key]"
              :count="5"
              size="24"
              color="#ffb300"
              void-color="#ebedf0"
            />
            <span class="score-text">{{ ratings[item.key] }}.0</span>
          </div>
        </div>

        <div class="total-score">
          <div class="score-label">综合评分</div>
          <div class="score-value">{{ totalScore.toFixed(1) }}</div>
          <div class="score-bar-bg">
            <div
              class="score-bar-fill"
              :style="{ width: `${(totalScore / 5) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div class="section-title fade-in">快捷标签</div>
      <div class="tag-card fade-in">
        <div class="tags-wrap">
          <span
            v-for="tag in quickTags"
            :key="tag"
            class="quick-tag"
            :class="{ active: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="section-title fade-in">文字评价</div>
      <div class="comment-card fade-in">
        <van-field
          v-model="comment"
          type="textarea"
          rows="5"
          placeholder="分享您的训练体验，帮助其他学员选择教练..."
          maxlength="300"
          show-word-limit
          autosize
        />
      </div>

      <div class="footer-wrap">
        <van-button
          block
          round
          size="large"
          class="gradient-btn"
          :disabled="totalScore === 0"
          :loading="submitting"
          @click="submitReview"
        >
          提交评价
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import { getCourse } from '../api/course'
import { submitReview as apiSubmitReview } from '../api/review'

const route = useRoute()
const router = useRouter()

const courseId = Number(route.params.courseId)
const course = ref(null)

const ratings = reactive({
  attitude: 5,
  professionalism: 5,
  patience: 5,
  punctuality: 5,
})

const ratingDims = [
  { key: 'attitude', label: '教学态度', icon: '😊' },
  { key: 'professionalism', label: '专业程度', icon: '🎓' },
  { key: 'patience', label: '耐心程度', icon: '🤗' },
  { key: 'punctuality', label: '守时程度', icon: '⏰' },
]

const quickTags = [
  '讲解清晰',
  '有耐心',
  '教学专业',
  '方法实用',
  '经验丰富',
  '态度温和',
  '准时准点',
  '通过率高',
  '缓解紧张',
  '细致认真',
]

const selectedTags = ref([])
const comment = ref('')
const submitting = ref(false)

const totalScore = computed(() => {
  const vals = Object.values(ratings)
  if (vals.some((v) => v === 0)) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
})

function formatDateStr(dateStr) {
  const d = new Date(dateStr)
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日 ${week}`
}

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(idx, 1)
  }
}

async function submitReview() {
  if (totalScore.value === 0) {
    showToast('请完成评分')
    return
  }
  submitting.value = true

  try {
    await apiSubmitReview({
      coachId: course.value.coachId,
      courseId,
      ratings: { ...ratings },
      content: comment.value,
      tags: [...selectedTags.value],
    })

    submitting.value = false
    showSuccessToast('评价成功，感谢您的反馈！')
    setTimeout(() => router.back(), 1000)
  } catch (e) {
    submitting.value = false
    showToast(e.message || '评价失败，请重试')
  }
}

onMounted(async () => {
  try {
    course.value = await getCourse(courseId)
  } catch (e) {
    console.error('加载课程详情失败', e)
  }
})
</script>

<style scoped>
.course-summary-card {
  background: linear-gradient(135deg, #f5faff 0%, #e8f3ff 100%);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #d6e8ff;
  margin-bottom: 4px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.coach-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coach-avatar {
  width: 52px;
  height: 52px;
  background: #fff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.coach-name {
  font-size: 17px;
  font-weight: 700;
  color: #323233;
}

.coach-subject {
  font-size: 12px;
  color: #646566;
  margin-top: 2px;
}

.subject-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  color: #fff;
}

.subject-tag.s2 {
  background: linear-gradient(135deg, #1989fa 0%, #3da5ff 100%);
}

.subject-tag.s3 {
  background: linear-gradient(135deg, #7232dd 0%, #9c62ee 100%);
}

.summary-details {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #c7ddff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #646566;
}

.rating-card {
  background: #fff;
  border-radius: 16px;
  padding: 4px 16px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.rating-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f6f7;
}

.rating-row:last-of-type {
  border-bottom: none;
  padding-bottom: 14px;
}

.rating-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #323233;
}

.dim-icon {
  font-size: 18px;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-text {
  font-size: 14px;
  font-weight: 600;
  color: #ffb300;
  min-width: 32px;
  text-align: right;
}

.total-score {
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px dashed #ebedf0;
  text-align: center;
}

.score-label {
  font-size: 13px;
  color: #646566;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  color: #ffb300;
  line-height: 1.2;
  margin: 4px 0 10px;
}

.score-bar-bg {
  height: 8px;
  background: #f2f3f5;
  border-radius: 4px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd666 0%, #ffb300 100%);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.tag-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  padding: 6px 14px;
  background: #f5f6f7;
  border-radius: 16px;
  font-size: 13px;
  color: #646566;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.quick-tag:active {
  transform: scale(0.95);
}

.quick-tag.active {
  background: rgba(255, 179, 0, 0.1);
  color: #ff9500;
  border-color: #ffb300;
}

.comment-card {
  background: #fff;
  border-radius: 16px;
  padding: 6px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.footer-wrap {
  position: sticky;
  bottom: 0;
  padding: 12px 0 20px;
  background: linear-gradient(180deg, transparent 0%, #f5f7fa 30%);
  margin-top: 12px;
}
</style>
