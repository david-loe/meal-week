<template>
  <form
    autocomplete="off"
    @submit.prevent="this.mode === 'add' ? this.$emit('add', this.formRecipe) : this.$emit('edit', this.formRecipe)"
  >
    <div class="mb-2">
      <label for="recipeFormName" class="form-label">
        {{ $t('labels.name') }}
      </label>
      <input type="text" class="form-control" id="recipeFormName" v-model="formRecipe.name" required :disabled="this.mode === 'edit'" />
    </div>
    <div class="mb-2">
      <label for="recipeFormDes" class="form-label">
        {{ $t('headlines.instructions') }}
      </label>
      <textarea class="form-control" id="recipeFormDes" rows="10" v-model="formRecipe.instructions" required></textarea>
    </div>
    <div class="mb-2">
      <label for="addIngredient" class="form-label">{{ $t('headlines.ingredients') }}</label>
      <table class="table align-middle">
        <tbody>
          <tr class="mb-1">
            <td colspan="3">
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
            </td>
          </tr>
          <tr v-if="newItem.name">
            <td colspan="3">
              <table class="table mb-0">
                <tr>
                  <td>
                    <input class="form-control" id="newItem_name" v-model="newItem.name" />
                  </td>
                  <td>
                    <input
                      style="width: 2.5em"
                      class="form-control"
                      id="newItem_name"
                      v-model="newItem.emoji"
                      max-length="2"
                      placeholder="😃"
                    />
                  </td>
                  <td>
                  <select class="form-select" v-model="newItem.unit">
                      <option disabled value="">{{ $t('labels.chooseUnit') }}</option>
                      <option v-for="unit in units" :value="unit" :key="unit">
                        {{$t(unit)}}
                      </option>
                    </select>
                  </td>
                  <td>
                    <select class="form-select" v-model="newItem.itemCategory">
                      <option disabled value="">{{ $t('labels.chooseCategory') }}</option>
                      <option v-for="category in itemCategories" :value="category._id" :key="category._id">
                        {{ $t(category.name) + ' ' + category.emoji }}
                      </option>
                    </select>
                  </td>
                </tr>
              </table>
              <button type="button" class="btn btn-secondary btn-sm mx-auto">{{$t('labels.addItem')}}</button>
              <button type="button" class="btn btn-light btn-sm">{{$t('labels.cancel')}}</button>
            </td>
          </tr>
          <tr v-for="ingredient in formRecipe.ingredients" :key="ingredient.item._id">
            <td>{{ ingredient.item.name + (ingredient.item.emoji ? ' ' + ingredient.item.emoji : '') }}</td>
            <td>
              <div class="input-group" style="max-width: 10em">
                <input class="form-control" type="number" min="1" v-model="ingredient.quantity" />
                <span class="input-group-text" id="basic-addon1">
                  {{ $t(ingredient.item.unit) }}
                </span>
              </div>
            </td>
            <td>
              <button type="button" class="btn btn-danger btn-sm" v-on:click="this.deleteIngredient(ingredient)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mb-2">
      <div class="row">
        <div class="col">
          <label for="numberOfPortions" class="form-label">{{ $t('labels.numberOfPortions') }}</label>
          <input class="form-control" id="numberOfPortions" type="number" min="1" v-model="formRecipe.numberOfPortions" />
        </div>
        <div class="col">
          <label for="prepTime" class="form-label">{{ $t('labels.prepTimeMin') }}</label>
          <input class="form-control" id="prepTime" type="number" min="1" v-model="formRecipe.prepTimeMin" />
        </div>
        <div class="col">
          <label for="cookTime" class="form-label">{{ $t('labels.cookTimeMin') }}</label>
          <input class="form-control" id="cookTime" type="number" min="1" v-model="formRecipe.cookTimeMin" />
        </div>
      </div>
    </div>
    <div class="mb-2">
      <label for="recipeFormImg" class="form-label"> {{ $t('labels.image') }} (max 1MB)</label>
      <input class="form-control" type="file" id="recipeFormImg" @change="changeFile" accept="image/*" />
    </div>
    <div class="mb-2">
      <button type="submit" class="btn btn-primary me-2" v-if="this.mode === 'add'">
        {{ $t('recipes.add') }}
      </button>
      <button type="submit" class="btn btn-primary me-2" v-if="this.mode === 'edit'">
        {{ $t('labels.save') }}
      </button>
      <button type="button" class="btn btn-light" v-on:click="this.$emit('cancel')">
        {{ $t('labels.cancel') }}
      </button>
    </div>
  </form>
</template>

<script>
import axios from 'axios'
export default {
  name: 'RecipeForm',
  data() {
    return {
      units: ['units.mass', 'units.volume', 'units.count'],
      formRecipe: this.recipe,
      itemSuggestions: [],
      itemSearch: '',
      newItem: {},
      itemCategories: [],
    }
  },
  props: {
    recipe: {
      type: Object,
      default: function () {
        return {
          name: '',
          ingredients: [],
          instructions: '',
          tags: [],
          prepTimeMin: null,
          cookTimeMin: null,
          numberOfPortions: null,
          img: undefined,
        }
      },
    },
    mode: {
      type: String,
      required: true,
      validator: function (value) {
        return ['add', 'edit'].indexOf(value) !== -1
      },
    },
  },
  methods: {
    async itemSearchChange() {
      var selected = false
      if (this.itemSearch.length >= 2) {
        if (this.itemSearch.indexOf('🆕') !== 0) {
          for (const sug of this.itemSuggestions) {
            if (sug.name + (sug.emoji ? ' ' + sug.emoji : '') === this.itemSearch) {
              selected = true
              this.formRecipe.ingredients.push({ item: await this.getItems({ id: sug._id }), quantity: 0 })
              this.itemSearch = ''
              break
            }
          }
          if (!selected) {
            this.itemSuggestions = await this.getItems({ search: this.itemSearch, limit: 5 })
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
          this.itemCategories = await this.getItemCategories()
          this.newItem = { name: this.itemSearch.substring(2), itemCategory: '', unit: '' }
          this.itemSearch = ''
          this.itemSuggestions = []
        }
      } else {
        this.itemSuggestions = []
      }
    },
    async getItems(params) {
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/items', {
          params: params,
          withCredentials: true,
        })
        if (res.status === 200) {
          return res.data.data
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
    async getItemCategories(params) {
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/itemCategories', {
          params: params,
          withCredentials: true,
        })
        if (res.status === 200) {
          return res.data.data
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
    deleteIngredient(ingredient) {
      const index = this.formRecipe.ingredients.indexOf(ingredient)
      if (index !== -1) {
        this.formRecipe.ingredients.splice(index, 1)
      }
    },
    async createItem(item) {
      try {
        const res = await axios.post(process.env.VUE_APP_BACKEND_URL + '/api/items', item, {
          withCredentials: true,
        })
        if (res.status === 200) {
          return res.data.data
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
    changeFile(form) {
      if (form.target.files.length === 1 && form.target.files[0].size < 1000000) {
        this.formResource.img = form.target.files[0]
      } else {
        this.formResource.img = undefined
      }
    },
  },
  watch: {
    recipe: function () {
      this.formRecipe = this.recipe
    },
  },
}
</script>

<style></style>
