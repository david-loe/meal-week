<template>
  <div class="text-center" id="loginPage">
    <form class="form-signin" @submit.prevent="register()">
      <i class="bi bi-egg-fried" style="font-size: 8rem"></i>
      <h3 class="h3 mb-1">{{ $t('register.welcomeTo') }}</h3>
      <h2 class="h2 mb-4">{{$t('headlines.weekOfMeals')}}</h2>

      <div class="form-floating">
        <input type="text" class="form-control" id="name" :placeholder="$t('labels.name')" v-model="name" required />
        <label for="name">{{ $t('labels.name') }}</label>
      </div>
      <div class="form-floating">
        <input type="email" class="form-control" id="email" :placeholder="$t('labels.email')" v-model="email" required />
        <label for="email">{{ $t('labels.email') }}</label>
      </div>
      <div class="form-floating">
        <input
          type="password"
          class="form-control"
          id="password"
          :placeholder="$t('labels.password')"
          v-model="password"
          autocomplete="new-password"
          required
        />
        <label for="password">{{ $t('labels.password') }}</label>
      </div>

      <button class="w-100 btn btn-lg btn-primary" type="submit">{{$t('register.createAccount')}}</button>
    </form>
    <div class="mt-2">
      <router-link to="/login" class="link-dark">
        {{ $t('register.login') }}
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RegisterPage',
  data() {
    return {
      name: '',
      password: '',
      email: '',
    }
  },
  methods: {
    async register() {
      try {
        const res = await axios.post(
          process.env.VUE_APP_BACKEND_URL + '/register',
          {
            name: this.name,
            email: this.email,
            password: this.password,
          }
        )
        if (res.status === 200) {
          this.$router.push('/login')
        }
      } catch (error) {
        this.password = ''
        this.$root.addAlert({message: error.response.data.message, title: "ERROR", type: "danger"})
        console.log(error.response.data)
      }
    },
  },
  beforeMount() {
    this.$root.loadState = 'LOADED'
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loginPage {
  height: 100%;
  display: flex;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #f5f5f5;
}

.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
}

.form-signin .checkbox {
  font-weight: 400;
}

.form-signin .form-floating:focus-within {
  z-index: 2;
}

.form-signin input[type='text'] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type='email'] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.form-signin input[type='password'] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
