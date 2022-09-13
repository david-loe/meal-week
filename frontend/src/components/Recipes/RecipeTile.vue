<template>
  <div class="card" style="width: 18rem">
    <img :src="recipe.image" class="card-img-top" alt="" />
    <div class="card-img-overlay p-0" v-if="recipe.image">
      <div class="p-3" id="title-bg">
        <h5 class="card-title">{{ recipe.name }}</h5>
      </div>
    </div>
    <div class="card-body position-relative">
      <div class="position-absolute top-0 end-0 pe-1">
        <RecipeRating :reviews="recipe.reviews" :recipeId="recipe._id"></RecipeRating>
      </div>
      <h5 class="card-title" v-if="!recipe.image">{{ recipe.name }}</h5>
      <span v-for="tag in recipe.tags" class="badge bg-light text-dark" :key="tag._id">{{$t(tag.name) + ' ' + tag.emoji}}</span>
    </div>
    <div class="card-footer">
      <small class="text-muted">{{ $t('labels.createdBy') + ' ' + recipe.author.name }}</small>
    </div>
  </div>
</template>

<script>
import RecipeRating from './RecipeRating.vue'
export default {
  name: 'RecipeTile',
  data() {
    return {}
  },
  components: {
    RecipeRating
  },
  props: { recipe: { type: Object } },
  methods: {
  },
}
</script>

<style>
#title-bg {
  background: linear-gradient(
    180deg,
    rgba(var(--bs-light-rgb), 0.8) 30%,
    rgba(var(--bs-light-rgb), 0.5) 60%,
    rgba(var(--bs-light-rgb), 0) 80%
  );
  border-radius: var(--bs-card-inner-border-radius);
}
</style>
