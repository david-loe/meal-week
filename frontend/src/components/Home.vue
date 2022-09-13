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
  beforeMount() {
    if (!this.$root.loaded) {
      this.$root.load()
    }
  },
}
</script>

<style>
</style>