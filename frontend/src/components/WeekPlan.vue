<template>
    <div class="container">
      <div class="row justify-content-between">
        <div class="col-auto">
          <h1>{{ $t('headlines.weekPlan') }}</h1>
        </div>
        <div class="col-auto">
          <button class="btn btn-danger" @click="deleteFromWeekPlan()">
            <i class="bi bi-x-lg"></i>
            <span class="ms-1">{{ $t('labels.clearWeekPlan') }}</span>
          </button>
        </div>
      </div>
      <div v-if="loaded" class="container">
        <div class="row justify-content-center gx-4 gy-2">
          <div class="col-auto" v-for="recipe in $root.user.weekPlan" :key="recipe._id">
            <WeekPlanRecipeTile :numberOfPortions="recipe.numberOfPortions" :recipe="recipes[recipe.recipe]" @clicked="router.push(`/recipes/${recipe.recipe}`)"></WeekPlanRecipeTile>
          </div>
        </div>
      </div>
    </div>
</template>
<script>
import WeekPlanRecipeTile from './WeekPlan/WeekPlanRecipeTile.vue'
import axios from 'axios'
export default {
    name: 'WeekPlan',
  components: {
    WeekPlanRecipeTile
  },
  data() {
    return {
      recipes: {},
      loaded: false,
    }
  },
  props: {},
  methods: {
    async deleteFromWeekPlan(id) {
      try {
        const res = await axios.delete(
          process.env.VUE_APP_BACKEND_URL + '/api/weekplan',
          { 
            params: {id: id},
            withCredentials: true,
          },
        )
        if (res.status === 200) {
          
          this.$root.user.weekPlan = res.data.result
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
  async beforeMount() {
    if (!this.$root.loaded) {
      await this.$root.load()
    }
    for(const recipe of this.$root.user.weekPlan){
      this.recipes[recipe.recipe] = await this.$root.getter('recipes', {id: recipe.recipe})
    }
    this.loaded = true
  }
}
</script>
<style>
    
</style>