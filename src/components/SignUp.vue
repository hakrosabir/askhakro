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
    <div>
      <el-date-picker
        v-model="birthday"
        type="date"
        placeholder="Pick birthday"
        style="width: 240px"
      />
    </div>
    
    <div style="margin-top: 12px">
      <el-button type="success" @click="signUpFunction">Sign Up</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const username = ref('')
const password = ref('')
const email = ref('')
const birthday = ref('')

const signUpFunction = async () => {
  if (!username.value || !password.value || !email.value) {
    ElMessage.warning('Please fill all fields')
    return
  }

  try {
    const response = await axios.post("http://localhost:8081/userinfoa/signup", {
      username: username.value,
      password: password.value,
      email: email.value,
      birthday: birthday.value 
    })

    if (response.data === "success") {
      ElMessage.success("Account created! Please login.")
      // Clear fields
      username.value = ''
      password.value = ''
      email.value = ''
      birthday.value = ''
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