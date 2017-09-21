<template>
  <md-dialog ref="dialog">
    <md-dialog-title>新しく部屋を作成する</md-dialog-title>

    <md-dialog-content>
      <md-input-container>
        <label>部屋名</label>
        <md-input v-model="room_name"></md-input>
      </md-input-container>

      <md-checkbox v-model="is_lock" class="md-primary check">パスワードを設定する</md-checkbox>

      <md-input-container v-if="is_lock">
        <label>パスワード</label>
        <md-input v-model="password"></md-input>
      </md-input-container>


      <md-input-container>
        <label for="dicebot">ダイスボット</label>
        <md-select name="dicebot" id="dicebot" v-model="dicebot">
          <md-option value="DiceBot">標準ダイスボット</md-option>
          <md-option v-for="d in dicebot_descs" :value="d.gameType">{{ d.gameName }}</md-option>
        </md-select>
      </md-input-container>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="closeDialog()">キャンセル</md-button>
      <md-button class="md-primary" @click="createRoom()">作成</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import axios from 'axios'
import {DiceBotLoader} from 'bcdice-js'

const DiceBotDescs = DiceBotLoader.collectDiceBotDescriptions()
  .map(([filename, gameType, gameName]) => ({ filename, gameType, gameName }));

export default {
  data () {
    return {
      dicebot: "DiceBot",
      dicebot_descs: DiceBotDescs,
      room_name: "",
      is_lock: false,
      password: ""
    }
  },
  methods: {
    openDialog () {
      this.$refs['dialog'].open()
    },
    closeDialog () {
      this.$refs['dialog'].close()
    },
    createRoom () {
      let params = {
        name: this.room_name,
        dicebot: this.dicebot,
        password: (this.is_lock === true ? this.password : "")
      }
      axios.post('/api/rooms/new', params)
        .then((res) => {
          window.location = window.location + res.data.room_id
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
}
</script>

<style>
.md-theme-default.md-checkbox.md-primary.md-checked .md-checkbox-container:after {
  border-color: #fff!important;
}

.md-dialog-content .check {
  margin-top: 0;
}

.md-dialog-content .check.md-checked {
  margin-bottom: 0;
}
</style>
