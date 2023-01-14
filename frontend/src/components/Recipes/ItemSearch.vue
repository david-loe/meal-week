<template>
  <div>
    <input
      @input="itemSearchChange"
      @keydown.enter.prevent="itemSearchChange"
      class="form-control"
      :list="idKey + 'sList'"
      :placeholder="$t('labels.typeToSearch')"
      v-model="itemSearch"
    />
    <datalist :id="idKey + 'sList'">
      <option v-for="item in itemSuggestions" :value="item.name + (item.emoji ? ' ' + item.emoji : '')" :key="item._id" />
      <option
        v-if="allowNew && itemSuggestions.length === 0 && itemSearch.length >= 2 && itemSearch.indexOf('🆕') !== 0"
        :value="'🆕 ' + itemSearch"
      />
    </datalist>
  </div>
</template>

<script>
export default {
 name: 'ItemSearch',
  emits: ['selected', 'new'],
  data() {
    return {
      itemSuggestions: [],
      itemSearch: ''
    }
  },
  props: {
    allowNew: {
      type: Boolean,
      default: () => true
      },
    idKey: {
      type: String,
      default: () => "item"
    }
  },
  components: {},
  methods: {
    async itemSearchChange() {
      var selected = false
      if (this.itemSearch.length >= 2) {
        if (this.itemSearch.indexOf('🆕') !== 0) {
          for (const sug of this.itemSuggestions) {
            if (sug.name + (sug.emoji ? ' ' + sug.emoji : '') === this.itemSearch) {
              selected = true
              this.$emit('selected', await this.$root.getter('items', { id: sug._id }))
              this.itemSearch = ''
              break
            }
          }
          if (!selected) {
            var reStr = this.escapeRegex(this.itemSearch) 
            this.itemSuggestions = await this.$root.getter('items', { search: reStr, limit: 5 })
            if (this.itemSuggestions.length <= 2) {
              for (const item of this.itemSuggestions) {
                if (item.name.match(new RegExp(reStr, 'i')) != null) {
                  continue
                }
                if (item.alias && item.alias.length > 0) {
                  for (const alias of item.alias) {
                    this.itemSuggestions.push({ name: alias, _id: item._id, emoji: item.emoji })
                  }
                }
              }
            }
          }
        } else if(this.allowNew) {
          console.log(this.allowNew)
          this.$emit('new', { name: this.itemSearch.substring(3), itemCategory: '', unit: '', alias: [], converter: [] })
          this.itemSearch = ''
          this.itemSuggestions = []
        }
      } else {
        this.itemSuggestions = []
      }
    },
    escapeRegex(s){
      return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    }
  },
}
</script>

<style>
</style>