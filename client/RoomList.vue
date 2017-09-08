<template>
  <div id="room-list">
    <md-list>
      <md-list-item v-for="room in rooms" :href="room.id">
        <md-icon v-if="room.has_password">group</md-icon>
        <md-icon v-else>lock</md-icon>
        <span>{{ room.name }}</span>
        <!-- <md-divider></md-divider> -->
      </md-list-item>
    </md-list>
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
    var list = document.getElementById("room-list").__vue__
    list.rooms = res.data
  })
  .catch((err) => {
    console.log(err)
  })
</script>

<style>
#room-list ul {
  padding-top: 0;
}
</style>
