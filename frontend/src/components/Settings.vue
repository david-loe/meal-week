<template>
  <div class="container">
    <h1>{{ $t('headlines.settings') }}</h1>
    <AccountSettings></AccountSettings>
    <ShoppingListSettings></ShoppingListSettings>
    <ItemSettings></ItemSettings>
  </div>
</template>

<script>
import AccountSettings from './Settings/Account.vue'
import ShoppingListSettings from './Settings/ShoppingListSettings.vue'
import ItemSettings from './Settings/ItemSettings.vue'

export default {
  name: 'SettingsPage',
  components: {
    AccountSettings,
    ShoppingListSettings,
    ItemSettings
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