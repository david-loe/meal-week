<template>
  <div class="container mb-3">
    <h2>{{ $t('headlines.shoppingList') }}</h2>
    <div class="container">
      <h3>{{ $t('settings.shoppingList.changeOrder') }}</h3>
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
          <span v-if="changeSuccess"  class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-success">
            ✔
          </span>
        </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import draggable from 'vuedraggable'
export default {
  name: 'ShoppingListSettings',
  data() {
    return {
      settings: {},
      changeSuccess: false,
    }
  },
  props: [],
  components: {
    draggable
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
          this.changeSuccess = true;
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