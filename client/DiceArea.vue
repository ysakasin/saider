<template>
  <div class="dice-area">
    <div class="dice-form">
      <form v-on:submit.prevent="diceroll">
        <md-input-container>
          <label><i class="mdi mdi-dice-6"></i> {{ name }}</label>
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
import BCDice from 'bcdice-js'

export default {
  data () {
    return {
      name: "ななしくん",
      cmd: "",
      logs: []
    }
  },
  sockets: {
    roll (data) {
      if (data.from !== this.$socket.id || !data.secret) {
        this.push(data)
      }
    }
  },
  methods: {
    diceroll () {
      let bcdice = new BCDice()
      bcdice.setCollectRandResult(true)
      bcdice.setMessage(this.cmd)

      let result = bcdice.dice_command()
      let msg = result[0]
      let secret = result[1]
      if (result[0] === "1") {
        // 実行失敗
        return
      }

      let data = this.make_resp(msg, secret, bcdice.getRandResults())
      this.$socket.emit("roll", data)
      this.cmd = ""

      if (data.secret) {
        let sdata = this.make_resp(msg, false, bcdice.getRandResults())
        this.push(sdata)
      }
    },
    make_resp (msg, secret, dice) {
      let log = this.name + (secret ? "：シークレットダイス" : msg)
      if (secret) {
        dice = []
      }

      return {
        from: this.$socket.id,
        log: log,
        secret: secret,
        dice: dice
      }
    },
    push (data) {
      this.logs.push(data.log)
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
