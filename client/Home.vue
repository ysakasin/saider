<template>
  <div id="app">
    <md-toolbar class="main-header">
      <h1 class="md-title" style="flex: 1">Saider</h1>
      <md-button @click="openDialog()">部屋作成</md-button>
    </md-toolbar>
    <div class="main-content">
      <RoomList></RoomList>
    </div>
    <DialogNewRoom ref="dialog"></DialogNewRoom>
  </div>
</template>

<script>
import RoomList from './RoomList.vue'
import DialogNewRoom from './DialogNewRoom.vue'

export default {
  components: {
    RoomList,
    DialogNewRoom
  },
  methods: {
    openDialog() {
      this.$refs['dialog'].openDialog();
    }
  }
}
</script>

<style>
.main-header {
  color: #fff!important;
}
</style>
