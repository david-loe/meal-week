<template>
  <div id="recipe-header">
    <div class="row">
      <div class="col-auto">
        <img :src="recipe.image" class="rounded-circle" />
      </div>
      <div class="col-auto">
        <table class="table">
          <tr>
            <td>{{ $t('labels.prepTime') }}</td>
            <td>{{ recipe.prepTimeMin + ' m' }}</td>
          </tr>
          <tr>
            <td>{{ $t('labels.cookTime') }}</td>
            <td>{{ recipe.cookTimeMin + ' m' }}</td>
          </tr>
        </table>
      </div>
      <div class="col-auto">
        <span v-for="tag in recipe.tags" class="badge bg-light text-dark" :key="tag._id">{{ $t(tag.name) + ' ' + tag.emoji }}</span>
      </div>
    </div>
    <h1>{{ recipe.name }}</h1>
  </div>
  <hr />
  <div id="recipe-body"></div>
</template>

<script>
export default {
  name: 'RecipePage',
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

<style></style>
