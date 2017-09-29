let dice_src = []

dice_src[4] = []
for (let i = 1; i <= 4; i++) {
  dice_src[4][i] = '/dice/4_dice/4_dice[' + i + '].png'
  let tmp = new Image()
  tmp.src = dice_src[4][i]
}

dice_src[6] = []
for (let i = 1; i <= 6; i++) {
  dice_src[6][i] = '/dice/6_dice/6_dice[' + i + '].png'
  let tmp = new Image()
  tmp.src = dice_src[6][i]
}

dice_src[8] = []
for (let i = 1; i <= 8; i++) {
  dice_src[8][i] = '/dice/8_dice/8_dice[' + i + '].png'
  let tmp = new Image()
  tmp.src = dice_src[8][i]
}

dice_src[10] = []
dice_src[10][0] = '/dice/10_dice/10_dice[10].png'
for (let i = 1; i <= 10; i++) {
  dice_src[10][i] = '/dice/10_dice/10_dice[' + i + '].png'
  let tmp = new Image()
  tmp.src = dice_src[10][i]
}

dice_src[20] = []
for (let i = 1; i <= 20; i++) {
  dice_src[20][i] = '/dice/20_dice/20_dice[' + i + '].png'
  let tmp = new Image()
  tmp.src = dice_src[20][i]
}

dice_src[100] = []
dice_src[100][0] = '/dice/100_dice/100_dice[10].png'
for (let i = 1; i <= 10; i++) {
  dice_src[100][i] = '/dice/100_dice/100_dice[' + i + '].png'
  let tmp = new Image()
  tmp.src = dice_src[100][i]
}

let drawing_dice = [4, 6, 8, 10, 20, 100]

let que = []
let timer
let state = 'stop' // 'rolling' or 'stop'

let window_width
let window_height

class Dice {
  constructor (option) {
    this.request = option.request
    this.total = option.total
    this.dices = option.dices
    this.result = option.result
    this.name = option.name
    this.dice = []
    this.count = 0
  }

  begin () {
    let is_drawable = true
    for (let i = 0; i < this.dices.length; i++) {
      is_drawable &= drawing_dice.indexOf(this.dices[i].d) !== -1
    }
    if (!is_drawable || this.dices.length === 0) {
      return
    }

    window_width = window.innerWidth
    window_height = window.innerHeight

    let p = 0
    for (let j = 0; j < this.dices.length; j++) {
      let data = this.dices[j]
      let num = data.numbers.length
      for (let i = 0; i < num; i++) {
        let obj = genDiceObj(p, data.numbers[i], data.d)
        p++
        document.body.appendChild(obj)
        this.dice.push(obj)
      }
    }

    timer = setInterval(updateDice, 50, this)
    state = 'rolling'
  }
}

function updateDice (instans) {
  if (state === 'rolling') {
    instans.count++
    for (let i = 0; i < instans.dice.length; i++) {
      let obj = instans.dice[i]

      if (obj.d === 100) {
        obj.img.src = dice_src[100][instans.count % 10 + 1]
        obj.img2.src = dice_src[10][instans.count % 10 + 1]
      } else {
        obj.img.src = dice_src[obj.d][instans.count % obj.d + 1]
      }

      obj.vy = obj.vy - 9.8
      obj.y -= obj.vy
      obj.x -= obj.vx

      if (obj.x < 0) {
        obj.x = 0
        obj.vx = -obj.vx * 0.9
      }

      if (obj.vy < 0 && obj.base_of_dounding < obj.y) {
        obj.vy = -obj.vy * 0.94
        obj.vx *= 0.86
        obj.y = obj.base_of_dounding - (obj.y - obj.base_of_dounding)
        obj.base_of_dounding = obj.base_of_dounding * 0.75
      }

      if (obj.base_of_dounding < obj.epsilon_y || state === 'stop') {
        state = 'stop'
        if (obj.d === 100) {
          obj.img.src = dice_src[100][Math.floor(obj.number / 10)]
          obj.img2.src = dice_src[10][obj.number % 10]
        } else {
          obj.img.src = dice_src[obj.d][obj.number]
        }
        obj.onclick = erase
        continue
      } else {
        obj.style.top = obj.y + "px"
        obj.style.left = obj.x + "px"
      }
    }
  } else if (state === 'stop') {
    clearInterval(timer)
    if (que.length > 1) {
      window.setTimeout(function () {
        erase()
        que.shift()
        que[0].begin()
      }, 500)
    }
    showAmount(instans.total, instans.result, (instans.dice[0].y - 50) + 'px', instans.dice[0].style.left)
  }
}

function erase () {
  let objs = document.getElementsByClassName("dice")
  for (let i = objs.length - 1; i >= 0; i--) {
    document.body.removeChild(objs[i])
  }

  let total = document.getElementById('amount')
  if (total) {
    document.body.removeChild(total)
  }
}

function genDiceObj (id, number, d) {
  let obj = document.createElement("div")
  obj.number = number
  obj.d = d
  obj.className = "dice"

  obj.x = window_width - 100 - 150 * (id % 5)
  obj.y = window_height - 100 * Math.floor(id / 5 + 1)

  obj.epsilon_y = 110 * 1.8
  obj.style.left = obj.x + "px"
  obj.style.top = obj.y + "px"

  obj.vy = 100 * (window_height / 800)
  if (obj.vy < 100) {
    obj.vy = 100
  }
  obj.vx = 25 * (window_width / 1000)
  obj.base_of_dounding = obj.epsilon_y + (window_height - obj.epsilon_y) * 0.2

  obj.img = document.createElement("img")
  obj.img.src = dice_src[obj.d][1]
  obj.appendChild(obj.img)

  if (d === 100) {
    obj.img2 = document.createElement("img")
    obj.img2.src = dice_src[10][1]
    obj.appendChild(obj.img2)
  }
  return obj
}

function showAmount (number, result, top, left) {
  let obj = document.createElement("div")
  obj.id = 'amount'
  obj.textContent = result || number
  obj.style.top = top
  obj.style.left = left
  document.body.appendChild(obj)
}

export default function (option) {
  let dice = new Dice(option)

  que.push(dice)

  if (que.length === 1) {
    dice.begin()
  } else if (que.length === 2 && state === 'stop') {
    erase()
    que.shift()
    dice.begin()
  }
}
