<template>
  <div class="container">
    <div class="row justify-content-between mb-3">
      <div class="col-auto">
        <h1>{{ $t('headlines.shoppingList') }}</h1>
      </div>
      <div class="col-auto">
        <button class="btn btn-secondary position-relative" type="button" @click="shoppingListToClipboard()">
          <i class="bi bi-clipboard"></i> {{ $t('labels.copyShoppingList') }}
          <span v-if="clipboardSuccess" class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-success">
            ✔
          </span>
        </button>
      </div>
    </div>
    <div>
      <textarea class="form-control" v-model="shoppingListStr" id="shoppingListStr" rows="10"></textarea>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'ShoppingList',
  props: [],
  components: {
  },
  data() {
    return {
      shoppingList: [],
      shoppingListStr: '',
      clipboardSuccess: false,
    }
  },
  methods: {
    async generate(){
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/shopping-list', {
          params: {},
          withCredentials: true,
        })
        if (res.status === 200) {
          this.shoppingList = res.data.data
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
          this.$root.addAlert({message: error.response.data.message, title: "ERROR"})
        }
      }
      this.shoppingListToStr()
    },
    shoppingListToStr(){
      this.shoppingListStr = ''
      for(const entry of this.shoppingList){
        this.shoppingListStr += entry.quantity + this.$t(entry.item.unit.name)
        for(const converter of entry.item.converter){
          var convertedQuantiy = Math.round(entry.quantity * converter.factor * 10) /10
          this.shoppingListStr += '(~' + convertedQuantiy + this.$t(converter.unit.name) + ')'
        }
        this.shoppingListStr += ' ' + entry.item.name + (entry.item.emoji ? ' ' + entry.item.emoji : '') + '\n'
      }
    },
    async shoppingListToClipboard(){
      if (window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(this.shoppingListStr)
          this.clipboardSuccess = true
        } catch (error) {
          console.log(error)
          this.$root.addAlert({message: error, title: "ERROR"})
        }
      }
    }
  },
  async beforeMount() {
    this.generate()
    await this.$root.load()
  },
}
</script>

<style>
</style>