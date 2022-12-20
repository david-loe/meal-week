<template>
  <div class="container mb-3">
    <h2>{{ $t('headlines.account') }}</h2>
    <div class="container">
      <h3>{{ $t('settings.account.changePassword') }}</h3>
      <form @submit.prevent="changePassword(oldPassword, newPassword)" style="max-width: 300px">
        <div class="mb-2">
          <label class="form-label" for="oldPassword">{{ $t('labels.oldPassword') }}</label>
          <input type="password" class="form-control" id="oldPassword" v-model="oldPassword" required />
        </div>
        <div class="mb-2">
          <label class="form-label" for="newPassword">{{ $t('labels.newPassword') }}</label>
          <input type="password" class="form-control" id="newPassword" v-model="newPassword" required />
        </div>
        <div class="mb-2">
          <label class="form-label" for="newPassword2">{{ $t('labels.repeateNewPassword') }}</label>
          <input type="password" class="form-control" id="newPassword2" v-model="newPassword2" :pattern="newPassword" required />
        </div>
        <button type="submit" class="btn btn-secondary position-relative">
          {{ $t('settings.account.changePassword') }}
          <span v-if="changePasswordSuccess"  class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-success">
            ✔
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Account',
  data() {
    return {
      changePasswordSuccess: false,
      newPassword: '',
      newPassword2: '',
      oldPassword: '',
    }
  },
  props: [],
  components: {},
  methods: {
    async changePassword(oldPassword, newPassword) {
      try {
        const res = await axios.post(
          process.env.VUE_APP_BACKEND_URL + '/api/user/password',
          { newPassword: newPassword, oldPassword: oldPassword },
          {
            withCredentials: true,
          },
        )
        if (res.status === 200) {
          this.newPassword = ''
          this.newPassword2 = ''
          this.oldPassword = ''
          this.changePasswordSuccess = true
        }
      } catch (error) {
        if (error.response.status === 401) {
          alert(this.$t('alerts.wrongPassword'))
        } else {
          console.log(error.response.data)
          this.$root.addAlert({message: error.response.data.message, title: "ERROR"})
        }
      }
    },
  },
}
</script>

<style>
</style>