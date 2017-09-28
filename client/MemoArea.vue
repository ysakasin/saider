<template>
  <div class="memo-area">
    <div class="add-memo has-ripple" v-on:click="create_memo">
      <md-ink-ripple></md-ink-ripple>
      <i class="material-icons">note_add</i>
    </div>
    <div>
      <md-chip v-for="memo in memoes">{{ memo.title }}</md-chip>
    </div>
    <DialogMemoEdit ref="memo-editor"></DialogMemoEdit>
  </div>
</template>

<script>
import DialogMemoEdit from "./DialogMemoEdit.vue"

let hoge = []

export default {
  components: {
    DialogMemoEdit
  },
  data () {
    return {
      memoes: []
    }
  },
  sockets: {
    update_memo (data) {
      console.log(data)
      const memo = {
        title: data.title,
        body: data.body
      }
      this.push(memo)
      // console.log(this.memoes[data._id])
    }
  },
  methods: {
    create_memo () {
      this.$refs["memo-editor"].create()
    },
    push (data) {
      this.memoes.push(data)
      console.log(this.memoes)
    }
  }
}
</script>

<style lang="scss">
.memo-area {
  position: absolute;
  top: 64px;
  left: 0px;
  padding: 3px 0 0 70px;
  margin-right: 240px;

  .md-theme-default.md-chip {
    margin-bottom: 3px;
    margin-left: 3px;
    background-color: #ddd;
  }
}


.add-memo {
  flex: none;
  position: fixed;
  height: 60px;
  width: 60px;
  background: #FFC107;
  border-radius: 30px;
  cursor: pointer;

  top: 67px;
  left: 6px;

  .md-ink-ripple {
    border-radius: 30px;
  }

  i {
    user-select: none;
    display: block;
    width: 36px;
    height: 36px;
    font-size: 36px;
    margin: 12px;
    color: white;
  }
}
</style>
