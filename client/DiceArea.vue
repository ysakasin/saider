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
    <vue-toast ref="toast"></vue-toast>
  </div>
</template>

<script>
import BCDice from 'bcdice-js'
import VueToast from 'vue-toast'

import 'vue-toast/dist/vue-toast.min.css'

export default {
  data () {
    return {
      name: "ななしくん",
      cmd: "",
      logs: []
    }
  },
  components: {
    VueToast
  },
  sockets: {
    roll (data) {
      if (data.from !== this.$socket.id || !data.secret) {
        this.push(data)
      }
    }
  },
  mounted () {
    this.$refs.toast.setOptions({
      position: "right top"
    })
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
        this.$refs.toast.showToast("コマンドを解釈できませんでした", {
          theme: "error",
          timeLife: 1000
        })
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
      let log = this.name + (secret ? "：シークレットダイス ＞ ？" : msg)
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
      if (data.dice.length > 0) {
        let dice = data.dice.map((x) => {
          return {d: x[1], numbers: [x[0]]}
        })
        let result = data.log.split("＞").pop().trim()
        let v = new DiceRoll({dices: dice, result: result})
      }
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
