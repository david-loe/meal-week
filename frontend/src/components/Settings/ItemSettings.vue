<template>
  <div class="container mb-3">
    <h2>{{ $t('headlines.items') }}</h2>
    <div class="container">
      <p>{{ $t('settings.items.description') }}</p>
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
      <form v-if="Object.keys(formItem).length > 0" @submit.prevent="save(formItem)">
        <div class="mb-2">
          <label for="formItem_name" class="form-label">{{ $t('labels.name') }}</label>
          <input class="form-control" id="formItem_name" v-model="formItem.name" required />
        </div>

        <div class="mb-2">
          <label for="formItem_emoji" class="form-label">{{ $t('labels.emoji') }}</label>
          <input style="width: 3.5em" class="form-control" id="formItem_emoji" v-model="formItem.emoji" max-length="2" />
        </div>

        <div class="mb-2">
          <label for="formItem_unit" class="form-label">{{ $t('labels.unit') }}</label>
          <select class="form-select" id="formItem_unit" v-model="formItem.unit" required>
            <option disabled value="">{{ $t('labels.chooseUnit') }}</option>
            <option v-for="unit in $root.units" :value="unit" :key="unit._id">
              {{ $t(unit.name) }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <label for="formItem_itemCategory" class="form-label">{{ $t('labels.itemCategory') }}</label>
          <select class="form-select" id="formItem_itemCategory" v-model="formItem.itemCategory" required>
            <option disabled value="">{{ $t('labels.chooseCategory') }}</option>
            <option v-for="category in $root.itemCategories" :value="category._id" :key="category._id">
              {{ $t(category.name) + ' ' + (category.emoji ? ' ' + category.emoji : '') }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <form @submit.prevent="formItem.alias.push(newAlias);newAlias=''">
            <label for="formItem_alias" class="form-label">{{ $t('labels.alias') }}</label>
            <div
              v-for="(alias, index) of formItem.alias"
              class="badge text-dark text-nowrap fs-6 ms-1 mt-1 bg-light"
              :key="index"
            >
              {{ alias }}
              <span class="text-dark ms-1" @click="formItem.alias.splice(index, 1)" style="cursor: pointer"><i class="bi bi-x-lg"></i></span>
            </div>
            <div id="formItem_alias" class="input-group">
              <input class="form-control" v-model="newAlias" required />
              <button type="submit" class="btn btn-outline-secondary">{{ $t('labels.addAlias') }}</button>
            </div>
          </form>
        </div>

        <div class="mb-2">
          <form @submit.prevent="formItem.converter.push(newConverter);newConverter={unit: '', factor: null}">
            <label for="formItem_converter" class="form-label">{{ $t('labels.converter') }}</label>
            <div
              v-for="(converter, index) of formItem.converter"
              class="badge text-dark text-nowrap fs-6 ms-1 mt-1 bg-light"
              :key="index"
            >
              {{ '1 ' + $t(formItem.unit.name) + ' ↔ ' + converter.factor + ' ' + $t(converter.unit.name) }}
              <span class="text-dark ms-1" @click="formItem.converter.splice(index, 1)" style="cursor: pointer"><i class="bi bi-x-lg"></i></span>
            </div>
            <div id="formItem_converter" class="input-group">
              <input type="number" class="form-control" v-model="newConverter.factor" :placeholder="$t('labels.factor')" required />
              <select class="form-select" id="formItem_converter_unit" v-model="newConverter.unit" required>
                <option disabled value="">{{ $t('labels.chooseUnit') }}</option>
                <option v-for="unit in $root.units" :value="unit" :key="unit._id">
                  {{ $t(unit.name) }}
                </option>
              </select>
              <button type="submit" class="btn btn-outline-secondary">{{ $t('labels.addConverter') }}</button>
            </div>
          </form>
        </div>

        <button type="submit" class="btn btn-secondary me-1">
          {{ $t('labels.save') }}
        </button>
        <button v-if="formItem._id" type="button" class="btn btn-danger me-1" @click="remove(formItem._id)">
          {{ $t('labels.delete') }}
        </button>
        <button type="button" class="btn btn-light" @click="clear()">
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
      newAlias: '',
      newConverter: {unit: '', factor: null}
    }
  },
  props: [],
  components: {},
  methods: {
    clear() {
      this.formItem = {}
      this.newAlias = ''
      this.newConverter = {unit: '', factor: null}
    },
    async itemSearchChange() {
      var selected = false
      if (this.itemSearch.length >= 2) {
        if (this.itemSearch.indexOf('🆕') !== 0) {
          for (const sug of this.itemSuggestions) {
            if (sug.name + (sug.emoji ? ' ' + sug.emoji : '') === this.itemSearch) {
              selected = true
              this.formItem = await this.$root.getter('items', { id: sug._id })
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
          this.formItem = { name: this.itemSearch.substring(2), itemCategory: '', unit: '', alias: [], converter: [] }
          this.itemSearch = ''
          this.itemSuggestions = []
        }
      } else {
        this.itemSuggestions = []
      }
    },
    async remove(id) {
      if(!confirm(this.$t('alerts.areYouSureDelete'))){
        return
      }
      try {
        const res = await axios.delete(process.env.VUE_APP_BACKEND_URL + '/api/items', {
          params: {id: id},
          withCredentials: true,
        })
        if (res.status === 200) {
          this.clear()
          this.$root.addAlert({message: '', title: res.data.message, type: "success"})
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
          this.$root.addAlert({message: error.response.data.message, title: "ERROR", type: "danger"})
        }
      }
    },
    async save(item) {
      try {
        const res = await axios.post(process.env.VUE_APP_BACKEND_URL + '/api/items', item, {
          withCredentials: true,
        })
        if (res.status === 200) {
          this.clear()
          this.$root.addAlert({message: '', title: res.data.message, type: "success"})
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
          this.$root.addAlert({message: error.response.data.message, title: "ERROR", type: "danger"})
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