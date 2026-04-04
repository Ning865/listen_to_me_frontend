<template>
  <div class="user-consult">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Calendar /></el-icon>
        预约咨询
      </h2>
      <p class="page-subtitle">选择合适的时间，与创作者一对一交流</p>
    </div>

    <!-- 步骤条 -->
    <div class="step-container">
      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="选择时间范围" />
        <el-step title="选择时间槽" />
        <el-step title="确认预约" />
      </el-steps>
    </div>

    <!-- 步骤1: 选择时间范围 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="time-range-card">
        <div class="card-header">
          <el-icon><Clock /></el-icon>
          <span>选择预约时间范围</span>
        </div>
        <div class="card-body">
          <el-form :model="timeRangeForm" label-position="top">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="开始时间">
                  <el-date-picker
                    v-model="timeRangeForm.startTime"
                    type="datetime"
                    placeholder="选择开始时间"
                    style="width: 100%"
                    :disabled-date="disabledStartDate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="结束时间">
                  <el-date-picker
                    v-model="timeRangeForm.endTime"
                    type="datetime"
                    placeholder="选择结束时间"
                    style="width: 100%"
                    :disabled-date="disabledEndDate"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="action-bar">
            <el-button type="primary" size="large" @click="searchSlots" :loading="loading" :disabled="!canSearch">
              <el-icon><Search /></el-icon>
              查询可用时间槽
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤2: 选择时间槽 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="slot-selection-card">
        <div class="card-header">
          <div class="header-left">
            <el-icon><List /></el-icon>
            <span>选择时间槽</span>
            <el-tag type="info" size="small" class="count-tag">共 {{ totalSlots }} 个可用</el-tag>
          </div>
          <el-button link @click="goBackToStep1">
            <el-icon><ArrowLeft /></el-icon>
            重新选择时间
          </el-button>
        </div>
        <div class="card-body">
          <!-- 空状态 -->
          <div v-if="!loading && availableSlots.length === 0" class="empty-state">
            <el-empty description="该时间段暂无可用时间槽">
              <el-button type="primary" @click="goBackToStep1">重新选择时间</el-button>
            </el-empty>
          </div>

          <!-- 时间槽列表 -->
          <div v-else class="slot-grid">
            <div
              v-for="slot in availableSlots"
              :key="slot.id"
              :class="['slot-card', { selected: selectedSlot?.id === slot.id }]"
              @click="selectSlot(slot)"
            >
              <div class="slot-time">
                <div class="date">{{ formatDate(slot.startTime) }}</div>
                <div class="time">{{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}</div>
              </div>
              <div class="slot-divider"></div>
              <div class="slot-creator">
                <el-avatar :size="40" :src="slot.creatorAvatar" />
                <div class="creator-info">
                  <div class="creator-name">{{ slot.creatorName }}</div>
                  <div class="creator-title">{{ slot.creatorTitle }}</div>
                </div>
              </div>
              <div class="slot-footer">
                <div class="slot-price">
                  <el-icon><Coin /></el-icon>
                  <span>{{ slot.price }} 币</span>
                </div>
                <el-tag type="success" size="small">可预约</el-tag>
              </div>
              <div v-if="selectedSlot?.id === slot.id" class="selected-indicator">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="totalSlots > pageSize" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[8, 12, 16, 20]"
              layout="total, sizes, prev, pager, next"
              :total="totalSlots"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>

          <!-- 下一步按钮 -->
          <div v-if="selectedSlot" class="action-bar">
            <el-button type="primary" size="large" @click="goToStep3">
              下一步：填写预约信息
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤3: 确认预约 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="confirm-card">
        <div class="card-header">
          <el-icon><DocumentChecked /></el-icon>
          <span>确认预约信息</span>
        </div>
        <div class="card-body">
          <!-- 时间槽信息摘要 -->
          <div class="slot-summary">
            <h4>预约时间槽</h4>
            <div class="summary-content">
              <div class="summary-item">
                <el-icon><Calendar /></el-icon>
                <span class="label">时间：</span>
                <span class="value">{{ formatDateTime(selectedSlot?.startTime) }} - {{ formatTime(selectedSlot?.endTime) }}</span>
              </div>
              <div class="summary-item">
                <el-icon><User /></el-icon>
                <span class="label">创作者：</span>
                <span class="value">{{ selectedSlot?.creatorName }}</span>
              </div>
              <div class="summary-item">
                <el-icon><Coin /></el-icon>
                <span class="label">价格：</span>
                <span class="value price">{{ selectedSlot?.price }} 虚拟币</span>
              </div>
              <div class="summary-item">
                <el-icon><Location /></el-icon>
                <span class="label">预约地址：</span>
                <span class="value">{{ selectedSlot?.address || '待创作者确认后显示' }}</span>
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 预约表单 -->
          <el-form :model="consultForm" label-position="top" class="consult-form">
            <el-form-item label="咨询留言" required>
              <el-input
                v-model="consultForm.message"
                type="textarea"
                :rows="4"
                placeholder="请详细描述您想咨询的问题，以便创作者更好地准备..."
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-form>

          <!-- 操作按钮 -->
          <div class="action-bar">
            <el-button size="large" @click="goBackToStep2">
              <el-icon><ArrowLeft /></el-icon>
              上一步
            </el-button>
            <el-button type="primary" size="large" @click="submitConsult" :loading="submitting" :disabled="!canSubmit">
              <el-icon><Check /></el-icon>
              确认预约
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的预约列表 -->
    <div class="my-consults-section">
      <div class="section-header">
        <h3>
          <el-icon><Collection /></el-icon>
          我的预约记录
        </h3>
        <div class="filter-bar">
          <el-select v-model="searchParams.status" placeholder="全部状态" clearable @change="getMyConsultOrders">
            <el-option label="全部状态" value="" />
            <el-option label="待确认" value="PENDING_CONFIRM" />
            <el-option label="已确认" value="CONFIRMED" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
            <el-option label="退款中" value="REFUND_PENDING" />
            <el-option label="已退款" value="REFUNDED" />
          </el-select>
          <el-button type="primary" @click="getMyConsultOrders" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <!-- 预约列表 -->
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="consultOrders.length === 0" class="empty-state">
        <el-empty description="暂无预约记录" />
      </div>
      <div v-else class="consult-list">
        <el-card v-for="order in consultOrders" :key="order.id" class="consult-card" shadow="hover">
          <div class="consult-card-content">
            <div class="consult-info">
              <div class="time-badge">
                <el-icon><Clock /></el-icon>
                <span>{{ order.date }} {{ order.startTime }} - {{ order.endTime }}</span>
              </div>
              <div class="creator-row">
                <el-avatar :size="32" :src="order.creatorAvatar" />
                <span class="creator-name">{{ order.creatorName }}</span>
              </div>
              <div class="message-preview" v-if="order.message">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ order.message }}</span>
              </div>
            </div>
            <div class="consult-meta">
              <div class="price-tag">
                <el-icon><Coin /></el-icon>
                <span>{{ order.price }} 币</span>
              </div>
              <el-tag :type="getStatusType(order.status)" effect="dark">
                {{ getStatusText(order.status) }}
              </el-tag>
            </div>
          </div>
          <div class="consult-card-footer">
            <div class="address-info" v-if="order.address">
              <el-icon><Location /></el-icon>
              <span>预约地址：{{ order.address }}</span>
            </div>
            <div class="actions">
              <el-button
                v-if="order.status === 'PENDING_CONFIRM'"
                type="danger"
                size="small"
                @click="cancelConsult(order.id)"
              >
                取消预约
              </el-button>
              <el-button
                v-if="order.status === 'CONFIRMED' || order.status === 'COMPLETED'"
                type="warning"
                size="small"
                @click="showRefundDialog(order.id)"
              >
                申请退款
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleConsultSizeChange"
          @current-change="handleConsultPageChange"
        />
      </div>
    </div>

    <!-- 退款申请弹窗 -->
    <el-dialog
      v-model="showRefundModal"
      title="申请退款"
      width="500px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="退款原因" required>
          <el-input
            v-model="refundReason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明退款原因..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRefundModal = false">取消</el-button>
        <el-button type="primary" @click="applyRefund" :loading="submitting" :disabled="!refundReason.trim()">
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar, Clock, Search, List, ArrowLeft, ArrowRight,
  Check, DocumentChecked, User, Coin, Location,
  Collection, Refresh, ChatDotRound
} from '@element-plus/icons-vue'
import { consultApi } from '@/api/consult'

// 当前步骤
const currentStep = ref(0)

// 时间范围表单
const timeRangeForm = ref({
  startTime: '',
  endTime: ''
})

// 可用时间槽列表
const availableSlots = ref([])
const totalSlots = ref(0)
const selectedSlot = ref(null)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(8)

// 预约表单
const consultForm = ref({
  message: ''
})

// 我的预约列表
const consultOrders = ref([])
const total = ref(0)
const searchParams = ref({
  status: ''
})

// 退款相关
const showRefundModal = ref(false)
const currentOrderId = ref(null)
const refundReason = ref('')

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 计算属性
const canSearch = computed(() => {
  return timeRangeForm.value.startTime && timeRangeForm.value.endTime
})

const canSubmit = computed(() => {
  return consultForm.value.message.trim().length > 0
})

// 禁用日期
const disabledStartDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

const disabledEndDate = (time) => {
  if (!timeRangeForm.value.startTime) return false
  return time.getTime() <= timeRangeForm.value.startTime.getTime()
}

// 查询可用时间槽
const searchSlots = async () => {
  if (!canSearch.value) {
    ElMessage.warning('请选择开始时间和结束时间')
    return
  }

  loading.value = true
  try {
    const params = {
      startTime: formatDateTimeForApi(timeRangeForm.value.startTime),
      endTime: formatDateTimeForApi(timeRangeForm.value.endTime),
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const response = await consultApi.getAvailableSlots(params)
    availableSlots.value = response.records || []
    totalSlots.value = response.total || 0
    currentStep.value = 1
  } catch (error) {
    console.error('查询时间槽失败:', error)
    ElMessage.error('查询时间槽失败')
  } finally {
    loading.value = false
  }
}

// 选择时间槽
const selectSlot = (slot) => {
  selectedSlot.value = slot
}

// 获取我的预约列表
const getMyConsultOrders = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      status: searchParams.value.status
    }
    const response = await consultApi.getMyConsultPage(params)
    consultOrders.value = response.records || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取预约订单列表失败:', error)
    ElMessage.error('获取预约订单列表失败')
  } finally {
    loading.value = false
  }
}

// 提交预约
const submitConsult = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请输入咨询留言')
    return
  }

  submitting.value = true
  try {
    const data = {
      slotId: selectedSlot.value.id,
      message: consultForm.value.message
    }
    await consultApi.saveConsult(data)
    ElMessage.success('预约发起成功')
    // 重置表单
    resetForm()
    // 刷新预约列表
    getMyConsultOrders()
  } catch (error) {
    console.error('发起预约失败:', error)
    ElMessage.error('发起预约失败')
  } finally {
    submitting.value = false
  }
}

// 取消预约
const cancelConsult = async (id) => {
  try {
    await ElMessageBox.confirm('确定要取消这个预约吗？取消后将全额退款。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await consultApi.cancelConsult(id)
    ElMessage.success('预约取消成功')
    getMyConsultOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
      ElMessage.error('取消预约失败')
    }
  }
}

// 显示退款弹窗
const showRefundDialog = (id) => {
  currentOrderId.value = id
  refundReason.value = ''
  showRefundModal.value = true
}

// 申请退款
const applyRefund = async () => {
  if (!refundReason.value.trim()) {
    ElMessage.warning('请输入退款原因')
    return
  }

  submitting.value = true
  try {
    await consultApi.applyRefund(currentOrderId.value, refundReason.value)
    ElMessage.success('退款申请提交成功')
    showRefundModal.value = false
    getMyConsultOrders()
  } catch (error) {
    console.error('申请退款失败:', error)
    ElMessage.error('申请退款失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  currentStep.value = 0
  timeRangeForm.value = { startTime: '', endTime: '' }
  availableSlots.value = []
  selectedSlot.value = null
  consultForm.value = { message: '' }
  currentPage.value = 1
}

// 步骤导航
const goBackToStep1 = () => {
  currentStep.value = 0
  selectedSlot.value = null
}

const goBackToStep2 = () => {
  currentStep.value = 1
}

const goToStep3 = () => {
  currentStep.value = 2
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  searchSlots()
}

const handlePageChange = (page) => {
  currentPage.value = page
  searchSlots()
}

const handleConsultSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  getMyConsultOrders()
}

const handleConsultPageChange = (page) => {
  currentPage.value = page
  getMyConsultOrders()
}

// 格式化函数
const formatDate = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatDateTimeForApi = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 状态相关
const getStatusType = (status) => {
  const types = {
    'PENDING_CONFIRM': 'warning',
    'CONFIRMED': 'success',
    'COMPLETED': 'info',
    'CANCELLED': 'danger',
    'REFUND_PENDING': 'warning',
    'REFUNDED': 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'PENDING_CONFIRM': '待确认',
    'CONFIRMED': '已确认',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
    'REFUND_PENDING': '退款中',
    'REFUNDED': '已退款'
  }
  return texts[status] || status
}

onMounted(() => {
  getMyConsultOrders()
})
</script>

<style scoped>
.user-consult {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-title .el-icon {
  font-size: 32px;
  color: #409eff;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 步骤条 */
.step-container {
  margin-bottom: 32px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

/* 步骤内容 */
.step-content {
  margin-bottom: 48px;
}

/* 卡片样式 */
.time-range-card,
.slot-selection-card,
.confirm-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #409eff 0%, #1677ff 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.card-header .header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header .el-icon {
  font-size: 20px;
}

.count-tag {
  margin-left: 8px;
}

.card-body {
  padding: 32px 24px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

/* 时间槽网格 */
.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.slot-card {
  position: relative;
  background: #fff;
  border: 2px solid #ebeef5;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slot-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.slot-card.selected {
  border-color: #409eff;
  background: #f0f9ff;
}

.slot-time {
  text-align: center;
  margin-bottom: 16px;
}

.slot-time .date {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.slot-time .time {
  font-size: 14px;
  color: #606266;
}

.slot-divider {
  height: 1px;
  background: #ebeef5;
  margin: 16px 0;
}

.slot-creator {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.creator-title {
  font-size: 12px;
  color: #909399;
}

.slot-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.slot-price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
}

.slot-price .el-icon {
  color: #e6a23c;
}

.selected-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

/* 确认卡片 */
.slot-summary {
  margin-bottom: 24px;
}

.slot-summary h4 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 16px 0;
}

.summary-content {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .el-icon {
  color: #909399;
  font-size: 16px;
}

.summary-item .label {
  color: #606266;
  min-width: 80px;
}

.summary-item .value {
  color: #303133;
  font-weight: 500;
}

.summary-item .value.price {
  color: #f56c6c;
  font-size: 16px;
}

.consult-form {
  margin-top: 24px;
}

/* 我的预约部分 */
.my-consults-section {
  margin-top: 48px;
  padding-top: 48px;
  border-top: 1px solid #ebeef5;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 预约卡片 */
.consult-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consult-card {
  border-radius: 12px;
}

.consult-card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.consult-info {
  flex: 1;
}

.time-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ecf5ff;
  color: #409eff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
}

.creator-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.creator-name {
  font-size: 14px;
  color: #606266;
}

.message-preview {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}

.message-preview .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.message-preview span {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.consult-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.price-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #f56c6c;
  font-weight: 500;
}

.consult-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.address-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.actions {
  display: flex;
  gap: 8px;
}

/* 空状态和加载状态 */
.empty-state,
.loading-state {
  padding: 48px 0;
}

/* 分页 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-consult {
    padding: 16px;
  }

  .page-title {
    font-size: 22px;
  }

  .card-body {
    padding: 20px 16px;
  }

  .slot-grid {
    grid-template-columns: 1fr;
  }

  .consult-card-content {
    flex-direction: column;
  }

  .consult-meta {
    flex-direction: row;
    align-items: center;
    width: 100%;
  }

  .consult-card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
