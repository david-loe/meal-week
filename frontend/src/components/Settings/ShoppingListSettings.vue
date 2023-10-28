<template>
  <div class="container mb-3">
    <h2>{{ $t('headlines.shoppingList') }}</h2>
    <div class="container mb-3">
      <h3 id="changeOrder">{{ $t('settings.shoppingList.changeOrder.title') }}</h3>
      <p>{{ $t('settings.shoppingList.changeOrder.description') }}</p>
        <div>
          <draggable 
            v-model="settings.shoppingListOrder"
            :itemKey="(a)=>a"
            class="list-group mb-2"
            style="width: fit-content;"
            >
            <template #item="{element}">
              <div class="list-group-item list-group-item-action pe-5">{{$t($root.getById('itemCategories', element).name) + ($root.getById('itemCategories', element).emoji ? ' ' + $root.getById('itemCategories', element).emoji : '')}}</div>
            </template>
          </draggable>
        </div>
        <button type="submit" class="btn btn-secondary position-relative" @click="changeSettings(settings)">
          {{ $t('labels.save') }}
        </button>
    </div>
    <div class="container">
      <h3 id="hideItem">{{ $t('settings.shoppingList.hideItem.title') }}</h3>
      <p>{{ $t('settings.shoppingList.hideItem.description') }}</p>

      <div>
        <item-search class="mb-1" :allowNew="false" @selected="addHidden"></item-search>
        <div style="max-height: 400px;overflow-y: scroll;">
          <table class="table align-middle">
            <tbody>
              <tr v-for="(entry, index) in settings.hideInShoppingList" :key="entry.item._id">
                <td>{{ entry.item.name + (entry.item.emoji ? ' ' + entry.item.emoji : '') }}</td>
                <td>
                  <div class="input-group" style="max-width: 10em">
                    <input class="form-control" type="number" step="any" v-model="entry.quantity" :ref="entry.item._id"/>
                    <span class="input-group-text">
                      {{ $t(entry.item.unit.name) }}
                    </span>
                  </div>
                </td>
                <td>
                  <button type="button" class="btn btn-danger btn-sm" @click="settings.hideInShoppingList.splice(index, 1)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <button type="submit" class="btn btn-secondary position-relative" @click="changeSettings(settings)">
          {{ $t('labels.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import draggable from 'vuedraggable'
import ItemSearch from '../Recipes/ItemSearch.vue'
import { nextTick } from 'vue'
export default {
  name: 'ShoppingListSettings',
  data() {
    return {
      settings: {},
    }
  },
  props: [],
  components: {
    draggable,
    ItemSearch
  },
  methods: {
    async changeSettings(newSettings) {
      try {
        const res = await axios.post(
          process.env.VUE_APP_BACKEND_URL + '/api/user/settings',
          newSettings,
          {
            withCredentials: true,
          },
        )
        if (res.status === 200) {
          this.$root.user.settings = res.data.result
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
    addHidden(item){
      const index = this.settings.hideInShoppingList.findIndex((e)=>item._id == e.item._id)
      if(index === -1){
        this.settings.hideInShoppingList.push({item:item,quantity:null})
      }
      nextTick(() => {
        this.$refs[item._id][0].focus()
      })
    }
  },
  async beforeMount() {
    await this.$root.load()
    this.settings = this.$root.user.settings
  },
}
</script>

<style>
</style>