<template>
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
    <el-button type="primary" @click="loginFunction">Login</el-button>
  </div>

  
  <div>
    <router-link to="/signup">
      <el-button type="primary">Sign up here!</el-button>
    </router-link>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const username = ref('')
const password = ref('')

const loginFunction = async () => {
  try {
    const response = await axios.post("http://localhost:8081/userinfoa/login3", {
      username: username.value,
      password: password.value
    })

    if (response.data === "fail") {
      open4()
    }
    if (response.data === "success") {
      open2()
    }

    console.log(response.data)
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error('Network error! Please try again.')
  }
}

const open4 = () => {
  ElMessage.error("Oops, Username or password is wrong!")
}

const open2 = () => {
  ElMessage.success("Login Successfully!")
}
</script>

<style scoped>
div {
  margin-bottom: 12px;
}



a {
  text-decoration: none;
}
</style>