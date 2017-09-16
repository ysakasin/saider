<template>
  <div id="room">
    <h1>{{ name }}</h1>
    <DialogLogin ref="dialog-login"></DialogLogin>
    <AlertDisconnect></AlertDisconnect>
  </div>
</template>

<script>
import axios from 'axios'
import path from 'path'
import io from 'socket.io-client'

import AlertDisconnect from './AlertDisconnect.vue'
import DialogLogin from './DialogLogin.vue'

export default {
  components: {
    AlertDisconnect,
    DialogLogin
  },
  data () {
    return {
      name: "",
      password: ""
    }
  },
  mounted() {
    const api_path = path.join('/api/rooms', window.location.pathname)
    const vue_this = this
    axios.get(api_path)
      .then((res) => {
        const room = res.data.room
        vue_this.name = room.name
        if (room.is_need_password) {
          vue_this.$refs['dialog-login'].open()
        }
        else {
          vue_this.$refs['dialog-login'].join()
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
}
</script>
