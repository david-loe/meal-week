<template>
  <div class="container">
    <div class="row justify-content-between">
        <div class="col-auto">
            <h1>{{ $t('headlines.recipes') }}</h1>
        </div>
        <div class="col-auto">
            <button class="btn btn-secondary">
                <i class="bi bi-plus-lg"></i>
                <span class="ms-1">{{ $t('recipes.add') }}</span>
            </button>
        </div>
    </div>
    <div class="input-group w-50 mx-auto mt-2 mb-5">
        <span class="input-group-text">
            <i class="bi bi-search"></i>
        </span>
        <input class="form-control" type="text" :placeholder="$t('labels.search')" v-model="searchString">
    </div>
    <div class="container">
        <RecipeTile></RecipeTile>
    </div>
  </div>
</template>

<script>
import RecipeTile from './Recipes/RecipeTile.vue'
export default {
    name: 'Recipes',
    components:{
        RecipeTile
    },
    data() {
        return {
            searchString: '',
        }
    },
    props: [],
    methods: {
        
    },
}
</script>

<style>

</style>