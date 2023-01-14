import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/Login.vue'
import RegisterPage from '../components/Register.vue'
import SettingsPage from '../components/Settings.vue'
import RecipeOverview from '../components/Recipes.vue'
import WeekPlan from '../components/WeekPlan.vue'
import ShoppingList from '../components/ShoppingList.vue'
import axios from 'axios'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false}
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresAuth: false}
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { requiresAuth: true}
  },
  {
    path: '/recipes/:recipeId([0-9a-fA-F]{24})?/:customNumberOfPortions(\\d+)?',
    name: 'Recipes',
    component: RecipeOverview,
    meta: { requiresAuth: true},
    props: true
  },
  {
    path: '/week-plan',
    name: 'WeekPlan',
    component: WeekPlan,
    meta: { requiresAuth: true}
  },
  {
    path: '/shopping-list',
    name: 'ShoppingList',
    component: ShoppingList,
    meta: { requiresAuth: true}
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/recipes'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
  }
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
