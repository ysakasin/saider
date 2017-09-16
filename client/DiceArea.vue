<template>
  <div class="dice-area">
    <div class="dice-form">
      <form v-on:submit.prevent="diceroll">
        <md-input-container>
          <label><i class="mdi mdi-dice-6"></i> ななしくん</label>
          <md-input v-model="cmd"></md-input>
        </md-input-container>
      </form>
    </div>
    <div class="room-infos">
      <md-chip>Dicebot</md-chip>
      <md-chip><i class="mdi mdi-settings"></i></md-chip>
    </div>
    <div class="dice-log">
      <p v-for="log in logs">
        {{ log }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cmd: "",
      logs: []
    }
  },
  methods: {
    diceroll () {
      this.cmd = ""
    },
    push (log) {
      this.logs.push(log)
    }
  }
}
</script>

<style lang="scss">
.mdi-icon {
  fill: #999;
}

.dice-form {
  width: 100%;
  height: 64px;
  padding: 0 6px;
}

.room-infos {
  margin: 6px;
}

.md-chip {
  cursor: pointer;
  height: 28px;
  padding: 6px 12px;

  .md-chip-container {
    font-size: 16px;
  }
}

.dice-log {
  overflow-y: scroll;
}

.md-input-container {
  margin-top: 16px;
}
</style>
