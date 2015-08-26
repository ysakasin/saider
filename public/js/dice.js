var DiceRoll = (function() {

  var dice_src = [];
  dice_src[4] = [];
  for (var i = 1; i <= 4; i++) {
    dice_src[4][i] = '/dice/4_dice/4_dice[' + i + '].png';
  }

  dice_src[6] = [];
  for (var i = 1; i <= 6; i++) {
    dice_src[6][i] = '/dice/6_dice/6_dice[' + i + '].png';
  }

  dice_src[8] = [];
  for (var i = 1; i <= 8; i++) {
    dice_src[8][i] = '/dice/8_dice/8_dice[' + i + '].png';
  }

  dice_src[10] = [];
  dice_src[10][0] = '/dice/10_dice/10_dice[10].png';
  for (var i = 1; i <= 10; i++) {
    dice_src[10][i] = '/dice/10_dice/10_dice[' + i + '].png';
  }

  dice_src[20] = [];
  for (var i = 1; i <= 20; i++) {
    dice_src[20][i] = '/dice/20_dice/20_dice[' + i + '].png';
  }

  dice_src[100] = [];
  dice_src[100][0] = '/dice/100_dice/100_dice[10].png';
  for (var i = 1; i <= 10; i++) {
    dice_src[100][i] = '/dice/100_dice/100_dice[' + i + '].png';
  }

  var drawing_dice = [4, 6, 8, 10, 20, 100];

  var que = [];
  var timer;
  var state = 'stop'; //'rolling' or 'stop'

  var window_width, window_height;

  var DiceRoll = function(option) {
    this.d       = option.d;
    this.total   = option.total;
    this.numbers = option.numbers;
    this.comp    = option.comp;
    this.success = option.success;
    this.name    = option.name;
    this.dice    = [];
    this.count   = 0;

    que.push(this);

    if (que.length == 1) {
      this.begin();
    }
    else if (que.length == 2 && state == 'stop') {
      erase();
      que.shift();
      this.begin();
    }
  };

  DiceRoll.prototype.begin = function() {
    if (drawing_dice.indexOf(this.d) == -1) {
      this.showResultToLog();
      return;
    }

    window_width  = $(window).width();
    window_height = $(window).height();

    var num = this.numbers.length;
    for (var i = 0; i < num; i++) {
      var obj = genDiceObj(i, this.numbers[i], this.d);
      document.body.appendChild(obj);
      this.dice.push(obj);
    }

    timer = setInterval(this.updateDice, 50, this);
    state = 'rolling';
  };

  DiceRoll.prototype.updateDice = function(instans) {
    if (state == 'rolling') {
      instans.count++;
      for (var i = 0; i < instans.dice.length; i++) {
        var obj = instans.dice[i];

        if (instans.d == 100) {
          obj.img.src  = dice_src[100][instans.count % 10 + 1];
          obj.img2.src = dice_src[10][instans.count % 10 + 1];
        }
        else {
          obj.img.src = dice_src[instans.d][instans.count % instans.d + 1];
        }

        obj.vy = obj.vy - 9.8;
        obj.y -= obj.vy;
        obj.x -= obj.vx;

        if (obj.x < 0) {
          obj.x = 0
          obj.vx = -obj.vx * 0.9;
        }

        if (obj.vy < 0 && obj.base_of_dounding < obj.y) {
          obj.vy = -obj.vy * 0.94;
          obj.vx *= 0.86;
          obj.y = obj.base_of_dounding - (obj.y - obj.base_of_dounding);
          obj.base_of_dounding = obj.base_of_dounding * 0.75;
        }

        if (obj.base_of_dounding < obj.epsilon_y || state == 'stop') {
          state = 'stop';
          if (instans.d == 100) {
            obj.img.src  = dice_src[100][Math.floor(obj.number / 10)];
            obj.img2.src = dice_src[10][obj.number % 10];
          }
          else{
            obj.img.src = dice_src[instans.d][obj.number];
          }
          obj.onclick = erase;
          continue;
        }
        else {
          obj.style.top  = obj.y + "px";
          obj.style.left = obj.x + "px";
        }
      }
    }
    else if (state == 'stop') {
      clearInterval(timer);
      if (que.length > 1) {
        window.setTimeout(function() {
          erase();
          que.shift();
          que[0].begin();
        }, 500);
      }
      instans.showResultToLog();
      showAmount(instans.total, instans.success, (instans.dice[0].y - 50) + 'px', instans.dice[0].style.left);
    }
  };

  DiceRoll.prototype.showResultToLog = function() {
    var roll   = this.numbers.length + 'D' + this.d;
    var amount = this.total + ' ー> [' + this.numbers + ']';
    if (this.success != null) {
      roll   += this.comp;
      amount += ' ー> ' + (this.success ? '成功' : '失敗');
    }
    addMessage(this.name + ' ( ' + roll + ' ) ー> ' + amount);
  };

  var erase = function() {
    var objs = document.getElementsByClassName("dice");
    for (i = objs.length - 1; i >= 0; i--) {
      document.body.removeChild(objs[i]);
    }

    var total = document.getElementById('amount');
    if (total) {
      document.body.removeChild(total);
    }
  };

  var genDiceObj = function(id, number, d) {
    var obj = document.createElement("div");
    obj.number = number;
    obj.className = "dice";

    obj.x = window_width - 100 - 150 * (id % 5);
    obj.y = window_height - 100 * Math.floor(id / 5 + 1);

    obj.epsilon_y = 110 * 1.8;
    obj.style.left = obj.x + "px";
    obj.style.top = obj.y + "px";

    obj.vy = 100 * (window_height / 800);
    if (obj.vy < 100) {
      obj.vy = 100;
    }
    obj.vx = 25 * (window_width / 1000);
    obj.base_of_dounding = obj.epsilon_y + (window_height - obj.epsilon_y) * 0.2;

    obj.img = document.createElement("img");
    obj.img.src = dice_src[d][1];
    obj.appendChild(obj.img);

    if (d == 100) {
      obj.img2 = document.createElement("img");
      obj.img2.src = dice_src[10][1];
      obj.appendChild(obj.img2);
    }
    return obj;
  };

  var showAmount = function (number, success, top, left) {
    var obj = document.createElement("div");
    obj.id = 'amount'
    if (success == null) {
      obj.textContent = number;
    }
    else {
      obj.textContent = success ? '成功' : '失敗';
    }
    obj.style.top = top;
    obj.style.left = left;
    document.body.appendChild(obj);
  };

  return DiceRoll;
})();
