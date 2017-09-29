<template>
  <div class="memo-area">
    <div class="add-memo has-ripple" v-on:click="create_memo">
      <md-ink-ripple></md-ink-ripple>
      <i class="material-icons">note_add</i>
    </div>
    <div>
      <span v-for="memo in memoes">
        <span v-on:click="update_memo(memo)">
          <md-chip>{{ memo.title }}</md-chip>
        </span>
      </span>
    </div>
    <DialogMemoEdit ref="memo-editor"></DialogMemoEdit>
  </div>
</template>

<script>
import DialogMemoEdit from "./DialogMemoEdit.vue"

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
    init_memo (memoes) {
      this.memoes = memoes
    },
    update_memo (data) {
      const memo = {
        _id: data._id,
        title: data.title,
        body: data.body
      }
      const index = this.memoes.findIndex((col) => { return col._id === data._id })
      if (index >= 0) {
        this.memoes.splice(index, 1, memo)
      } else {
        this.push(memo)
      }
    }
  },
  methods: {
    create_memo () {
      this.$refs["memo-editor"].create()
    },
    update_memo (memo) {
      this.$refs["memo-editor"].edit(memo._id, memo.title, memo.body)
    },
    push (data) {
      this.memoes.push(data)
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
