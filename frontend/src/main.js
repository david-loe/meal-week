import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import vSelect from './vue-select.js'
import 'vue-select/dist/vue-select.css'
import './vue-select.css'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "@fortawesome/fontawesome-free/css/solid.min.css"
import "@fortawesome/fontawesome-free/css/fontawesome.min.css"
import "@fortawesome/fontawesome-free/css/brands.min.css"

import i18n from './i18n'

createApp(App).component('v-select', vSelect).use(i18n).use(router).mount('#app')
