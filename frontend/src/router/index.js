import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Settings from '../components/Settings.vue'
import Home from '../components/Home.vue'
import Recipes from '../components/Recipes.vue'
import WeekPlan from '../components/WeekPlan.vue'
import axios from 'axios'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false}
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false}
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true}
  },
  {
    path: '/recipes/:recipeId([0-9a-fA-F]{24})?',
    name: 'Recipes',
    component: Recipes,
    meta: { requiresAuth: true},
    props: true
  },
  {
    path: '/weekplan',
    name: 'WeekPlan',
    component: WeekPlan,
    meta: { requiresAuth: true}
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true}
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

async function auth() {
  var auth = false;
  try {
    const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/user', {
      withCredentials: true,
    })
    auth = res.status === 200
  } catch (error) {
    console.log(error)
  }
  return auth
}

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && !await auth()) {
    return {
      path: '/login',
    }
  }
})


export default router
