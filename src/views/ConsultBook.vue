<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { consultApi } from '@/api/consult'

const route = useRoute()
const router = useRouter()

const slotId = ref(Number(route.query.slotId))
const creatorId = ref(Number(route.query.creatorId))

const slotInfo = ref(null)
const creatorInfo = ref(null)
const loading = ref(false)
const submitting = ref(false)

const form = ref({
  message: '',
  contactPhone: '',
  contactWechat: ''
})

const formRules = {
  message: [
    { required: true, message: '请填写咨询内容', trigger: 'blur' },
    { min: 10, max: 500, message: '咨询内容长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请填写联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const formRef = ref(null)

const getSlotInfo = async () => {
  try {
    const res = await consultApi.getSlotDetail(slotId.value)
    slotInfo.value = res
  } catch (error) {
    ElMessage.error('获取时间槽信息失败')
  }
}

const getCreatorInfo = async () => {
  try {
    const res = await consultApi.getCreatorDetail(creatorId.value)
    creatorInfo.value = res
  } catch (error) {
    ElMessage.error('获取创作者信息失败')
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await consultApi.saveConsult({
      slotId: slotId.value,
      creatorId: creatorId.value,
      message: form.value.message,
      contactPhone: form.value.contactPhone,
      contactWechat: form.value.contactWechat
    })
    ElMessage.success('预约成功')
    router.push('/user/consult')
  } catch (error) {
    ElMessage.error('预约失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleBack = () => {
  router.back()
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return `${month}月${day}日 ${weekDay}`
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toTimeString().slice(0, 5)
}

onMounted(() => {
  getSlotInfo()
  getCreatorInfo()
})
</script>

<template>
  <div class="consult-book-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <el-button class="back-btn" link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回选择时间
        </el-button>
        <h1 class="page-title">填写预约信息</h1>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 左侧：预约信息表单 -->
      <div class="form-section">
        <div class="section-card">
          <h3 class="section-title">
            <el-icon><EditPen /></el-icon>
            咨询内容
          </h3>
          <el-form
            ref="formRef"
            :model="form"
            :rules="formRules"
            label-position="top"
            class="consult-form"
          >
            <el-form-item label="咨询问题描述" prop="message">
              <el-input
                v-model="form.message"
                type="textarea"
                :rows="6"
                placeholder="请详细描述您想咨询的问题，以便创作者更好地为您解答..."
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="联系电话" prop="contactPhone">
              <el-input
                v-model="form.contactPhone"
                placeholder="请输入您的手机号码"
                maxlength="11"
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="微信号（选填）">
              <el-input
                v-model="form.contactWechat"
                placeholder="请输入您的微信号"
              >
                <template #prefix>
                  <el-icon><ChatDotRound /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 右侧：预约摘要 -->
      <div class="summary-section">
        <div class="section-card summary-card">
          <h3 class="section-title">
            <el-icon><Document /></el-icon>
            预约摘要
          </h3>

          <!-- 创作者信息 -->
          <div v-if="creatorInfo" class="creator-summary">
            <img :src="creatorInfo.avatar" :alt="creatorInfo.nickname" class="summary-avatar" />
            <div class="summary-info">
              <div class="summary-name">{{ creatorInfo.nickname }}</div>
              <div class="summary-title">{{ creatorInfo.title }}</div>
            </div>
          </div>

          <!-- 时间信息 -->
          <div v-if="slotInfo" class="time-summary">
            <div class="summary-row">
              <span class="summary-label">预约日期</span>
              <span class="summary-value">{{ formatDate(slotInfo.startTime) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">时间段</span>
              <span class="summary-value">{{ formatTime(slotInfo.startTime) }} - {{ formatTime(slotInfo.endTime) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">咨询时长</span>
              <span class="summary-value">{{ Math.round((new Date(slotInfo.endTime) - new Date(slotInfo.startTime)) / 60000) }} 分钟</span>
            </div>
          </div>

          <!-- 价格信息 -->
          <div v-if="slotInfo" class="price-summary">
            <div class="summary-row total">
              <span class="summary-label">咨询费用</span>
              <span class="summary-price">¥{{ slotInfo.price }}</span>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="submit-section">
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              class="submit-btn"
              @click="handleSubmit"
            >
              确认预约
            </el-button>
            <p class="submit-tip">点击确认预约后，系统将扣除相应费用</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/resource/css/consultBook.css';
</style>
