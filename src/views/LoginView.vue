<template>
     <div>
    <h1> login Page here!!!!!</h1>
    
     <loginVue/> 
    <!--data:{{ data }}
    <HelloVue/> 
    <button @click="sendMsgToBackEnd1"> Send Message to Backend  </button>
    -->
    
   
    </div>

</template>


<script setup>
    import axios from 'axios'
    import HelloVue from '@/components/HelloVue.vue'
    import loginVue from '@/components/login.vue'
    import {ref} from 'vue'
    const data= ref(null)
    const sendMsgToBackEnd1 =  async()=> {

        const response = await axios.get("http://localhost:8081/userinfoa/showUserinfo")
        data.value = response.data 
        console.log()


    }

    


</script>


<style>
</style>