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
            <router-link v-if="auth" to="/settings" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-4 bi bi-gear"></i>
              <span class="ms-1 d-none d-md-block">{{ $t('headlines.settings') }}</span>
            </router-link>
          </div>
            <template v-if="auth">
              <div>
                <div class="nav-link link-dark d-flex align-items-center">
                <i class="fs-4 bi bi-person-circle"></i>
                <span class="ms-1 d-none d-md-block">{{ name }}</span>
              </div>
              </div>
              <div>
              <a class="nav-link link-dark d-flex align-items-center" href="#" @click="logout">
                <i class="fs-4 bi bi-box-arrow-left"></i>
                <span class="ms-1 d-none d-md-block">{{ $t('headlines.logout') }}</span>
              </a>
              </div>
            </template>
            <div v-else>
              <router-link to="/login" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-4 bi bi-box-arrow-in-right"></i>
              <span class="ms-1 d-none d-md-block">{{ $t('headlines.login') }}</span>
            </router-link>
            </div>
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="position-absolute top-50 start-50 translate-middle">
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
    <router-view :class="isLoading ? 'd-none' : 'd-block'" />

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
      name: '',
      reload: null,
      isLoading: true,
    }
  },
  methods: {
    async getUser() {
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/user', {
          withCredentials: true,
        })
        this.name = res.data.user.name
        this.auth = res.status === 200
        this.isLoading = false
      } catch (error) {
        this.$router.push('/login')
      }
    },
    async logout(){
      console.log('test')
      try {
        const res = await axios.delete(process.env.VUE_APP_BACKEND_URL + '/api/logout', {
          withCredentials: true,
        })
        if(res.status === 200){
          this.auth = false
          this.name = ''
          this.$router.push('/login')
        }else{
          console.log(res)
        }
      } catch (error) {
        console.log(error.response.data)
      }
    }
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
