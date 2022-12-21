<template>
  <div style="color: #ec4a57">
    <template v-if="liked">
      <i class="bi bi-heart-fill" @click="unlike()"></i>
    </template>
    <template v-else>
      <i class="bi bi-heart" @click="like()"></i>
    </template>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'RecipeLike',
  emits: ['new-likes'],
  data() {
    return {
      liked: false
    }
  },
  props: {
    likes: { type: Array },
    recipeId: { type: String },
  },
  methods: {
    getUserLike() {
      this.liked = false
      for (const like of this.likes) {
        if (like == this.$root.user._id) {
          this.liked = true
          break
        }
      }
    },
    async like() {
      try {
        const res = await axios.post(
          process.env.VUE_APP_BACKEND_URL + '/api/likes',
          { recipeId: this.recipeId },
          {
            withCredentials: true,
          },
        )
        if (res.status === 200) {
          this.$emit('new-likes', res.data.result)
          this.liked = true
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
          this.$root.addAlert({message: error.response.data.message, title: "ERROR", type: "danger"})
        }
      }
    },
    async unlike() {
      try {
        const res = await axios.delete(
          process.env.VUE_APP_BACKEND_URL + '/api/likes',
          { 
            params: {recipeId: this.recipeId},
            withCredentials: true,
          },
        )
        if (res.status === 200) {
          this.$emit('new-likes', res.data.result)
          this.liked = false
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
          this.$root.addAlert({message: error.response.data.message, title: "ERROR", type: "danger"})
        }
      }
    },
  },
  async beforeMount() {
    await this.$root.load()
    this.getUserLike()
  },
  watch: {
    likes: function () {
      this.getUserLike()
    },
  },
}
</script>

<style></style>
