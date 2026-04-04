<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { consultApi } from '@/api/consult'

const route = useRoute()
const router = useRouter()

const creatorId = ref(Number(route.params.id))
const creatorInfo = ref(null)
const loading = ref(false)
const slotList = ref([])
const selectedSlot = ref(null)

const pagination = ref({
  pageNum: 1,
  pageSize: 10
})
const total = ref(0)

const getCreatorInfo = async () => {
  try {
    const res = await consultApi.getCreatorDetail(creatorId.value)
    creatorInfo.value = res
  } catch (error) {
    ElMessage.error('获取创作者信息失败')
  }
}

const getSlotList = async () => {
  loading.value = true
  try {
    const res = await consultApi.getCreatorSlots({
      creatorId: creatorId.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    })
    slotList.value = res.records
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取时间槽列表失败')
  } finally {
    loading.value = false
  }
}

const handleSlotSelect = (slot) => {
  selectedSlot.value = slot
}

const handleNext = () => {
  if (!selectedSlot.value) {
    ElMessage.warning('请选择一个时间槽')
    return
  }
  router.push({
    path: '/consult/book',
    query: {
      slotId: selectedSlot.value.id,
      creatorId: creatorId.value
    }
  })
}

const handleBack = () => {
  router.back()
}

const handlePageChange = (page) => {
  pagination.value.pageNum = page
  getSlotList()
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
  getCreatorInfo()
  getSlotList()
})
</script>

<template>
  <div class="creator-slots-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <el-button class="back-btn" link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回创作者列表
        </el-button>
        <h1 class="page-title">选择咨询时间</h1>
      </div>
    </div>

    <!-- 创作者信息卡片 -->
    <div v-if="creatorInfo" class="creator-info-card">
      <div class="creator-profile">
        <img :src="creatorInfo.avatar" :alt="creatorInfo.nickname" class="creator-avatar" />
        <div class="creator-details">
          <h2 class="creator-name">{{ creatorInfo.nickname }}</h2>
          <p class="creator-title">{{ creatorInfo.title }}</p>
          <p class="creator-bio">{{ creatorInfo.bio }}</p>
        </div>
      </div>
    </div>

    <!-- 时间槽选择区域 -->
    <div class="slots-section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><Clock /></el-icon>
          可预约时间
        </h3>
        <span class="slot-count">共 {{ total }} 个时间段</span>
      </div>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="slotList.length === 0" class="empty-state">
        <el-empty description="暂无可用时间槽">
          <el-button type="primary" @click="handleBack">返回创作者列表</el-button>
        </el-empty>
      </div>

      <div v-else class="slots-list">
        <div
          v-for="slot in slotList"
          :key="slot.id"
          :class="['slot-item', { selected: selectedSlot?.id === slot.id }]"
          @click="handleSlotSelect(slot)"
        >
          <div class="slot-checkbox">
            <el-radio :model-value="selectedSlot?.id === slot.id" :label="true">
              <span class="radio-label"></span>
            </el-radio>
          </div>
          <div class="slot-info">
            <div class="slot-date">{{ formatDate(slot.startTime) }}</div>
            <div class="slot-time">
              <el-icon><Timer /></el-icon>
              {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
            </div>
          </div>
          <div class="slot-price">
            <span class="price-label">咨询费用</span>
            <span class="price-value">¥{{ slot.price }}</span>
          </div>
          <div class="slot-duration">
            <el-tag size="small" type="info">
              {{ Math.round((new Date(slot.endTime) - new Date(slot.startTime)) / 60000) }} 分钟
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pagination.pageSize" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="slotList.length > 0" class="action-bar">
      <div class="action-content">
        <div class="selected-info" v-if="selectedSlot">
          <span class="label">已选择：</span>
          <span class="value">{{ formatDate(selectedSlot.startTime) }} {{ formatTime(selectedSlot.startTime) }} - {{ formatTime(selectedSlot.endTime) }}</span>
        </div>
        <div class="action-buttons">
          <el-button size="large" @click="handleBack">取消</el-button>
          <el-button
            type="primary"
            size="large"
            :disabled="!selectedSlot"
            @click="handleNext"
          >
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/resource/css/creatorSlots.css';
</style>
