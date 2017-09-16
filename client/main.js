import Vue from 'vue'
import VueMaterial from 'vue-material'
import App from './App.vue'
import Home from './Home.vue'

import VueSocketio from 'vue-socket.io'
import io from 'socket.io-client'

import 'vue-material/dist/vue-material.css'

const routes = {
  '/': Home
}

window.room = window.location.pathname.slice(1)
console.log(window.room)

Vue.use(VueMaterial)
Vue.material.registerTheme({
  default: {
    primary: {
      color: 'cyan',
      hue: 500
    }
  }
})

Vue.use(VueSocketio, io(window.location.host, {autoConnect: false}))

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
