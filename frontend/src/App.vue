<template>
  <div>
    <header class="mb-3 border-bottom bg-white bg-opacity-25">
      <div class="container">
        <div class="d-flex flex-row align-items-center nav">
          <div class="me-auto">
            <a href="/" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-1 bi bi-egg-fried"></i>
              <span class="fs-4 ms-2 d-none d-md-block">{{ $t('headlines.weekOfMeals') }}</span>
            </a>
          </div>
          <div>
            <router-link v-if="auth" to="/recipes" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-4 bi bi-card-list"></i>
              <span class="ms-1 d-none d-md-block">{{ $t('headlines.recipes') }}</span>
            </router-link>
          </div>
          <div>
            <router-link v-if="auth" to="/weekplan" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-4 bi bi-calendar-week"></i>
              <span class="ms-1 d-none d-md-block">{{ $t('headlines.weekPlan') }}</span>
            </router-link>
          </div>
          <div v-if="auth" class="dropdown">
            <a class="nav-link link-dark d-flex align-items-center dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button">
              <i class="fs-4 bi bi-person-circle"></i>
              <span class="ms-1 d-none d-md-block">{{ user.name }}</span>
            </a>
            <ul class="dropdown-menu" style="min-width: 0px">
              <li>
                <router-link to="/settings" class="nav-link link-dark d-flex align-items-center">
                  <i class="fs-4 bi bi-gear"></i>
                  <span class="ms-1">{{ $t('headlines.settings') }}</span>
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a class="nav-link link-dark d-flex align-items-center" href="#" @click="logout">
                  <i class="fs-4 bi bi-box-arrow-left"></i>
                  <span class="ms-1">{{ $t('headlines.logout') }}</span>
                </a>
              </li>
            </ul>
          </div>
          <div v-else>
            <router-link to="/login" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-4 bi bi-box-arrow-in-right"></i>
              <span class="ms-1 d-none d-md-block">{{ $t('headlines.login') }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <div v-if="loadState !== 'LOADED'" class="position-absolute top-50 start-50 translate-middle">
      <div class="spinner-grow me-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="spinner-grow me-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="spinner-grow" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <router-view :class="loadState === 'LOADED' ? 'd-block' : 'd-none'" />

    <footer class="py-3 border-top">
      <div class="container">
        <div class="d-flex align-items-center">
          <a href="/" class="text-decoration-none link-dark lh-1">
            <i class="fs-3 bi bi-egg-fried"></i>
          </a>
          <span class="ps-2 text-muted">© {{ new Date().getFullYear() }} {{ $t('headlines.weekOfMeals') }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      auth: false,
      user: {},
      reload: null,
      loadState: 'UNLOADED',
      loadingPromise: null,
      tags: [],
      itemCategories: [],
      recipeCategories: []
    }
  },
  methods: {
    async load() {
      if(this.loadState === 'UNLOADED'){
        this.loadState = 'LOADING'
        this.loadingPromise = new Promise(async (resolve) => { // eslint-disable-line no-async-promise-executor
          this.user = await this.getter('user')
          if(Object.keys(this.user).length > 0){
            this.auth = true
          }
          this.itemCategories = await this.getter('itemCategories')
          this.tags = await this.getter('tags')
          this.recipeCategories = await this.getter('recipeCategories')
          this.loadState = 'LOADED'
          resolve()
        })
        await this.loadingPromise
      }else if(this.loadState === 'LOADING'){
        await this.loadingPromise
      }
    },
    async logout() {
      try {
        const res = await axios.delete(process.env.VUE_APP_BACKEND_URL + '/api/logout', {
          withCredentials: true,
        })
        if (res.status === 200) {
          this.auth = false
          this.user = {}
          this.$router.push('/login')
        } 
      } catch (error) {
        console.log(error.response.data)
      }
    },
    async getter(endpoint, params = {}) {
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/' + endpoint, {
          params: params,
          withCredentials: true,
        })
        if (res.status === 200) {
          return res.data.data
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
  },
  beforeMount() {
    document.title = this.$t('headlines.weekOfMeals') + ' ' + this.$t('headlines.emoji')
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  position: relative;
  min-height: 100%;
}
body {
  margin-bottom: 75px !important; /* Margin bottom by footer height */
}
footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60px; /* Set the fixed height of the footer here */
  z-index: -999;
}
</style>
