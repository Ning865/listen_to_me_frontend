<template>
  <div class="admin-dashboard">
    <h1>数据大盘</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">总销售额</div>
        <div class="stat-value">¥{{ dashboard.totalSales.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">今日销售额</div>
        <div class="stat-value">¥{{ dashboard.todaySales.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">活跃用户</div>
        <div class="stat-value">{{ dashboard.activeUsers }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">累计用户</div>
        <div class="stat-value">{{ dashboard.totalUsers }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">月活跃用户</div>
        <div class="stat-value">{{ dashboard.monthlyActiveUsers }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">付费转化率</div>
        <div class="stat-value">{{ (dashboard.conversionRate * 100).toFixed(2) }}%</div>
      </div>
    </div>

    <!-- 销售额趋势 -->
    <div class="chart-section">
      <h3>销售额趋势</h3>
      <div class="chart-container">
        <div v-for="(item, index) in dashboard.salesTrend" :key="index" class="chart-bar">
          <div class="bar-label">{{ item.date }}</div>
          <div class="bar-container">
            <div class="bar" :style="{ height: (item.amount / 2500) * 100 + '%' }"></div>
          </div>
          <div class="bar-value">¥{{ item.amount }}</div>
        </div>
      </div>
    </div>

    <!-- 热门音频 -->
    <div class="list-section">
      <h3>热门音频排行</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>排名</th>
            <th>标题</th>
            <th>播放量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in dashboard.hotAudioList" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.playCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 创作者收益 -->
    <div class="list-section">
      <h3>创作者收益排行</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>排名</th>
            <th>创作者</th>
            <th>收益</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in dashboard.creatorEarnings" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.creatorName }}</td>
            <td>¥{{ item.amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import mockApi from '@/data/mockApi'

const dashboard = ref({
  totalSales: 0,
  todaySales: 0,
  activeUsers: 0,
  totalUsers: 0,
  monthlyActiveUsers: 0,
  conversionRate: 0,
  salesTrend: [],
  hotAudioList: [],
  creatorEarnings: []
})

const loadDashboardData = async () => {
  try {
    const response = await mockApi.admin.getDashboard()
    dashboard.value = response
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
@import '@/resource/css/adminDash.css';
</style>