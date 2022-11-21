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
    <div v-if="loaded">
      <table class="table align-middle">
        <thead>
          <tr>
            <th scope="col">
              {{ window.width >= $root.bp.md ? $t('labels.weekday') : '' }}
            </th>
            <th scope="col">
              {{ $t('labels.recipe') }}
            </th>
            <th scope="col">
              {{ $t('labels.' + (window.width >= $root.bp.md ? 'numberOfPortions' : 'portions')) }}
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        <tr v-for="m in matrix" :key="m.k">
          <th v-if="m.f" scope="col" :rowspan="m.l">{{ $t((window.width >= $root.bp.md ? 'weekdays.' : 'weekdaysShort.') + (m.w)) }}</th>
          <template v-if="m.e">
            <td colspan="3"></td>
          </template>
          <template v-else>
            
            <td>
              <router-link :to="'/recipes/'+m.r.recipe+'/'+m.r.numberOfPortions" class="nav-link">
              <img v-if="recipes[m.r.recipe].image" :src="recipes[m.r.recipe].image" class="rounded" alt="" height="38" width="38" style="object-fit: cover;" />
              {{recipes[m.r.recipe].name}}
              </router-link>
            </td>
            <td>
              <div :class="'input-group' + (window.width >= $root.bp.md ? '' : ' input-group-sm')">
                <input type="number" class="form-control" id="numberOfPortionsInput" min="1" v-model="m.r.numberOfPortions" :style="'max-width:' + (window.width >= $root.bp.md ? '5em;': '2.5em;')">
                <button type="button" class="btn btn-outline-secondary" @click="changeNumberOfPortions(m.r.recipe, m.w, m.r.numberOfPortions)">
                  <i class="bi bi-save"></i>
                </button>
              </div>
            </td>
            <td>
              <button type="button" :class="'btn btn-danger' + (window.width >= $root.bp.md ? '' : ' btn-sm')" @click="deleteFromWeekPlan(m.r.recipe, m.w)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
            
          </template>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  name: 'WeekPlan',
  components: {
  },
  data() {
    return {
      recipes: {},
      window: {width: 1},
      todaysWeekday: 0,
      loaded: false,
      matrix: []
    }
  },
  props: {},
  methods: {
    async deleteFromWeekPlan(id, weekday) {
      try {
        const res = await axios.delete(process.env.VUE_APP_BACKEND_URL + '/api/week-plan', {
          params: { id: id, weekday: weekday },
          withCredentials: true,
        })
        if (res.status === 200) {
          this.$root.user.weekPlan = res.data.result
          this.renderMatrix()
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
    async changeNumberOfPortions(id, weekday, newNumberOfPortions) {
      try {
        const res = await axios.post(
          process.env.VUE_APP_BACKEND_URL + '/api/week-plan',
          {
            recipeId: id,
            numberOfPortions: newNumberOfPortions,
            weekday: weekday
          },
          {
            withCredentials: true,
          },
        )
        if (res.status === 200) {
          this.$root.user.weekPlan = res.data.result
          this.renderMatrix()
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
    renderMatrix(){
      this.matrix = []
      var count = 0;
      for(var w = 0; w <= 6;w++){
        var calcW = (w + this.todaysWeekday + 1) % 7
        if(this.$root.user.weekPlan[calcW].length === 0){
          this.matrix.push({w: calcW, e: true, f: true, l: 1, k: count++ })
        }
        for(var r = 0; r<this.$root.user.weekPlan[calcW].length; r++){
          var f = false
          if(r === 0){
            f = true
          }
          this.matrix.push({w: calcW, e: false, f: f, l: this.$root.user.weekPlan[calcW].length, k: count++, r: this.$root.user.weekPlan[calcW][r] })
        }
      }
    }
  },
  async beforeMount() {
    this.todaysWeekday = new Date().getDay()
    this.window.width = window.innerWidth
    await this.$root.load()
    for (const recipeId of [... new Set(this.$root.user.weekPlan.map(d => d.map( r => r.recipe)).flat())]) {
      this.recipes[recipeId] = await this.$root.getter('recipes', { id: recipeId })
    }
    this.renderMatrix()
    this.loaded = true
  },
}
</script>
<style>
</style>