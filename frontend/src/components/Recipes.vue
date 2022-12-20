<template>
  <div>
    <div class="modal fade" id="recipeModal" tabindex="-1" aria-labelledby="recipeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 v-if="modalMode === 'add'" class="modal-title" id="recipeModalLabel">{{ $t('recipes.new') }}</h5>
            <h5 v-else-if="modalMode === 'view' || modalMode === 'edit'" class="modal-title" id="recipeModalLabel">{{ modalRecipe.name }}<small>{{' ' + $t('labels.by') + ' ' + modalRecipe.author.name}}</small></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <RecipePage v-if="modalMode === 'view'" :recipe="modalRecipe" :customNumberOfPortions="modalPortions" :showTitle="false" @new-reviews="(a)=>modalRecipe.reviews = a" @new-likes="(a)=>modalRecipe.likes = a" @show-edit-form="showModal('edit', modalRecipe)" @add-to-week-plan="(w,n)=>addToWeekPlan(modalRecipe._id,w,n)" @deleted="deleteRecipe(modalRecipe._id)"></RecipePage>
            <RecipeForm v-else-if="modalMode === 'add' || modalMode === 'edit'" :mode="modalMode" @cancel="recipeModal.hide()" :recipe="modalRecipe" @add="addRecipe" @edit="addRecipe"></RecipeForm>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row justify-content-between">
        <div class="col-auto">
          <h1>{{ $t('headlines.recipes') }}</h1>
        </div>
        <div class="col-auto">
          <button class="btn btn-secondary" @click="showModal('add')">
            <i class="bi bi-plus-lg"></i>
            <span class="ms-1">{{ $t('recipes.add') }}</span>
          </button>
        </div>
      </div>
      
      <div class="input-group w-50 mx-auto mt-2 mb-2">
        <span class="input-group-text">
          <i class="bi bi-search"></i>
        </span>
        <input class="form-control" type="text" :placeholder="$t('labels.search')" v-model="filter.search"/>
      </div>
        <div class="bg-light rounded-3 px-3 py-2 mx-auto mb-4" style="max-width:500px;">
          <h6>{{$t('labels.filter') + ':'}}</h6>
          <div class="row gy-1">
            <div class="col-auto">
              <select class="form-select form-select-sm" v-model="filter.recipeCategories">
                <option :value="null" selected>{{ $t('labels.recipeCategory') }}</option>
                <option v-for="category in $root.recipeCategories" :value="category._id" :key="category._id">
                  {{ $t(category.name) + ' ' + (category.emoji ? ' ' + category.emoji : '') }}
                </option>
              </select>
            </div>
            <div class="col-auto">
              <select class="form-select form-select-sm" v-model="filter.tags">
                <option :value="null" selected>{{ $t('labels.tag') }}</option>
                <option v-for="tag in $root.tags" :value="tag._id" :key="tag._id">
                  {{ $t(tag.name) + ' ' + (tag.emoji ? ' ' + tag.emoji : '') }}
                </option>
              </select>
            </div>
            <div class="col-auto">
              <div class="border rounded-2 px-2" style="color: #ec4a57;" @click="filter.likes ? filter.likes=null : filter.likes=$root.user._id">
                <i v-if="filter.likes" class="bi bi-heart-fill"></i>
                <i v-else class="bi bi-heart"></i>
              </div>
            </div>
          </div>
        </div>
      <div class="container">
        <div class="row justify-content-center gx-4 gy-2">
          <div class="col-auto" v-for="recipe in recipes" :key="recipe._id">
            <RecipeTile :recipe="recipe" @new-reviews="(a)=>recipe.reviews = a" @new-likes="(a)=>modalRecipe.likes = a" @clicked="showModal('view', recipe)"></RecipeTile>
          </div>
          <div v-if="meta.page < meta.countPages" class="col-auto">
            <div class="card" style="width: 18rem">
              <div class="card-body position-relative">
                <div class="position-absolute top-0 end-0 pe-1 placeholder-glow" style="width: 45%">
                  <span class="placeholder col-2 bg-danger me-3"></span>
                  <span class="placeholder col-7 bg-warning"></span>
                </div>
                  <h5 class="card-title placeholder-glow"><span class="placeholder col-6"></span></h5>
                  <p><button class="btn btn-light btn-sm" type="button" @click="loadMoreRecipes()">{{$t('labels.loadMoreRecipes')}}</button></p>
              </div>
              <div class="card-footer placeholder-glow">
                <small class="text-muted">
                  <span class="placeholder col-5 placeholder-sm"></span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RecipeTile from './Recipes/RecipeTile.vue'
import RecipeForm from './Recipes/RecipeForm.vue'
import RecipePage from './Recipes/RecipePage.vue'
import { Modal } from 'bootstrap'
import axios from 'axios'
export default {
  name: 'Recipes',
  components: {
    RecipeTile,
    RecipeForm,
    RecipePage
  },
  data() {
    return {
      filter: {limit: 3, search: '', recipeCategories: null, tags: null, likes: null},
      recipeModal: undefined,
      recipes: [],
      modalMode: '',
      modalRecipe: {},
      modalPortions: null,
      throttlePause: false,
      meta: {count: 1, countPages: 1, limit: 99, page: 1}
    }
  },
  props: {recipeId: {type: String}, customNumberOfPortions: {type: String, default: 'null'}},
  methods: {
    async getRecipes(params) {
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/recipes', {
          params: params,
          withCredentials: true,
        })
        if (res.status === 200) {
          if(res.data.meta){
            this.meta = res.data.meta
          }else{
            this.meta = {count: 1, countPages: 1, limit: 99, page: 1}
          }
          return res.data.data
          
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
    async addRecipe(recipe) {
      try {
        const res = await axios.post(process.env.VUE_APP_BACKEND_URL + '/api/recipes', recipe, {
          withCredentials: true,
        })
        if (res.status === 200) {
          this.recipeModal.hide()
          this.recipes = await this.getRecipes(this.filter)
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
    async deleteRecipe(id) {
      try {
        const res = await axios.delete(process.env.VUE_APP_BACKEND_URL + '/api/recipes', {
          params: {id: id},
          withCredentials: true,
        })
        if (res.status === 200) {
          this.recipeModal.hide()
          this.recipes = await this.getRecipes(this.filter)
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
    async addToWeekPlan(recipeId, weekday, numberOfPortions) {
      try {
        const res = await axios.post(process.env.VUE_APP_BACKEND_URL + '/api/week-plan',
          {recipeId: recipeId, numberOfPortions: numberOfPortions, weekday: weekday},
          {withCredentials: true}
        )
        if (res.status === 200) {
          this.$root.user.weekPlan = res.data.result
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
    showModal(mode, recipe, customNumberOfPortions = null){
      this.modalMode = mode
      this.modalRecipe = recipe
      this.modalPortions = customNumberOfPortions
      this.recipeModal.show()
    },
    infinitScroll(){
      this.throttle(this.loadMoreRecipes, 50)
    },
    async loadMoreRecipes() {
      if(this.meta.page < this.meta.countPages){
        const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 88; // height of placeholder: 288
        if(endOfPage){
          const filterNext = Object.assign({}, this.filter, {limit: this.meta.limit, page: this.meta.page + 1})
          this.recipes = this.recipes.concat(await this.getRecipes(filterNext))
          return true
        }
      }
      return false
    },
    async throttle(callback, time) {
      if (this.throttlePause) return true;
    
      this.throttlePause = true;
      setTimeout(() => {
        this.throttlePause = false;
      }, time);
      return await callback();
    }
  },
  async mounted() {
    this.recipeModal = new Modal(document.getElementById('recipeModal'), {})
    //var loadCount = 0
    if(window.innerWidth >= this.$root.bp.md) this.filter.limit = 6
    if(window.innerWidth >= this.$root.bp.lg) this.filter.limit = 9
    if(window.innerWidth >= this.$root.bp.xl) this.filter.limit = 12
    this.recipes = await this.getRecipes(this.filter)
  },
  async beforeMount() {
    await this.$root.load()
    if(this.recipeId.match(/^[0-9a-fA-F]{24}$/)){
      this.showModal('view', await this.getRecipes({id: this.recipeId}), parseInt(this.customNumberOfPortions))
    }
    window.addEventListener("scroll", this.infinitScroll)
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.infinitScroll);
  },
  watch: {
    recipeId: async function() {
      if(this.recipeId.match(/^[0-9a-fA-F]{24}$/)){
        this.showModal('view', await this.getRecipes({id: this.recipeId}), parseInt(this.customNumberOfPortions))
      }
    },
    filter: {
      async handler() {
        this.recipes = await this.getRecipes(this.filter)
      },
      deep: true
    }
  },
}
</script>

<style></style>
