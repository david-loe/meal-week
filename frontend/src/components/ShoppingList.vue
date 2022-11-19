<template>
  <div class="container">
    <div class="row justify-content-between mb-3">
      <div class="col-auto">
        <h1>{{ $t('headlines.shoppingList') }}</h1>
      </div>
      <div class="col-auto">
        
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
      shoppingListStr: ''
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
        }
      }
      this.shoppingListToStr()
    },
    shoppingListToStr(){
      this.shoppingListStr = ''
      for(const entry of this.shoppingList){
        this.shoppingListStr += entry.quantity + this.$t(entry.item.unit) + ' ' + entry.item.name + (entry.item.emoji ? ' ' + entry.item.emoji : '') + '\n'
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