<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/user'

const router = useRouter()

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  verifyCode: '',
})

const verifyCodeForm = reactive({
  target: '',
  uuid: '',
  imageCode: '',
})


const captchaUrl = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

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
  if (!registerForm.phone && !registerForm.email) {
    ElMessage.warning('请输入手机号或邮箱')
    return
  }

  if (registerForm.phone && !/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  if (registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    ElMessage.warning('请输入正确的邮箱')
    return
  }

  if (!verifyCodeForm.imageCode) {
    ElMessage.warning('请输入图形验证码')
    return
  }

  verifyCodeForm.target = registerForm.phone || registerForm.email

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
    ElMessage.error('发送验证码失败')
  } finally {
    sendingCode.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.username) {
    ElMessage.warning('请输入用户名')
    return
  }

  if (!registerForm.password) {
    ElMessage.warning('请输入密码')
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning('两次密码输入不一致')
    return
  }

  if (!registerForm.phone && !registerForm.email) {
    ElMessage.warning('请输入手机号或邮箱')
    return
  }

  if (!registerForm.verifyCode) {
    ElMessage.warning('请输入验证码')
    return
  }

  loading.value = true
  try {
    await authApi.register(registerForm)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    ElMessage.error('注册失败,请重试')
    getCaptcha()
  } finally {
    loading.value = false
  }
}

getCaptcha()
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h2>账号注册</h2>
      <el-form :model="registerForm" label-width="0">
        <el-form-item>
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号（选填）"
            size="large"
            prefix-icon="Phone"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱（选填）"
            size="large"
            prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item>
          <div class="verify-box">
            <el-input
              v-model="registerForm.verifyCode"
              placeholder="请输入验证码"
              size="large"
              prefix-icon="Key"
            />
            <el-button
              type="primary"
              size="large"
              :disabled="countdown > 0 || sendingCode"
              @click="sendVerifyCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
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
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleRegister" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  width: 450px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.register-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.verify-box {
  display: flex;
  gap: 10px;
  width: 100%;
}

.verify-box .el-input {
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

.register-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
  margin-left: 5px;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
