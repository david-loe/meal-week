<template>
  <div id="recipe-header">
    <div class="row gy-2">
      <div class="col-auto">
        <img :src="recipe.image" style="max-width:100%;"/>
      </div>
      <div class="col">
      <div class="input-group mb-2">
        <div class="form-floating">
          <input type="number" class="form-control" id="customNumberOfPortionsInput" min="1" v-model="customNumberOfPortions">
          <label for="customNumberOfPortionsInput">{{ $t('labels.numberOfPortions') }}</label>
        </div>
        <button class="btn btn-primary" type="button" id="button-addon2">{{ $t('labels.addToWeekPlan') }}</button>
      </div>
        <table class="table mb-2">
          <tr>
            <td>{{ $t('labels.prepTime') }}</td>
            <td>{{ recipe.prepTimeMin + ' min.' }}</td>
          </tr>
          <tr>
            <td>{{ $t('labels.cookTime') }}</td>
            <td>{{ recipe.cookTimeMin + ' min.' }}</td>
          </tr>
          <tr>
            <td>{{ $t('labels.numberOfPortions') }}</td>
            <td>{{ recipe.numberOfPortions}}</td>
          </tr>
        </table>
        <RecipeRating :reviews="recipe.reviews" :recipeId="recipe._id" @new-reviews="(a) => $emit('new-reviews', a)"></RecipeRating>
        <div>
          <span v-for="category in recipe.recipeCategories" class="badge bg-light text-dark" :key="category._id">{{ $t(category.name) + ' ' + (category.emoji ? ' ' + category.emoji : '') }}</span>
        </div>
        <div>
          <span v-for="tag in recipe.tags" class="badge text-dark" :key="tag._id" style="background-color: rgba(var(--bs-info-rgb),0.25)">{{ $t(tag.name) + ' ' + tag.emoji }}</span>
        </div>
      </div>
      
    </div>
    <h1 v-if="showTitle">{{ recipe.name }}</h1>
  </div>
  <hr />
  <div id="recipe-body">
  <div class="mb-2">
    <h4>{{$t('headlines.ingredients')}}</h4>
    <table class="table">
      <tr v-for="ingredient in recipe.ingredients" :key="ingredient.item._id">
        <td>{{ ingredient.item.name + (ingredient.item.emoji ? ' ' + ingredient.item.emoji : '') }}</td>
        <td>{{ calcQ(ingredient.quantity) + ' ' + $t(ingredient.item.unit) }}</td>
      </tr>
    </table>
  </div>
  <div class="mb-2">
    <h4>{{$t('headlines.instructions')}}</h4>
    <table class="table">
      <tr v-for="(instruction, index) in recipe.instructions" :key="index">
        <td><h5>{{ index + 1}}.</h5></td>
        <td>
          <div>{{ instruction.text }}</div>
          <div class="text-secondary">
            <small><span v-for="(ingredient, index) in instruction.ingredients" :key="ingredient.item._id"><span v-if="index !== 0"> - </span>{{calcQ(ingredient.quantity) + $t(ingredient.item.unit) + ' ' + ingredient.item.name }}</span></small>
          </div>
        </td>
      </tr>
    </table>
  </div>
  </div>
  <div id="recipe-footer">
    <button
        v-if="recipe.author._id === $root.user._id"
        type="button"
        class="btn btn-light"
        v-on:click="this.$emit('show-edit-form')">
        <i class="bi bi-pencil"></i>&nbsp;
        {{ $t('labels.editRecipe') }}
      </button>
  </div>
</template>

<script>
import RecipeRating from './RecipeRating.vue'
export default {
  name: 'RecipePage',
  emits: ['new-reviews', 'show-edit-form'],
  data() {
    return {
      customNumberOfPortions: null,
      factor: 1
    }
  },
  components: {
    RecipeRating,
  },
  props: { recipe: { type: Object }, showTitle: {type: Boolean, default: true} },
  methods: {
    calcQ(quantity){
      return quantity * this.factor
    }
  },
  beforeMount() {
    this.customNumberOfPortions = this.recipe.numberOfPortions
  },
  watch: {
    recipe: function () {
      this.customNumberOfPortions = this.recipe.numberOfPortions
    },
    customNumberOfPortions: function() {
      if(this.customNumberOfPortions === this.recipe.numberOfPortions){
        this.factor = 1
      }else if(this.customNumberOfPortions > 0){
        this.factor = this.customNumberOfPortions / this.recipe.numberOfPortions
      }
    }
  },
}
</script>

<style></style>
