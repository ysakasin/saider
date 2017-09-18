<template>
  <div id="room" class="container">
    <div class="main-area">
      <md-toolbar class="main-header">
        <h1 class="md-title" style="flex: 1">{{ name }}</h1>
      </md-toolbar>
      <MemoArea></MemoArea>
      <Board></Board>
    </div>
    <DiceArea class="dice-area"></DiceArea>
    <DialogLogin ref="dialog-login"></DialogLogin>
    <AlertDisconnect></AlertDisconnect>
  </div>
</template>

<script>
import axios from 'axios'
import path from 'path'

import AlertDisconnect from './AlertDisconnect.vue'
import Board from './Board.vue'
import DialogLogin from './DialogLogin.vue'
import DiceArea from './DiceArea.vue'
import MemoArea from './MemoArea.vue'

export default {
  components: {
    AlertDisconnect,
    Board,
    DialogLogin,
    DiceArea,
    MemoArea
  },
  data () {
    return {
      name: "",
      password: ""
    }
  },
  mounted () {
    const api_path = path.join('/api/rooms', window.location.pathname)
    const vue_this = this
    axios.get(api_path)
      .then((res) => {
        const room = res.data.room
        vue_this.name = room.name
        if (room.is_need_password) {
          vue_this.$refs['dialog-login'].open()
        } else {
          vue_this.$refs['dialog-login'].join()
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
}
</script>

<style lang="scss">
@import '../node_modules/vue-material/src/core/stylesheets/variables.scss';

html, body {
  margin: 0;
  height: 100%;
  overflow-x: scroll;
}

.main-header {
  color: #fff!important;
}

#room {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
}

.main-area {
  height: 100%;
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  overflow-y: scroll;
  overflow-x: scroll;
}

.md-theme-default.md-chip.md-color-memo {
  margin-bottom: 3px;
  background-color: #ddd;
}

.dice-area {
  width: 240px;
  height: 100%;
  background-color: white;
  display: flex;
  flex-flow: column nowrap;
  box-shadow: $material-shadow-2dp;
}

.dice {
  position: absolute;
  height: 100px;
  overflow: hidden;
}

.dice img {
  width: 100px;
  height: 100px;
  position: relative;
  top: 0;
}

#amount {
  width: 100px;
  position: absolute;
  border: solid 1px #000000;
  border-radius: 5px;
  padding: 10px 0;
  text-align: center;
  background-color: #ffffff;
}
</style>
