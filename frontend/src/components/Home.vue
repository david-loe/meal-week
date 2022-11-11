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
    await this.$root.load()
  },
}
</script>

<style>
</style>