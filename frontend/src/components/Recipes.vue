<template>
  <div>
    <div class="modal fade" id="recipeModal" tabindex="-1" aria-labelledby="recipeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="recipeModalLabel">TITLE</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <RecipeForm mode="add" v-on:cancel="this.modal.hide()"></RecipeForm>
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
          <button class="btn btn-secondary" v-on:click="addRecipe()">
            <i class="bi bi-plus-lg"></i>
            <span class="ms-1">{{ $t('recipes.add') }}</span>
          </button>
        </div>
      </div>
      <div class="input-group w-50 mx-auto mt-2 mb-5">
        <span class="input-group-text">
          <i class="bi bi-search"></i>
        </span>
        <input class="form-control" type="text" :placeholder="$t('labels.search')" v-model="searchString" />
      </div>
      <div class="container">
        <RecipeTile></RecipeTile>
      </div>
    </div>
  </div>
</template>

<script>
import RecipeTile from './Recipes/RecipeTile.vue'
import RecipeForm from './Recipes/RecipeForm.vue'
import { Modal } from 'bootstrap'
import axios from 'axios'
export default {
  name: 'Recipes',
  components: {
    RecipeTile,
    RecipeForm
  },
  data() {
    return {
      searchString: '',
      modal: undefined,
    }
  },
  props: [],
  methods: {
    async getRecipes(search) {
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/recipes', {
            params: {
                search: search
            },
          withCredentials: true,
        })
        console.log(res)
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
    addRecipe(){
        this.modal.show()
    }
  },
  mounted() {
    this.modal = new Modal(document.getElementById('recipeModal'), {})

  },
  beforeMount() {
    this.getRecipes()
    if (this.$root.isLoading) {
      this.$root.getUser()
    }
  },
}
</script>

<style></style>
