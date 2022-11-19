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
            <RecipePage v-if="modalMode === 'view'" :recipe="modalRecipe" :customNumberOfPortions="modalPortions" :showTitle="false" @new-reviews="(a)=>modalRecipe.reviews = a" @new-likes="(a)=>modalRecipe.likes = a" @show-edit-form="showModal('edit', modalRecipe)" @add-to-week-plan="(w,n)=>addToWeekPlan(modalRecipe._id,w,n)"></RecipePage>
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
              <div class="border rounded-2 px-2" style="color: #ec4a57;" @click="filter.likes ? filter.likes=undefined : filter.likes=$root.user._id">
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
      filter: {search: '', recipeCategories: null, tags: null},
      recipeModal: undefined,
      recipes: [],
      modalMode: '',
      modalRecipe: {},
      modalPortions: null,
      showAllRecipes: true
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
    async addRecipe(recipe) {
      try {
        const res = await axios.post(process.env.VUE_APP_BACKEND_URL + '/api/recipes', recipe, {
          withCredentials: true,
        })
        if (res.status === 200) {
          this.recipeModal.hide()
          this.recipes = await this.getRecipes({})
          this.showAllRecipes = true
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
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
        }
      }
    },
    showModal(mode, recipe, customNumberOfPortions = null){
      this.modalMode = mode
      this.modalRecipe = recipe
      this.modalPortions = customNumberOfPortions
      this.recipeModal.show()
    }
  },
  mounted() {
    this.recipeModal = new Modal(document.getElementById('recipeModal'), {})
  },
  async beforeMount() {
    this.recipes = await this.getRecipes({})
    this.showAllRecipes = true
    await this.$root.load()
    if(this.recipeId.match(/^[0-9a-fA-F]{24}$/)){
      this.showModal('view', await this.getRecipes({id: this.recipeId}), parseInt(this.customNumberOfPortions))
    }
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
