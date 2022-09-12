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
        <i v-for="star in getRating()" class="bi bi-star-fill" :key="star"></i>
        <i v-for="star in 5 - getRating()" class="bi bi-star" :key="star"></i>
        <small> ({{ recipe.reviews.length }})</small>
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
export default {
  name: 'RecipeTile',
  data() {
    return {}
  },
  props: { recipe: { type: Object } },
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
