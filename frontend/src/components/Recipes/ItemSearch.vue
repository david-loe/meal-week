<template>
  
  <div>
    <v-select v-model="selected" :filterable="false" :options="itemSuggestions" @search="search" @option:selected="(i)=>{$emit('selected', structuredClone(i));selected=null}" :getOptionLabel="(o) => o.name + (o.emoji ? ' ' + o.emoji : '')" >
      <template v-slot:no-options="{ search, searching }">
      <template v-if="searching" >
        <span v-if="allowNew" @click="() => $emit('new', { name: search, itemCategory: '', unit: '', alias: [], converter: [] })" style="cursor: pointer;">
          🆕 <b>{{ search }}</b>
        </span>
        <template v-else>
          Keine Zutat für <em>{{search}}</em> gefunden.
        </template>
      </template>
      <em v-else style="opacity: 0.5">Tippe um nach Zutaten zu suchen.</em>
    </template>
  </v-select>
  </div>
</template>

<script>

export default {
 name: 'ItemSearch',
  emits: ['selected', 'new'],
  data() {
    return {
      itemSuggestions: [],
      selected: null
    }
  },
  props: {
    allowNew: {
      type: Boolean,
      default: () => true
      },
  },
  methods: {
    structuredClone,
    async search(searchString, loading){
      loading(true)
      var reStr = this.escapeRegex(searchString) 
      this.itemSuggestions = await this.$root.getter('items', { search: reStr, limit: 7 })
      loading(false)
    },
    escapeRegex(s){
      return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    }
  },
}
</script>

<style>
</style>