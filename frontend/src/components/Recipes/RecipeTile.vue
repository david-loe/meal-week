<template>
  <div class="card" style="width: 18rem">
    <a v-if="recipe.image" href="#" class="nav-link" @click="$emit('clicked')">
      <img :src="recipe.image" class="card-img-top" alt="" height="150" style="object-fit: cover;" />
      <div class="card-img-overlay p-0">
        <div class="p-3" id="title-bg">
          <h5 class="card-title">{{ recipe.name }}</h5>
        </div>
      </div>
    </a>
    <div class="card-body position-relative">
      <div class="position-absolute top-0 end-0 pe-1">
        <RecipeRating :reviews="recipe.reviews" :recipeId="recipe._id" @new-reviews="(a) => $emit('new-reviews', a)"></RecipeRating>
      </div>
      <a v-if="!recipe.image" href="#" class="nav-link" @click="$emit('clicked')">
        <h5 class="card-title">{{ recipe.name }}</h5>
      </a>
      <span v-for="category in recipe.recipeCategories" class="badge bg-light text-dark" :key="category._id">{{ $t(category.name) + ' ' + (category.emoji ? ' ' + category.emoji : '') }}</span>
      <span v-for="tag in recipe.tags" class="badge text-dark" :key="tag._id" style="background-color: rgba(var(--bs-info-rgb),0.25)">{{ $t(tag.name) + ' ' + tag.emoji }}</span>
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
  emits: ['new-reviews', 'clicked'],
  data() {
    return {}
  },
  components: {
    RecipeRating,
  },
  props: { recipe: { type: Object } },
  methods: {},
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
