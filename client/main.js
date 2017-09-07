import Vue from 'vue'
import App from './App.vue'
import Home from './Home.vue'

const routes = {
  '/': Home
}

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
