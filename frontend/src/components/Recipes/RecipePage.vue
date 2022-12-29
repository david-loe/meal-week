<template>
<div>
  <div id="recipe-header">
    <div class="row gy-2">
      <div class="col-auto">
        <img :src="recipe.image" style="object-fit: cover;max-height:275px;max-width:100%;"/>
      </div>
      <div class="col">
      <div class="input-group mb-2">
        <div class="form-floating">
          <input type="number" class="form-control" id="customNumberOfPortionsInput" min="1" v-model="pagePortions">
          <label for="customNumberOfPortionsInput">{{ $t('labels.portions') }}</label>
        </div>
        <select class="form-select" style="max-width:5em;" v-model="selectedWeekDay">
          <option v-for="n in 7" :key="n" :value="n">{{ $t('weekdaysShort.' + ((n + todaysWeekday) % 7)) }}</option>
        </select>
        <button class="btn btn-primary position-relative" type="button" id="button-addon2" :title="$t('labels.addToWeekPlan')" @click="$emit('add-to-week-plan', (selectedWeekDay + todaysWeekday) % 7, pagePortions);addedToWeekPlan=true">
          <span>
            <i class="bi bi-plus"></i>
            <i class="bi bi-calendar-week"></i>
          </span>
          <span v-if="addedToWeekPlan" class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-success">
            ✔
          </span>
        </button>
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
        <div class="row">
        <RecipeLike class="col-auto" :likes="recipe.likes" :recipeId="recipe._id" @new-likes="(a) => $emit('new-likes', a)"></RecipeLike>

        <RecipeRating  class="col-auto p-0" :reviews="recipe.reviews" :recipeId="recipe._id" @new-reviews="(a) => $emit('new-reviews', a)"></RecipeRating>

        </div>
        <div>
          <span v-for="category in recipe.recipeCategories" class="badge bg-light text-dark me-1" :key="category._id">{{ $t(category.name) + ' ' + (category.emoji ? ' ' + category.emoji : '') }}</span>
        </div>
        <div>
          <span v-for="tag in recipe.tags" class="badge text-dark me-1" :key="tag._id" style="background-color: rgba(var(--bs-info-rgb),0.25)">{{ $t(tag.name) + ' ' + tag.emoji }}</span>
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
        <td>{{ ingrdientToString(ingredient) }}</td>
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
            <small><span v-for="(ingredient, index) in instruction.ingredients" :key="ingredient.item._id"><span v-if="index !== 0"> - </span>{{ingrdientToString(ingredient, true) + ' ' + ingredient.item.name }}</span></small>
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
      class="btn btn-light me-2"
      @click="$emit('show-edit-form')">
      <i class="bi bi-pencil"></i>&nbsp;
      {{ $t('labels.editRecipe') }}
    </button>
    <button
      v-if="recipe.author._id === $root.user._id"
      type="button"
      class="btn btn-danger"
      @click="deleteThis()">
      <i class="bi bi-trash"></i>&nbsp;
      {{ $t('labels.delete') }}
    </button>
  </div>
</div>
</template>

<script>
import RecipeRating from './RecipeRating.vue'
import RecipeLike from './RecipeLike.vue'
export default {
  name: 'RecipePage',
  emits: ['new-reviews', 'new-likes', 'show-edit-form', 'add-to-week-plan', 'deleted'],
  data() {
    return {
      pagePortions: null,
      factor: 1,
      addedToWeekPlan: false,
      todaysWeekday: 0,
      selectedWeekDay: 1,
      window: {width: 1},
    }
  },
  components: {
    RecipeRating,
    RecipeLike
  },
  props: { recipe: { type: Object }, showTitle: {type: Boolean, default: true}, customNumberOfPortions: {type: Number, default: null} },
  methods: {
    calcQ(quantity){
      return Math.round(quantity * this.factor * 100) / 100
    },
    ingrdientToString(ingredient, short = false){
      if(short){
        return this.calcQ(ingredient.displayQuantity) + this.$t(ingredient.displayUnit)
      }else{
        if(ingredient.displayUnit == ingredient.item.unit.name){
          return this.calcQ(ingredient.quantity) + ' ' + this.$t(ingredient.item.unit.name)
        }else{
          return this.calcQ(ingredient.displayQuantity) + ' ' + this.$t(ingredient.displayUnit) + ' (' + this.calcQ(ingredient.quantity) + ' ' + this.$t(ingredient.item.unit.name) + ')'
        }
      }
    },
    deleteThis(){
      if(confirm(this.$t('alerts.areYouSureDelete'))){
        this.$emit('deleted')
      }
    },
    getNoteForRecipe(id){
      for(const note of this.$root.user.notes){
        if(note.recipe == id){
          return note.note
        }
      }
      return false
    }
  },
  beforeMount() {
    this.todaysWeekday = new Date().getDay()
    if(this.customNumberOfPortions === null){
      this.pagePortions = this.recipe.numberOfPortions
    }else{
      this.pagePortions = this.customNumberOfPortions
    }
    this.window.width = window.innerWidth
  },
  watch: {
    customNumberOfPortions: function (){
      this.pagePortions = this.customNumberOfPortions
    },
    recipe: function () {
      this.pagePortions = this.recipe.numberOfPortions
      this.addedToWeekPlan = false
      this.selectedWeekDay = 1
    },
    pagePortions: function() {
      if(this.pagePortions === this.recipe.numberOfPortions){
        this.factor = 1
      }else if(this.pagePortions > 0){
        this.factor = this.pagePortions / this.recipe.numberOfPortions
      }
    }
  },
}
</script>

<style></style>
