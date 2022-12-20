<template>
  <div style="color: #ffcd3c" @mouseover="hover = true" @mouseleave="hover = false">
    <template v-if="hover">
      <template v-if="stars.selected === null">
        <span v-for="star in 5" :key="star" @mouseover="stars.hovered = star" @click="setUserRating(star)">
          <i :class="star <= stars.hovered ? 'bi bi-star-fill' : 'bi bi-star'"></i>
        </span>
      </template>
      <template v-else>
        <span v-for="star in 5" :key="star" @click="setUserRating(star)">
          <i :class="star <= stars.selected ? 'bi bi-star-fill' : 'bi bi-star'"></i>
        </span>
      </template>
    </template>
    <template v-else>
      <i v-for="star in stars.full" class="bi bi-star-fill" :key="star"></i>
      <i v-for="star in stars.half" class="bi bi-star-half" :key="star"></i>
      <i v-for="star in stars.empty" class="bi bi-star" :key="star"></i>
    </template>
    <small> ({{ reviews.length }})</small>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'RecipeRating',
  emits: ['new-reviews'],
  data() {
    return {
      hover: false,
      stars: {
        full: 0,
        empty: 5,
        half: 0,
        selected: null,
        hovered: 0,
      },
    }
  },
  props: {
    reviews: { type: Array },
    recipeId: { type: String },
  },
  methods: {
    calcRating(reviews) {
      var sum = 0
      for (const review of reviews) {
        sum += review.assessment
      }
      var rating = reviews.length > 0 ? sum / reviews.length : 0
      this.stars.full = Math.floor(rating)
      if (rating - this.stars.full >= 0.75) {
        this.stars.full++
      } else if (rating - this.stars.full >= 0.25) {
        this.stars.half++
      }
      this.stars.empty = 5 - (this.stars.full + this.stars.half)
    },
    getUserRating() {
      for (const review of this.reviews) {
        if (review.author == this.$root.user._id) {
          this.stars.selected = review.assessment
          break
        }
      }
    },
    async setUserRating(rating) {
      try {
        const res = await axios.post(
          process.env.VUE_APP_BACKEND_URL + '/api/reviews',
          { assessment: rating, recipeId: this.recipeId },
          {
            withCredentials: true,
          },
        )
        if (res.status === 200) {
          this.$emit('new-reviews', res.data.result)
          this.stars.selected = rating
          this.calcRating(res.data.result)
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
          this.$root.addAlert({message: error.response.data.message, title: "ERROR"})
        }
      }
    },
  },
  async beforeMount() {
    await this.$root.load()
    this.calcRating(this.reviews)
    this.getUserRating()
  },
  watch: {
    reviews: function () {
      this.calcRating(this.reviews)
      this.getUserRating()
    },
  },
}
</script>

<style></style>
