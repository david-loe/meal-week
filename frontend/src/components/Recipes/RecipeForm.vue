<template>
  <form class="container" @submit.prevent="this.mode === 'add' ? this.$emit('add', this.formRecipe) : this.$emit('edit', this.formRecipe)">
    <div class="mb-2">
      <label for="recipeFormName" class="form-label">
        {{ $t('labels.name') }}
      </label>
      <input type="text" class="form-control" id="recipeFormName" v-model="formRecipe.name" required :disabled="this.mode === 'edit'" />
    </div>
    <div class="mb-2">
      <label for="recipeFormDes" class="form-label">
        {{ $t('labels.instructions') }}
      </label>
      <textarea class="form-control" id="recipeFormDes" rows="10" v-model="formRecipe.instructions"></textarea>
    </div>
    <div class="mb-2">
      <div class="row">
        <div class="col-7">
          <label for="addIngredient" class="form-label">{{ $t('labels.ingredients') }}</label>
          <input @input="ingredientChange" class="form-control" list="ingredientsList" id="addIngredient" v-model="itemSearch" />
          <datalist id="ingredientsList">
            <option v-for="ingredient in itemSuggestions" :value="ingredient.name" :key="ingredient._id" />
            <option v-if="itemSuggestions.length == 0 && itemSearch.length >= 2" :value="$t('recipe.createIngredient')" />
          </datalist>
        </div>
        <div class="col-3"></div>
        <div class="col-2"></div>
      </div>
    </div>
    <div class="mb-2">
      <label for="recipeFormImg" class="form-label"> {{ $t('labels.image') }} (max 1MB)</label>
      <input class="form-control" type="file" id="recipeFormImg" @change="changeFile" accept="image/*" />
    </div>
    <div class="mb-2">
      <button type="submit" class="btn btn-primary me-2" v-if="this.mode === 'add'">
        {{ $t('labels.addRecipe') }}
      </button>
      <button type="submit" class="btn btn-primary me-2" v-if="this.mode === 'edit'">
        {{ $t('labels.save') }}
      </button>
      <button type="button" class="btn btn-light" v-on:click="this.$emit('cancel')">
        {{ $t('labels.cancel') }}
      </button>
    </div>
  </form>
</template>

<script>
import axios from 'axios'
export default {
  name: 'RecipeForm',
  data() {
    return {
      formRecipe: this.recipe,
      itemSuggestions: [],
      itemSearch: '',
    }
  },
  props: {
    recipe: {
      type: Object,
      default: function () {
        return {
          name: '',
          ingredients: [],
          instructions: '',
          tags: [],
          prepTimeMin: null,
          cookTimeMin: null,
          numberOfPortions: null,
          img: undefined,
        }
      },
    },
    mode: {
      type: String,
      required: true,
      validator: function (value) {
        return ['add', 'edit'].indexOf(value) !== -1
      },
    },
  },
  methods: {
    ingredientChange() {
      if (this.itemSearch.length >= 2) {
        this.getIngredients(this.itemSearch)
      } else {
        this.itemSuggestions = []
      }
    },
    async getIngredients(search) {
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/items', {
          params: {
            search: search,
            limit: 5,
          },
          withCredentials: true,
        })
        if (res.status === 200) {
          console.log(res)
          this.itemSuggestions = res.data.data
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
    changeFile(form) {
      if (form.target.files.length === 1 && form.target.files[0].size < 1000000) {
        this.formResource.img = form.target.files[0]
      } else {
        this.formResource.img = undefined
      }
    },
  },
  watch: {
    recipe: function () {
      this.formRecipe = this.recipe
    },
  },
}
</script>

<style></style>
