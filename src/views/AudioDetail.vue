<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { audioApi } from '@/api/audio'
import { likeApi } from '@/api/like'
import { favoriteApi } from '@/api/favorite'
import AudioPlayer from '@/components/AudioPlayer.vue'
import CommentSection from '@/components/CommentSection.vue'

const route = useRoute()

const audioId = ref(Number(route.params.id))
const audioDetail = ref(null)
const showPlayer = ref(false)
const isLiked = ref(false)
const isCollected = ref(false)

const getAudioDetail = async () => {
  try {
    const res = await audioApi.getAudioDetail(audioId.value)
    audioDetail.value = res
  } catch (error) {
    ElMessage.error('获取音频详情失败')
  }
}

const handlePlay = () => {
  showPlayer.value = true
}

const handleLike = async () => {
  try {
    await likeApi.saveAudioLike({
      audioId: audioId.value,
      action: isLiked.value ? 'UNLIKE' : 'LIKE',
    })
    isLiked.value = !isLiked.value
    if (audioDetail.value) {
      audioDetail.value.stats.likeCount += isLiked.value ? 1 : -1
    }
    ElMessage.success(isLiked.value ? '已添加到喜欢' : '已取消喜欢')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleCollect = async () => {
  try {
    await favoriteApi.saveAudioAction({
      audioId: audioId.value,
      action: isCollected.value ? 'UNCOLLECT' : 'COLLECT',
    })
    isCollected.value = !isCollected.value
    if (audioDetail.value) {
      audioDetail.value.stats.collectCount += isCollected.value ? 1 : -1
    }
    ElMessage.success(isCollected.value ? '已添加到收藏' : '已取消收藏')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  getAudioDetail()
})
</script>

<template>
  <div class="audio-detail-container">
    <div v-if="audioDetail" class="audio-detail">
      <div class="header">
        <img :src="audioDetail.coverUrl" alt="封面" class="cover" />
        <div class="info">
          <h1>{{ audioDetail.title }}</h1>
          <div class="creator">
            <img :src="audioDetail.creator.avatar" alt="头像" class="creator-avatar" />
            <span>{{ audioDetail.creator.nickname }}</span>
          </div>
          <div class="stats">
            <span><el-icon><Headset /></el-icon> {{ audioDetail.stats.playCount }}</span>
            <span><el-icon><Star /></el-icon> {{ audioDetail.stats.collectCount }}</span>
            <span><el-icon><Pointer /></el-icon> {{ audioDetail.stats.likeCount }}</span>
          </div>
          <div class="meta">
            <span v-if="audioDetail.isPaid" class="price">¥{{ audioDetail.price }}</span>
            <span class="duration">{{ Math.floor(audioDetail.duration / 60) }} 分钟</span>
          </div>
        </div>
      </div>

      <div class="description">
        <h3>简介</h3>
        <p>{{ audioDetail.description || '暂无简介' }}</p>
      </div>

      <div class="actions">
        <el-button type="primary" size="large" @click="handlePlay">
          <el-icon><VideoPlay /></el-icon> 立即播放
        </el-button>
        <el-button size="large" :type="isLiked ? 'danger' : 'default'" @click="handleLike">
          <el-icon><Star /></el-icon> {{ isLiked ? '已喜欢' : '喜欢' }}
        </el-button>
        <el-button size="large" :type="isCollected ? 'warning' : 'default'" @click="handleCollect">
          <el-icon><FolderOpened /></el-icon> {{ isCollected ? '已收藏' : '收藏' }}
        </el-button>
      </div>

      <div v-if="audioDetail.isPaid && !audioDetail.isPurchased" class="trial-info">
        <el-alert type="info" :closable="false">
          该音频为付费内容，试听时长 {{ audioDetail.trialDuration }} 秒
        </el-alert>
      </div>
    </div>

    <AudioPlayer v-if="showPlayer" :audio-id="audioId" @close="showPlayer = false" />
    <CommentSection v-if="audioDetail" :audio-id="audioId" />
  </div>
</template>

<style scoped>
@import '@/resource/css/audioDetail.css';
</style>
