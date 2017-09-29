<template>
  <md-dialog ref="dialog">
    <md-dialog-title>共有メモ作成</md-dialog-title>

    <md-dialog-content>
      <md-input-container>
        <label>タイトル</label>
        <md-input v-model="title"></md-input>
      </md-input-container>

      <md-input-container>
        <label>本文</label>
        <md-textarea v-model="body" rows="5"></md-textarea>
      </md-input-container>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-accent" @click="close()">キャンセル</md-button>
      <md-button class="md-primary" @click="update()">作成</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
export default {
  data () {
    return {
      id: null,
      title: "",
      body: ""
    }
  },
  methods: {
    create () {
      this.edit(null, "", "")
    },
    edit (id, title, body) {
      this.id = id
      this.title = title
      this.body = body
      this.$refs.dialog.open()
    },
    update () {
      const data = {
        _id: this.id,
        title: this.title,
        body: this.body
      }
      this.$socket.emit("update_memo", data)
      this.close()
    },
    close () {
      this.$refs.dialog.close()
    }
  }
}
</script>

<style>
.md-dialog {
  min-width: 480px;
}

.md-input-container textarea {
  resize: both !important;
}
</style>
