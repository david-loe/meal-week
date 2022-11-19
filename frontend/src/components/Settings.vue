<template>
  <div class="container">
    <h1>{{ $t('headlines.settings') }}</h1>
    <Account></Account>
    <ShoppingListSettings></ShoppingListSettings>
  </div>
</template>

<script>
import Account from './Settings/Account.vue'
import ShoppingListSettings from './Settings/ShoppingListSettings.vue'
export default {
  name: 'Settings',
  components: {
    Account,
    ShoppingListSettings
  },
  props: [],
  data() {
    return {}
  },
  methods: {},
  async beforeMount() {
    await this.$root.load()
  },
}
</script>

<style>
</style>