<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user'
import { authApi } from '@/api/user'
import { useUserStore } from '@/stores/user/user'

const userStore = useUserStore()

const profileForm = reactive({
  nickname: '',
  avatar: '',
  phone: '',
  email: '',
  verifyCode: '',
  oldPassword: '',
  newPassword: '',
})
const profileInfo = reactive({
  nickname: '',
  avatar: '',
  phone: '',
  email: '',
  username: '',
  balance: '',
  frozenBalance: '',
  isCreator: 0,
  id: 0,
})

const verifyCodeForm = reactive({
  target: '',
  uuid: '',
  imageCode: '',
})


const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const isEditMode = ref(false)
const captchaUrl = ref('')

const getProfile = async () => {
  try {
    const res = await userApi.getProfile()
    Object.assign(profileInfo, res.data)
    Object.assign(profileForm, res.data)
  } catch (error) {
    console.error(error)
  }
}
const getCaptcha = async () => {
  try {
    const res = await authApi.getImageCaptcha()
    captchaUrl.value = res.data.img
    verifyCodeForm.uuid = res.data.uuid
  } catch (error) {
    console.error(error)
  }
}

const sendVerifyCode = async () => {
  if (!profileForm.phone && !profileForm.email) {
    ElMessage.warning('请输入手机号或邮箱')
    return
  }
  verifyCodeForm.target = profileForm.phone || profileForm.email

  sendingCode.value = true
  try {
    await authApi.sendVerifyCode(verifyCodeForm)
    ElMessage.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value === 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error(error)
  } finally {
    sendingCode.value = false
  }
}

const handleFileChange = async (file) => {
  if (file.status === 'ready') {
    try {
      loading.value = true
      const response = await userApi.uploadAvatar(file.raw)
      if (response && response.data) {
        profileForm.avatar = response.data
        ElMessage.success('头像上传成功')
      } else {
        ElMessage.warning('头像上传失败')
      }
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
}

const beforeAvatarUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt20M = file.size / 1024 / 1024 < 20

  if (!isJpgOrPng) {
    ElMessage.error('只能上传 JPG/PNG 图片')
    return false
  }
  if (!isLt20M) {
    ElMessage.error('图片大小不能超过 20MB')
    return false
  }
  return true
}

const handleUpdateProfile = async () => {
  loading.value = true
  try {
    const data = {
      nickname: profileForm.nickname,
      avatar: profileForm.avatar,
    }
    data.phone = profileForm.phone
    data.email = profileForm.email

    if ((profileInfo.phone !== profileForm.phone) || (profileInfo.email !== profileForm.email)) {
      if (!profileForm.verifyCode) {
        ElMessage.warning('修改手机号或邮箱需要验证码')
        loading.value = false
        return
      }
      data.verifyCode = profileForm.verifyCode
    }

    if (profileForm.newPassword) {
      if (!profileForm.oldPassword) {
        ElMessage.warning('修改密码需要输入原密码')
        loading.value = false
        return
      }
      data.oldPassword = profileForm.oldPassword
      data.newPassword = profileForm.newPassword
    }

    await userApi.updateProfile(data)
    ElMessage.success('修改成功')
    await getProfile()
    profileForm.verifyCode = ''
    profileForm.oldPassword = ''
    profileForm.newPassword = ''
    isEditMode.value = false
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

onMounted(() => {
  getProfile()
  getCaptcha()
})
</script>

<template>
  <div class="profile-container">
    <!-- 个人资料展示 -->
    <div class="profile-box" v-if="!isEditMode">
      <div class="profile-header">
        <h2>个人资料</h2>
        <el-button type="primary" @click="toggleEditMode">
          <el-icon><Edit /></el-icon> 修改个人信息
        </el-button>
      </div>
      
      <div class="profile-info">
        <div class="avatar-section">
          <img :src="profileInfo.avatar" alt="头像" class="avatar" />
          <h3>{{ profileInfo.nickname }}</h3>
          <p class="username">{{ profileInfo.username }}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="label">手机号</span>
            <span class="value">{{ profileInfo.phone || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱</span>
            <span class="value">{{ profileInfo.email || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">账户余额</span>
            <span class="value balance">{{ profileInfo.balance }} 虚拟币</span>
          </div>
          <div class="info-item">
            <span class="label">冻结余额</span>
            <span class="value">{{ profileInfo.frozenBalance }} 虚拟币</span>
          </div>
          <div class="info-item">
            <span class="label">创作者身份</span>
            <span class="value">
              <el-tag :type="profileInfo.isCreator === 1 ? 'success' : 'info'">
                {{ profileInfo.isCreator === 1 ? '是' : '否' }}
              </el-tag>
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 编辑个人信息 -->
    <div class="profile-box" v-else>
      <div class="profile-header">
        <h2>修改个人信息</h2>
        <el-button @click="toggleEditMode">
          <el-icon><Close /></el-icon> 取消
        </el-button>
      </div>
      
      <el-form :model="profileForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload">
            <img :src="profileForm.avatar" alt="头像预览" class="avatar-preview" />
            <el-upload
              class="avatar-uploader"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              :before-upload="beforeAvatarUpload"
              style="margin-top: 10px"
            >
              <el-button type="primary">
                <el-icon><Upload /></el-icon> 上传头像
              </el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="图形验证码">
          <div class="captcha-box">
            <el-input
              v-model="verifyCodeForm.imageCode"
              placeholder="请输入图形验证码"
              size="large"
              prefix-icon="Key"
            />
            <img :src="captchaUrl" alt="验证码" class="captcha-img" @click="getCaptcha" />
          </div>
        </el-form-item>
        <el-form-item label="验证码">
          <div class="input-with-btn">
            <el-input v-model="profileForm.verifyCode" placeholder="请输入验证码" />
            <el-button
              type="primary"
              :disabled="countdown > 0 || sendingCode"
              @click="sendVerifyCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="原密码">
          <el-input
            v-model="profileForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="profileForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleUpdateProfile">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-box {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.profile-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: bold;
}

/* 个人资料展示样式 */
.profile-info {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.avatar-section h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.avatar-section .username {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.info-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-item .value {
  font-size: 16px;
  color: #333;
}

.info-item .value.balance {
  color: #f56c6c;
  font-weight: bold;
}

/* 编辑模式样式 */
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
}

.avatar-uploader .el-upload {
  width: 100%;
}

.avatar-uploader .el-button {
  width: 100%;
}

.input-with-btn {
  display: flex;
  gap: 10px;
  width: 100%;
}

.input-with-btn .el-input {
  flex: 1;
}
.captcha-box {
  display: flex;
  gap: 10px;
  width: 100%;
}

.captcha-box .el-input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  
  .profile-box {
    padding: 20px;
  }
  
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    width: 100%;
  }
  
  .info-item {
    align-items: center;
  }
}
</style>