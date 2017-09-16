<template>
  <md-dialog-alert
    :md-title="title"
    :md-content="text"
    :md-click-outside-to-close="false"
    ref="alert">
  </md-dialog-alert>
</template>

<script>
export default {
  data() {
    return {
      title: "切断されました",
      text: "ルームとの接続が切断されました。再度ログインする場合にはリロードを試みてください。"
    }
  },
  sockets: {
    disconnect() {
      this.$refs['alert'].open()
      this.$socket.close()
    }
  }
}
</script>
