<template>
  <div>
    <div v-if="mode ==='add'">
      <div v-if="!showImport" class="d-flex justify-content-end">
        <button type="button" class="btn btn-info btn-sm" @click="showImport = true">{{$t('labels.import')}}</button>
      </div>
      <form v-else @submit.prevent="importer()">
        <div class="mb-2">
          <select class="form-select" id="recipeFormSource" v-model="sourceId" required>
            <option selected disabled value="">{{$t('labels.chooseSource')}}</option>
            <option v-for="(source, index) in sources" :key="source.key" :value="index">
              {{ source.name }}
            </option>
          </select>
        </div>
        <div class="mb-2">
          <label for="recipeFormURL" class="form-label">
            {{ $t('labels.url') }}
          </label>
          <input type="text" class="form-control" id="recipeFormURL" :pattern="sources[parseInt(sourceId)] ? '.*'+ sources[parseInt(sourceId)].regex +'.*': ''" v-model="importUrl" required/>
        </div>
        <div class="mb-2">
          <button type="submit" class="btn btn-info me-2" >{{ $t('labels.import') }}</button>
          <button type="button" class="btn btn-light" @click="showImport = false">{{ $t('labels.cancel') }}</button>
        </div>

      </form>
      <div v-if="importErrors.length > 0" class="alert alert-warning alert-dismissible" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <ul>
          <li v-for="error of importErrors" :key="error">{{error}}</li>
        </ul>
        <button type="button" class="btn-close" @click="importErrors=[]"></button>
      </div>
    </div>
    
    <form
    autocomplete="off"
    @submit.prevent="$emit(mode, formRecipe);clear()">
    <div class="mb-2">
      <label for="recipeFormName" class="form-label">
        {{ $t('labels.name') }}
      </label>
      <input type="text" class="form-control" id="recipeFormName" v-model="formRecipe.name" required :disabled="mode === 'edit'" />
    </div>
    <div class="mb-2">
      <label for="recipeFormCategories" class="form-label"> {{ $t('headlines.categories') }}</label>
      <select class="form-select" id="recipeFormCategories" @change="selectCategory($event)">
          <option selected disabled value="NaN">{{$t('labels.addCategory')}}</option>
          <option v-for="(category, index) in $root.recipeCategories" :key="category._id" :value="index">
            {{ $t(category.name) + (category.emoji ? ' ' + category.emoji : '') }}
          </option>
        </select>
        <div>
          <div v-for="(category, index) in formRecipe.recipeCategories" class="badge bg-light text-dark text-nowrap fs-6 ms-1 mt-1" :key="category._id">
            {{ $t(category.name) + ' ' + (category.emoji ? ' ' + category.emoji : '') }}
            <span class="text-dark ms-1" @click="formRecipe.recipeCategories.splice(index, 1)" style="cursor: pointer"><i class="bi bi-x-lg"></i></span>
          </div>
        </div>
    </div>
    <div class="mb-2">
      <label for="addIngredient" class="form-label">{{ $t('headlines.ingredients') }}</label>
      <table class="table align-middle">
        <tbody>
          <tr class="mb-1">
            <td colspan="3">
              <item-search @new="createNewItem" @selected="addIngredient"></item-search>
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
                      <option v-for="unit in $root.units" :value="unit._id" :key="unit._id">
                        {{ $t(unit.name) }}
                      </option>
                    </select>
                  </td>
                  <td>
                    <select class="form-select" v-model="newItem.itemCategory">
                      <option disabled value="">{{ $t('labels.chooseCategory') }}</option>
                      <option v-for="category in $root.itemCategories" :value="category._id" :key="category._id">
                        {{ $t(category.name) + ' ' + (category.emoji ? ' ' + category.emoji : '') }}
                      </option>
                    </select>
                  </td>
                </tr>
              </table>
              <button
                type="button"
                class="btn btn-secondary btn-sm mx-auto"
                @click="createNewItemAndAddToRecipe(newItem)"
                :disabled="newItem.itemCategory === '' || newItem.unit === ''"
              >
                {{ $t('labels.addItem') }}
              </button>
              <button
                type="button"
                class="btn btn-light btn-sm"
                @click="newItem = {}; showNewItemDialog = false">
                {{ $t('labels.cancel') }}
              </button>
            </td>
          </tr>
          <tr v-for="ingredient in formRecipe.ingredients" :key="ingredient.item._id">
            <td>{{ ingredient.item.name + (ingredient.item.emoji ? ' ' + ingredient.item.emoji : '') }}</td>
            <td>
              <div class="input-group" style="max-width: 10em">
                <input class="form-control" type="number" step="any" min="0.1" v-model="ingredient.displayQuantity" @change="quantityChange(ingredient)" :ref="'ing' + ingredient.item._id" />
                <select class="form-select" id="recipeFormUnit" v-model="ingredient.displayUnit" @change="selectUnit($event, ingredient)" style="max-width: 4.5em">
                  <option selected :value="ingredient.item.unit.name">{{$t(ingredient.item.unit.name)}}</option>
                  <option v-for="unit in getAdditionalUnits(ingredient.item)" :key="unit" :value="unit">
                    {{ $t(unit) }}
                  </option>
                </select>
              </div>
            </td>
            <td>
              <button type="button" class="btn btn-danger btn-sm" @click="deleteIngredient(ingredient)">
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
          <div><button type="button" class="btn btn-danger btn-sm" @click="deleteInstruction(instruction)">
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
        <div class="input-group input-group-sm" style="max-width: 6em;">
                <input class="form-control" type="number" step="any" min="0" :max="getIngredientQuantityByItemId(ingredient.item._id)" v-model="ingredient.displayQuantity" @change="quantityChange(ingredient)" required/>
                <span class="input-group-text">
                  {{ $t(ingredient.displayUnit) }}
                </span>
              </div>
        </div>
        <div class="col-auto">
        <button type="button" class="btn btn-danger btn-sm" @click="deleteInstructionIngredient(instruction, ingredient)">
                <i class="bi bi-trash"></i>
              </button>
        </div>

        </div>
        </div>
        </div>
        
      </div>
      <div class="mt-1">
      <button type="button" class="btn btn-light btn-sm" @click="formRecipe.instructions.push({text: '', ingredients: []})">{{$t('labels.addInstruction')}}</button>
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
      <label for="recipeFormTags" class="form-label"> {{ $t('headlines.tags') }}</label>
      <select class="form-select" id="recipeFormTags" @change="selectTag($event)">
        <option selected disabled value="NaN">{{$t('labels.addTag')}}</option>
        <option v-for="(tag, index) in $root.tags" :key="tag._id" :value="index">
          {{ $t(tag.name) + (tag.emoji ? ' ' + tag.emoji : '') }}
        </option>
      </select>
      <div>
        <div v-for="(tag, index) in formRecipe.tags" class="badge text-dark text-nowrap fs-6 ms-1 mt-1" :key="tag._id" style="background-color: rgba(var(--bs-info-rgb),0.25)">
          {{ $t(tag.name) + ' ' + tag.emoji }}
          <span class="text-dark ms-1" @click="formRecipe.tags.splice(index, 1)" style="cursor: pointer"><i class="bi bi-x-lg"></i></span>
        </div>
      </div>
    </div>
    <div class="mb-2">
      <button type="submit" class="btn btn-primary me-2" v-if="mode === 'add'" :disabled="formRecipe.ingredients.length < 1">
        {{ $t('recipes.add') }}
      </button>
      <button type="submit" class="btn btn-primary me-2" v-if="mode === 'edit'">
        {{ $t('labels.save') }}
      </button>
      <button
        type="button"
        class="btn btn-light"
        @click="$emit('cancel');clear()">
        {{ $t('labels.cancel') }}
      </button>
    </div>
  </form>
  </div>
</template>

<script>
import axios from 'axios'
import ItemSearch from './ItemSearch.vue'
import { nextTick } from 'vue'
export default {
  name: 'RecipeForm',
  emits: ['add', 'edit', 'cancel'],
  components: {
    ItemSearch
  },
  data() {
    return {
      importUrl: '',
      sourceId: '',
      sources: [{key: 'fwl', name: 'Food with Love APP', regex: '[0-9a-fA-F]{24}'},{key: 'chefkoch', name: 'Chefkoch', regex: '\\d{13,17}' },{key:'cookidoo', name: 'Cookidoo', regex:'r\\d{5,7}'}],
      showImport: false,
      importErrors: [],
      formRecipe: this.recipe,
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
          recipeCategories: []
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
        recipeCategories: []
      }
      this.newItem = {}
      this.showNewItemDialog = false
      this.importErrors = []
      this.showImport = false
    },
    addIngredient(item){
      const index = this.formRecipe.ingredients.findIndex((e)=>item._id == e.item._id)
      if(index === -1){
        this.formRecipe.ingredients.push({ item: item, displayQuantity: 0, displayUnit: item.unit.name })
      }
      nextTick(() => {
        this.$refs['ing' + item._id][0].focus()
      })

    },
    createNewItem(item){
      this.newItem = item
      this.showNewItemDialog = true
    },
    deleteIngredient(ingredient) {
      const index = this.formRecipe.ingredients.indexOf(ingredient)
      if (index !== -1) {
        for(var instruction of this.formRecipe.instructions){
          if(instruction.ingredients){
            for(var i = 0; i < instruction.ingredients.length; i++){
              if(instruction.ingredients[i].item._id === ingredient.item._id){
                instruction.ingredients.splice(i, 1)
                break
              }
            }
          }
        }
        this.formRecipe.ingredients.splice(index, 1)
      }
    },
    async createNewItemAndAddToRecipe(item) {
      try {
        const res = await axios.post(process.env.VUE_APP_BACKEND_URL + '/api/items', item, {
          withCredentials: true,
        })
        if (res.status === 200) {
          this.formRecipe.ingredients.push({ item: res.data.result, displayQuantity: 0, displayUnit: res.data.result.unit.name })
          this.newItem = {}
          this.showNewItemDialog = false
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
    async importer(){
      const id = this.importUrl.match(this.sources[parseInt(this.sourceId)].regex)[0]
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/recipe-parser', {
          params: {source: this.sources[parseInt(this.sourceId)].key, id: id},
          withCredentials: true,
        })
        if (res.status === 200) {
          Object.assign(this.formRecipe, res.data.result)
          this.showImport = false
          this.importUrl = ''
          this.importErrors = res.data.errors
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
        if(instruction.ingredients){
          for (const ingredient of instruction.ingredients){
            if(ingredient.item._id === item._id){
              allReadyIn = true
              break
            }
          }
        }else{
          instruction.ingredients = []
        }
        
        if(!allReadyIn){
          const ing = Object.assign({}, this.formRecipe.ingredients[event.target.value])
          instruction.ingredients.push(ing)
        }
      }
      event.target.value = 'NaN'
    },
    getIngredientQuantityByItemId(itemId){
      for(const ingredient of this.formRecipe.ingredients){
        if(ingredient.item._id === itemId){
          return ingredient.displayQuantity
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
    selectTag(event){
      var allReadyIn = false
      if(!isNaN(parseInt(event.target.value))){
        const tag = this.$root.tags[event.target.value]
        for (const tagIn of this.formRecipe.tags){
          if(tagIn._id === tag._id){
            allReadyIn = true
            break
          }
        }
        if(!allReadyIn){
          this.formRecipe.tags.push(tag)
        }
      }
      event.target.value = 'NaN'
    },
    selectCategory(event){
      var allReadyIn = false
      if(!isNaN(parseInt(event.target.value))){
        const category = this.$root.recipeCategories[event.target.value]
        for (const categoryIn of this.formRecipe.recipeCategories){
          if(categoryIn._id === category._id){
            allReadyIn = true
            break
          }
        }
        if(!allReadyIn){
          this.formRecipe.recipeCategories.push(category)
        }
      }
      event.target.value = 'NaN'
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
    getAdditionalUnits(item){
      const units = []
      for (const converter of item.converter){
        units.push(converter.unit.name)
      }
      for (const miscellaneousUnit of item.unit.miscellaneousUnits){
        units.push(miscellaneousUnit.name)
      }
      return units
    },
    selectUnit(event, ingredient){
      ingredient.displayUnit = event.target.value

      for (const instruction of this.formRecipe.instructions){
        if(instruction.ingredients){
          for (const ing of instruction.ingredients){
            if(ingredient.item._id == ing.item._id){
              ing.displayUnit = ingredient.displayUnit
            }
          }
        }
      }
      this.quantityChange(ingredient)
    },
    quantityChange(ingredient){
      var factor = 1
      if(ingredient.displayUnit != ingredient.item.unit.name){
        var match = false
        for (const converter of ingredient.item.converter){
          if(converter.unit.name == ingredient.displayUnit){
            factor = 1 / converter.factor
            match = true
            break
          }
        }
        if(!match){
          for (const miscellaneousUnit of ingredient.item.unit.miscellaneousUnits){
            if(miscellaneousUnit.name == ingredient.displayUnit){
              factor = miscellaneousUnit.factor
              break
            }
          }
        }
      }

      ingredient.quantity = ingredient.displayQuantity * factor
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
