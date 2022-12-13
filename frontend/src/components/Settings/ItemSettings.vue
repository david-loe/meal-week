<template>
  <div class="container mb-3">
    <h2>{{ $t('headlines.items') }}</h2>
    <div class="container">
      <div class="mb-2">
        <input
          @input="itemSearchChange"
          class="form-control"
          list="ingredientsList"
          id="addIngredient"
          :placeholder="$t('labels.typeToSearch')"
          v-model="itemSearch"
        />
        <datalist id="ingredientsList">
          <option v-for="item in itemSuggestions" :value="item.name + (item.emoji ? ' ' + item.emoji : '')" :key="item._id" />
          <option
            v-if="itemSuggestions.length === 0 && itemSearch.length >= 2 && itemSearch.slice(0, 2) !== '🆕'"
            :value="'🆕 ' + itemSearch"
          />
        </datalist>
      </div>
      <form v-if="Object.keys(formItem).length > 0" @submit.prevent="createNewItemAndAddToRecipe(formItem)">
        <div class="mb-2">
        <input class="form-control" id="formItem_name" v-model="formItem.name" required/>
      </div>

      <div class="mb-2">
        <input style="width: 3.5em" class="form-control" id="formItem_emoji" v-model="formItem.emoji" max-length="2" placeholder="😃" />
      </div>

      <div class="mb-2">
        <select class="form-select" v-model="formItem.unit" required>
          <option disabled value="">{{ $t('labels.chooseUnit') }}</option>
          <option v-for="unit in $root.units" :value="unit._id" :key="unit._id">
            {{ $t(unit.name) }}
          </option>
        </select>
      </div>
      <div>
        <select class="form-select" v-model="formItem.itemCategory" required>
          <option disabled value="">{{ $t('labels.chooseCategory') }}</option>
          <option v-for="category in $root.itemCategories" :value="category._id" :key="category._id">
            {{ $t(category.name) + ' ' + (category.emoji ? ' ' + category.emoji : '') }}
          </option>
        </select>
      </div>

      <button
        type="submit"
        class="btn btn-secondary"
      >
        {{ $t('labels.addItem') }}
      </button>
      <button
        type="button"
        class="btn btn-light"
        @click="formItem = {}">
        {{ $t('labels.cancel') }}
      </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'ItemSettings',
  data() {
    return {
      itemSuggestions: [],
      itemSearch: '',
      formItem: {},
      settings: {},
      changeSuccess: false,
    }
  },
  props: [],
  components: {},
  methods: {
        async itemSearchChange() {
      var selected = false
      if (this.itemSearch.length >= 2) {
        if (this.itemSearch.indexOf('🆕') !== 0) {
          for (const sug of this.itemSuggestions) {
            if (sug.name + (sug.emoji ? ' ' + sug.emoji : '') === this.itemSearch) {
              selected = true
              this.formItem = await this.$root.getter('items', {id: sug._id})
              this.itemSearch = ''
              break
            }
          }
          if (!selected) {
            this.itemSuggestions = await this.$root.getter('items', { search: this.itemSearch, limit: 5 })
            if (this.itemSuggestions.length <= 2) {
              for (const item of this.itemSuggestions) {
                if (item.name.match(new RegExp(this.itemSearch, 'i')) != null) {
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
        } else {
          this.formItem = { name: this.itemSearch.substring(2), itemCategory: '', unit: '' }
          this.itemSearch = ''
          this.itemSuggestions = []
        }
      } else {
        this.itemSuggestions = []
      }
    },
    async changeSettings(newSettings) {
      try {
        const res = await axios.post(process.env.VUE_APP_BACKEND_URL + '/api/user/settings', newSettings, {
          withCredentials: true,
        })
        if (res.status === 200) {
          this.$root.user.settings = res.data.result
          this.changeSuccess = true
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },

  },
  async beforeMount() {
    await this.$root.load()
    this.settings = this.$root.user.settings
  },
}
</script>

<style>
</style>