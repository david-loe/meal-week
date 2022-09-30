<template>
  <div id="recipe-header">
    <div class="row">
      <div class="col-auto">
        <img :src="recipe.image" style="max-width:100%;"/>
      </div>
      <div class="col">
        <table class="table">
          <tr>
            <td>{{ $t('labels.prepTime') }}</td>
            <td>{{ recipe.prepTimeMin + ' min.' }}</td>
          </tr>
          <tr>
            <td>{{ $t('labels.cookTime') }}</td>
            <td>{{ recipe.cookTimeMin + ' min.' }}</td>
          </tr>
        </table>
        <RecipeRating :reviews="recipe.reviews" :recipeId="recipe._id" @new-reviews="(a) => $emit('new-reviews', a)"></RecipeRating>
        <div>
          <span v-for="tag in recipe.tags" class="badge bg-light text-dark" :key="tag._id">{{ $t(tag.name) + ' ' + tag.emoji }}</span>
        </div>
      </div>
      
    </div>
    <h1 v-if="showTitle">{{ recipe.name }}</h1>
  </div>
  <hr />
  <div id="recipe-body">
    <h4>{{$t('headlines.ingredients')}}</h4>
    <table class="table">
          <tr v-for="ingredient in recipe.ingredients" :key="ingredient.item._id">
            <td>{{ ingredient.item.name + (ingredient.item.emoji ? ' ' + ingredient.item.emoji : '') }}</td>
            <td>{{ ingredient.quantity + ' ' + $t(ingredient.item.unit) }}</td>
          </tr>
        </table>
  </div>
</template>

<script>
import RecipeRating from './RecipeRating.vue'
export default {
  name: 'RecipePage',
  emits: ['new-reviews'],
  data() {
    return {}
  },
  components: {
    RecipeRating,
  },
  props: { recipe: { type: Object }, showTitle: {type: Boolean, default: true} },
  methods: {
    getRating() {
      var sum = 0
      for (const review of this.recipe.reviews) {
        sum += review.assessment
      }
      return this.recipe.reviews.length > 0 ? Math.round(sum / this.recipe.reviews.length) : 0
    },
  },
}
</script>

<style></style>
