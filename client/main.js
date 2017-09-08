import Vue from 'vue'
import VueMaterial from 'vue-material'
import App from './App.vue'
import Home from './Home.vue'

import 'vue-material/dist/vue-material.css'

const routes = {
  '/': Home
}

Vue.use(VueMaterial)

new Vue({
  el: '#app',
  data: {
    currentRoute: window.location.pathname
  },
  computed: {
    ViewComponent () {
      return routes[this.currentRoute] || App
    }
  },
  render (h) { return h(this.ViewComponent) }
})
