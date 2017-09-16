<template>
  <md-dialog ref="dialog" :md-click-outside-to-close="false">
    <md-dialog-title>ログイン</md-dialog-title>

    <md-dialog-content>

      <p>この部屋へのログインにはパスワードが必要です</p>

      <md-input-container>
        <label>パスワード</label>
        <md-input v-model="password" type="password"></md-input>
      </md-input-container>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="leave()">キャンセル</md-button>
      <md-button class="md-primary" @click="join()">ログイン</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
export default {
  data () {
    return {
      password: ""
    }
  },
  sockets: {
    connect () {
      this.$socket.emit("auth", {room: window.room, password: this.password})
    }
  },
  methods: {
    join () {
      console.log("join")
      this.$socket.open()
      this.close()
    },
    leave () {
      window.location.pathname = '/'
    },
    open () {
      this.$refs['dialog'].open()
    },
    close () {
      this.$refs['dialog'].close()
    }
  }
}
</script>
