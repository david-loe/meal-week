<template>
  <div class="container">
    <h1>{{ $t('headlines.settings') }}</h1>
    <Account></Account>
  </div>
</template>

<script>
import Account from './Settings/Account.vue'
export default {
  name: 'Settings',
  components: {
    Account
  },
  props: [],
  data() {
    return {}
  },
  methods: {},
  beforeMount() {
    if (!this.$root.loaded) {
      this.$root.load()
    }
  },
}
</script>

<style>
</style>