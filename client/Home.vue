<template>
  <div id="app">
    <md-toolbar>
      <h1 class="md-title">Saider</h1>
    </md-toolbar>
    <div class="main-content">
      <RoomList></RoomList>
    </div>
  </div>
</template>

<script>
import RoomList from './RoomList.vue'

export default {
  components: {
    RoomList
  }
}
</script>
