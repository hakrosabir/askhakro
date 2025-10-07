import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SignUp from '@/components/SignUp.vue'
import SignUpView from '@/views/SignUpView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },

  {
    path:'/signup',
    name:'signup',
    component:SignUpView
  }
  ,
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
      ,
  {
    path: '/login',
    name: 'login',
    component: import(/* webpackChunkName: "about" */ '../views/LoginView.vue')
  }
,
  {
    path: '/mychat',
    name: 'mychat',
     component: import(/* webpackChunkName: "about" */ '../views/Chat1View.vue')
}

]


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
