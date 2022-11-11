<template>
  <div class="card" style="width: 18rem">
    <router-link v-if="recipe.image" :to="'/recipes/'+recipe._id" class="nav-link">
      <img :src="recipe.image" class="card-img-top" alt="" height="150" style="object-fit: cover;" />
      <div class="position-absolute top-0 start-0 end-0 p-0">
        <div class="p-3" id="title-bg">
          <h5 class="card-title">{{ recipe.name }}</h5>
        </div>
      </div>
    </router-link>
    <div class="card-body">
      <router-link :to="'/recipes/'+recipe._id" v-if="!recipe.image" class="nav-link">
        <h5 class="card-title">{{ recipe.name }}</h5>
      </router-link>
      <span v-for="category in recipe.recipeCategories" class="badge bg-light text-dark" :key="category._id">{{ $t(category.name) + ' ' + (category.emoji ? ' ' + category.emoji : '') }}</span>
      <span v-for="tag in recipe.tags" class="badge text-dark" :key="tag._id" style="background-color: rgba(var(--bs-info-rgb),0.25)">{{ $t(tag.name) + ' ' + tag.emoji }}</span>
      <div class="form-floating">
        <input type="number" class="form-control" id="numberOfPortionsInput" min="1" v-model="tileNumberOfPortions">
        <label for="numberOfPortionsInput">{{ $t('labels.numberOfPortions') }}</label>
      </div>
      <div>
        <button type="button" class="btn btn-danger btn-sm" @click="$emit('deleted')">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
    <div class="card-footer">
      <small class="text-muted">{{ $t('labels.createdBy') + ' ' + recipe.author.name }}</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeekPlanRecipeTile',
  emits: ['deleted', 'new-number-of-portions'],
  data() {
    return {
      tileNumberOfPortions: null
    }
  },
  components: {
  },
  props: { recipe: { type: Object }, numberOfPortions: {type: Number} },
  methods: {
      change(event){
          console.log(event)
      }
  },
   watch: {
    numberOfPortions: function () {
      this.tileNumberOfPortions = this.numberOfPortions
    },
    tileNumberOfPortions: function (newVal, oldVal) {
      if(oldVal && oldVal != newVal){
        this.$emit('new-number-of-portions', this.tileNumberOfPortions)
      }
      
    }
  },
  beforeMount() {
    this.tileNumberOfPortions = this.numberOfPortions

  }
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
