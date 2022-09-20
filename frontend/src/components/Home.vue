<template>
  <div class="container">
    <p>HOME</p>
  </div>
</template>

<script>
export default {
  name: 'Home',
  props: [],
  components: {
  },
  methods: {
  },
  async beforeMount() {
    if (!this.$root.loaded) {
      await this.$root.load()
    }
  },
}
</script>

<style>
</style>