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
            <RecipePage v-if="modalMode === 'view'" :recipe="modalRecipe" :showTitle="false" @new-reviews="(a)=>modalRecipe.reviews = a" @new-likes="(a)=>modalRecipe.likes = a" @show-edit-form="showModal('edit', modalRecipe)"></RecipePage>
            <RecipeForm v-else-if="modalMode === 'add' || modalMode === 'edit'" :mode="modalMode" v-on:cancel="this.recipeModal.hide()" :recipe="modalRecipe" @add="this.addRecipe" @edit="this.addRecipe"></RecipeForm>
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
          <button class="btn btn-secondary" v-on:click="showModal('add')">
            <i class="bi bi-plus-lg"></i>
            <span class="ms-1">{{ $t('recipes.add') }}</span>
          </button>
        </div>
      </div>
      <div class="input-group w-50 mx-auto mt-2 mb-5">
        <span class="input-group-text">
          <i class="bi bi-search"></i>
        </span>
        <input class="form-control" type="text" :placeholder="$t('labels.search')" v-model="searchString" @input="searchChange" />
      </div>
      <div class="container">
        <div class="row justify-content-center gx-4 gy-2">
          <div class="col-auto" v-for="recipe in this.recipes" :key="recipe._id">
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
      searchString: '',
      recipeModal: undefined,
      recipes: [],
      modalMode: '',
      modalRecipe: {} 
    }
  },
  props: {recipeId: {type: String}},
  methods: {
    async searchChange() {
      if (this.searchString.length >= 2) {
        this.recipes = await this.getRecipes({ search: this.searchString })
      }
    },
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
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
    showModal(mode, recipe = {}){
      this.modalMode = mode
      this.modalRecipe = recipe
      this.recipeModal.show()
    }
  },
  mounted() {
    this.recipeModal = new Modal(document.getElementById('recipeModal'), {})
  },
  async beforeMount() {
    this.recipes = await this.getRecipes({})
    if (!this.$root.loaded) {
      await this.$root.load()
    }
    if(this.recipeId.match(/^[0-9a-fA-F]{24}$/)){
      this.showModal('view', await this.getRecipes({id: this.recipeId}))
    }
  },
  watch: {
    recipeId: async function () {
      if(this.recipeId.match(/^[0-9a-fA-F]{24}$/)){
        this.showModal('view', await this.getRecipes({id: this.recipeId}))
      }
    },
  },
}
</script>

<style></style>
