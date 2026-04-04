<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { recommendApi } from '@/api/recommend'

const router = useRouter()

const hotList = ref([])
const recommendList = ref([])
const loading = ref(false)
const pagination = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0,
})
const searchQuery = ref('')
const searchLoading = ref(false)

const getHotList = async () => {
  try {
    const res = await recommendApi.getHotList()
    hotList.value = res || []
  } catch (error) {
    ElMessage.error('获取热榜失败')
  }
}

const getRecommendList = async () => {
  loading.value = true
  try {
    const res = await recommendApi.getRecommendList({
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
    })
    recommendList.value = res.records || []
    pagination.value.total = res.total || 0
  } catch (error) {
    ElMessage.error('获取推荐列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  pagination.value.pageNum = page
  getRecommendList()
}

const handlePlayAudio = (audioId) => {
  router.push(`/audio/${audioId}`)
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  searchLoading.value = true
  try {
    // 这里可以调用搜索 API，暂时使用推荐列表 API 模拟
    const res = await recommendApi.getRecommendList({
      pageNum: 1,
      pageSize: 20,
      keyword: searchQuery.value
    })
    recommendList.value = res.records || []
    pagination.value.total = res.total || 0
    pagination.value.pageNum = 1
    ElMessage.success(`找到 ${res.total || 0} 个相关音频`)
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    searchLoading.value = false
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

onMounted(() => {
  getHotList()
  getRecommendList()
})
</script>

<template>
  <div class="home-container">
    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索音频、创作者..."
          @keyup.enter="handleKeyPress"
          clearable
          style="width: 400px"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch" :loading="searchLoading">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div class="section">
      <h2>🔥 热门推荐</h2>
      <div class="audio-grid">
        <div
          v-for="(audio, index) in hotList"
          :key="audio.id"
          class="audio-card"
        >
          <div class="rank-badge">{{ index + 1 }}</div>
          <img :src="audio.coverUrl" alt="封面" class="cover" />
          <div class="audio-info">
            <h4>{{ audio.title }}</h4>
            <p>{{ audio.creatorName }}</p>
            <div class="stats">
              <span><el-icon><Headset /></el-icon> {{ audio.playCount }}</span>
              <span><el-icon><TrendCharts /></el-icon> {{ audio.hotScore }}</span>
            </div>
          </div>
          <div class="actions">
            <el-button type="primary" size="small" @click="handlePlayAudio(audio.id)">
              播放
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>✨ 为你推荐</h2>
      <div v-if="loading" class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      <div v-else-if="recommendList.length === 0" class="empty">
        <el-empty description="暂无推荐内容" />
      </div>
      <div v-else class="audio-grid">
        <div
          v-for="audio in recommendList"
          :key="audio.id"
          class="audio-card"
        >
          <img :src="audio.coverUrl" alt="封面" class="cover" />
          <div class="audio-info">
            <h4>{{ audio.title }}</h4>
            <p>{{ audio.creatorName }}</p>
            <div class="stats">
              <span><el-icon><Headset /></el-icon> {{ audio.playCount }}</span>
              <span><el-icon><Star /></el-icon> {{ audio.collectCount }}</span>
            </div>
          </div>
          <div class="actions">
            <el-button type="primary" size="small" @click="handlePlayAudio(audio.id)">
              播放
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="pagination.total > 0" class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  margin-bottom: 30px;
}

.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  margin-bottom: 20px;
  color: #333;
}

.audio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.audio-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
}

.audio-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.rank-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  z-index: 1;
}

.cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.audio-info {
  padding: 15px;
}

.audio-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-info p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.stats {
  display: flex;
  gap: 15px;
  color: #999;
  font-size: 12px;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.actions {
  padding: 10px 15px;
  border-top: 1px solid #e0e0e0;
}

.actions .el-button {
  width: 100%;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: 10px;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-bar .el-input {
    width: 100% !important;
  }
  
  .audio-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .cover {
    height: 120px;
  }
}
</style>