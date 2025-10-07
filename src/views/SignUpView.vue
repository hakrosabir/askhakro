<template>
  <div>
    <h2>Register here!</h2>
    
    <div>
      <el-input v-model="username" style="width: 240px" placeholder="Username" />
    </div>
    <div>
      <el-input 
        v-model="password" 
        style="width: 240px" 
        type="password" 
        placeholder="Password" 
        show-password 
      />
    </div>
    <div>
      <el-input v-model="email" style="width: 240px" placeholder="Email" />
    </div>
    
    <div style="margin-top: 12px">
      <el-button type="success" @click="signUpFunction">Create Account</el-button>
    </div>
    
    <!-- Optional: Back to login link -->
    <div style="margin-top: 12px">
      <router-link to="/login">
        <el-button type="text">Already have an account? Login</el-button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const email = ref('')
const router = useRouter()

const signUpFunction = async () => {
  if (!username.value || !password.value || !email.value) {
    ElMessage.warning('Please fill all fields')
    return
  }

  try {
    const response = await axios.post("http://localhost:8081/userinfoa/signup", {
      username: username.value,
      password: password.value,
      email: email.value
    })

    if (response.data === "success") {
      ElMessage.success("Account created! Redirecting to login...")
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else if (response.data === "user_exists") {
      ElMessage.error("Username already exists!")
    } else {
      ElMessage.error("Signup failed!")
    }
  } catch (error) {
    ElMessage.error("Network error!")
  }
}
</script>