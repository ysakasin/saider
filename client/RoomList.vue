<template>
  <div id="aaa">
    <h1 v-for="room in rooms">
      {{ room }}
    </h1>
  </div>
</template>

<script>
import axios from 'axios'

let rooms = []
export default {
  data () {
    return {
      rooms: rooms
    }
  }
}

axios.get('/api/rooms')
  .then((res) => {
    console.log(res)
    var list = document.getElementById("aaa").__vue__
    list.rooms = res.data.map((r) => r.name)
  })
  .catch((err) => {
    console.log(err)
  })
</script>
