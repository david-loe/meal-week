<template>
  <form
    autocomplete="off"
    @submit.prevent="this.$emit(this.mode, this.formRecipe);this.clear()">
    <div class="mb-2">
      <label for="recipeFormName" class="form-label">
        {{ $t('labels.name') }}
      </label>
      <input type="text" class="form-control" id="recipeFormName" v-model="formRecipe.name" required :disabled="this.mode === 'edit'" />
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
          <tr v-if="showNewItemDialog">
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
                      id="newItem_emoji"
                      v-model="newItem.emoji"
                      max-length="2"
                      placeholder="😃"
                    />
                  </td>
                  <td>
                    <select class="form-select" v-model="newItem.unit">
                      <option disabled value="">{{ $t('labels.chooseUnit') }}</option>
                      <option v-for="unit in units" :value="unit" :key="unit">
                        {{ $t(unit) }}
                      </option>
                    </select>
                  </td>
                  <td>
                    <select class="form-select" v-model="newItem.itemCategory">
                      <option disabled value="">{{ $t('labels.chooseCategory') }}</option>
                      <option v-for="category in $root.itemCategories" :value="category._id" :key="category._id">
                        {{ $t(category.name) + ' ' + category.emoji }}
                      </option>
                    </select>
                  </td>
                </tr>
              </table>
              <button
                type="button"
                class="btn btn-secondary btn-sm mx-auto"
                v-on:click="createNewItemAndAddToRecipe(newItem)"
                :disabled="newItem.itemCategory === '' || newItem.unit === ''"
              >
                {{ $t('labels.addItem') }}
              </button>
              <button
                type="button"
                class="btn btn-light btn-sm"
                v-on:click="newItem = {}; showNewItemDialog = false">
                {{ $t('labels.cancel') }}
              </button>
            </td>
          </tr>
          <tr v-for="ingredient in formRecipe.ingredients" :key="ingredient.item._id">
            <td>{{ ingredient.item.name + (ingredient.item.emoji ? ' ' + ingredient.item.emoji : '') }}</td>
            <td>
              <div class="input-group" style="max-width: 10em">
                <input class="form-control" type="number" min="1" v-model="ingredient.quantity" />
                <span class="input-group-text">
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
      <label for="recipeFormDes" class="form-label">
        {{ $t('headlines.instructions') }}
      </label>
      <div class="row" v-for="(instruction, index) in formRecipe.instructions" :key="index">
        <div class="col-auto">
          <div><h3>{{ index + 1 }}.</h3></div>
          <div><button type="button" class="btn btn-danger btn-sm" v-on:click="this.deleteInstruction(instruction)">
                <i class="bi bi-trash"></i>
              </button></div>
        </div>
        <div class="col">
        <div class="mb-1">
        <textarea class="form-control" rows="3" v-model="instruction.text" required></textarea>
        </div>
        <div>
        <select class="form-select form-select-sm" @change="selectInstructionIngredients(instruction, $event)">
          <option selected disabled value="NaN">{{$t('labels.addIngredientToInstruction')}}</option>
          <option v-for="(ingredient, index) in formRecipe.ingredients" :key="ingredient.item._id" :value="index">
            {{ ingredient.item.name + (ingredient.item.emoji ? ' ' + ingredient.item.emoji : '') }}
          </option>
        </select>
        <div class="row" v-for="ingredient in instruction.ingredients" :key="ingredient.item._id">
        <div class="col">{{ ingredient.item.name + (ingredient.item.emoji ? ' ' + ingredient.item.emoji : '') }}</div>
        <div class="col-auto">
        <div class="input-group input-group-sm" style="max-width: 10em">
                <input class="form-control" type="number" min="0" :max="getIngredientQuantityByItemId(ingredient.item._id)" v-model="ingredient.quantity" />
                <span class="input-group-text">
                  {{ $t(ingredient.item.unit) }}
                </span>
              </div>
        </div>
        <div class="col-auto">
        <button type="button" class="btn btn-danger btn-sm" v-on:click="this.deleteInstructionIngredient(instruction, ingredient)">
                <i class="bi bi-trash"></i>
              </button>
        </div>

        </div>
        </div>
        </div>
        
      </div>
      <div class="mt-1">
      <button type="button" class="btn btn-light btn-sm" v-on:click="formRecipe.instructions.push({text: '', ingredients: []})">{{$t('labels.addInstruction')}}</button>
      </div>
    </div>

    <div class="mb-2">
      <div class="row">
        <div class="col">
          <label for="numberOfPortions" class="form-label">{{ $t('labels.numberOfPortions') }}</label>
          <input class="form-control" id="numberOfPortions" type="number" min="1" v-model="formRecipe.numberOfPortions" required />
        </div>
        <div class="col">
          <label for="prepTime" class="form-label">{{ $t('labels.prepTimeMin') }}</label>
          <input class="form-control" id="prepTime" type="number" min="0" v-model="formRecipe.prepTimeMin" required />
        </div>
        <div class="col">
          <label for="cookTime" class="form-label">{{ $t('labels.cookTimeMin') }}</label>
          <input class="form-control" id="cookTime" type="number" min="0" v-model="formRecipe.cookTimeMin" required />
        </div>
      </div>
    </div>
    <div class="mb-2">
      <label for="recipeFormImg" class="form-label"> {{ $t('labels.image') }} (max 10MB)</label>
      <input class="form-control" type="file" id="recipeFormImg" @change="changeFile" accept="image/*" />
      <img class="mt-1" v-if="formRecipe.image" :src="formRecipe.image" height="100" width="192" style="object-fit: cover" />
    </div>
    <div class="mb-2">
      <button type="submit" class="btn btn-primary me-2" v-if="this.mode === 'add'" :disabled="formRecipe.ingredients.length < 1">
        {{ $t('recipes.add') }}
      </button>
      <button type="submit" class="btn btn-primary me-2" v-if="this.mode === 'edit'">
        {{ $t('labels.save') }}
      </button>
      <button
        type="button"
        class="btn btn-light"
        v-on:click="this.$emit('cancel');this.clear()">
        {{ $t('labels.cancel') }}
      </button>
    </div>
  </form>
</template>

<script>
import axios from 'axios'
export default {
  name: 'RecipeForm',
  emits: ['add', 'edit', 'cancel'],
  data() {
    return {
      units: ['units.mass', 'units.volume', 'units.count'],
      formRecipe: this.recipe,
      itemSuggestions: [],
      itemSearch: '',
      newItem: {},
      showNewItemDialog: false,
    }
  },
  props: {
    recipe: {
      type: Object,
      default: function () {
        return {
          name: '',
          ingredients: [],
          instructions: [],
          tags: [],
          prepTimeMin: null,
          cookTimeMin: null,
          numberOfPortions: null,
          image: undefined,
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
    clear() {
      this.formRecipe = {
        name: '',
        ingredients: [],
        instructions: [],
        tags: [],
        prepTimeMin: null,
        cookTimeMin: null,
        numberOfPortions: null,
        image: undefined,
      }
      this.newItem = {}
      this.itemSearch = ''
      this.itemSuggestions = []
      this.showNewItemDialog = false
    },
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
          this.newItem = { name: this.itemSearch.substring(2), itemCategory: '', unit: '' }
          this.showNewItemDialog = true
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

    deleteIngredient(ingredient) {
      const index = this.formRecipe.ingredients.indexOf(ingredient)
      if (index !== -1) {
        this.formRecipe.ingredients.splice(index, 1)
        for(var instruction of this.formRecipe.instructions){
          for(var i = 0; i <= instruction.ingredients.length; i++){
            if(instruction.ingredients[i].item._id === ingredient.item._id){
              instruction.ingredients.splice(i, 1)
            }
          }
        }
      }
    },
    async createNewItemAndAddToRecipe(item) {
      try {
        const res = await axios.post(process.env.VUE_APP_BACKEND_URL + '/api/items', item, {
          withCredentials: true,
        })
        if (res.status === 200) {
          this.formRecipe.ingredients.push({ item: res.data.result, quantity: 0 })
          this.newItem = {}
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
        }
      }
    },
    deleteInstruction(instruction) {
      const index = this.formRecipe.instructions.indexOf(instruction)
      if (index !== -1) {
        this.formRecipe.instructions.splice(index, 1)
      }
    },
    selectInstructionIngredients(instruction, event){
      var allReadyIn = false
      if(!isNaN(parseInt(event.target.value))){
        const item = this.formRecipe.ingredients[event.target.value].item
        for (const ingredient of instruction.ingredients){
          if(ingredient.item._id === item._id){
            allReadyIn = true
            break
          }
        }
        if(!allReadyIn){
          instruction.ingredients.push({quantity: this.formRecipe.ingredients[event.target.value].quantity, item: item})
        }
      }
      event.target.value = 'NaN'
    },
    getIngredientQuantityByItemId(itemId){
      for(const ingredient of this.formRecipe.ingredients){
        if(ingredient.item._id === itemId){
          return ingredient.quantity
        }
      }
      return null
    },
    deleteInstructionIngredient(instruction, ingredient){
      const index = instruction.ingredients.indexOf(ingredient)
      if (index !== -1) {
        instruction.ingredients.splice(index, 1)
      }
    },
    changeFile(form) {
      const reader = new FileReader()
      if (form.target.files.length === 1 && form.target.files[0].size < 10000000) {
        reader.readAsDataURL(form.target.files[0])
        reader.onload = async () => {
          this.formRecipe.image = await this.resizedataURL(reader.result, 450)
        }
      } else {
        alert(this.$t('alerts.imageToBig'))
        this.formRecipe.image = undefined
      }
    },
    // From https://stackoverflow.com/a/52983833/13582326
    resizedataURL(datas, wantedWidth) {
      return new Promise((resolve) => {
        // We create an image to receive the Data URI
        var img = document.createElement('img')

        // When the img "onload" is triggered we can resize the image.
        img.onload = function () {
          // We create a canvas and get its context.
          var canvas = document.createElement('canvas')
          var ctx = canvas.getContext('2d')

          // We set the dimensions at the wanted size.
          canvas.width = wantedWidth
          canvas.height = img.height * (wantedWidth / img.width)

          // We resize the image with the canvas method drawImage();
          ctx.drawImage(this, 0, 0, canvas.width, canvas.height)

          var dataURI = canvas.toDataURL('image/jpeg', 0.85)

          // This is the return of the Promise
          resolve(dataURI)
        }
        // We put the Data URI in the image's src attribute
        img.src = datas
      })
    },
  },
  watch: {
    recipe: function () {
      this.formRecipe = this.recipe
    },
  },
}
</script>

<style>
#newItem_emoji:placeholder-shown {
  opacity: 0.5;
  border-color: rgb(103, 106, 109);
}
</style>
