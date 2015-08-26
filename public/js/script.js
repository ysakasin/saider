$('#modal-join').modal('show');

var socketio;
var user_name;
var msg_area = document.getElementById('msg-area');

function start(name) {
  socketio.emit("connected", name);
}

function publishMessage() {
  var textInput = document.getElementById('msg-input');
  var msg = textInput.value;

  if (isOrderDiceRoll(msg)) {
    var data = msg.split(/d|D/);
    var comp = data[1].match(/(<=|<|>=|>)\d+$/);
    if (comp) {
      comp = comp[0];
    }
    var dice = {n: parseInt(data[0]), d: parseInt(data[1]), comp: comp};
    rollDice(dice);
  }
  else {
    socketio.emit("publish", {name: user_name, value: msg});
  }

  textInput.value = '';

  return false; // form submitのキャンセル用
}

function addMessage(msg) {
  var domMsg = document.createElement('div');
  domMsg.innerHTML = new Date().toLocaleTimeString() + ' ' + msg;
  msg_area.appendChild(domMsg);
}

function rollDice(dice) {
  socketio.emit("roll", dice);
}

function addNumber(data) {
  var dice_roll = new DiceRoll(data);
}

function isOrderDiceRoll(msg) {
  return /^\d+(d|D)\d+((<=|<|>|>=)\d+)*$/.test(msg);
}

function login() {
  socketio= io.connect(document.URL);

  socketio.on("connected",  function(name) {});
  socketio.on("publish",    function(data) { addMessage(data.value); });
  socketio.on("roll",       function(data) { addNumber(data); });
  socketio.on("disconnect", function() {});

  user_name       = document.getElementById('user-name').value;
  var room_number = document.getElementById('room-number').value;

  document.getElementById('room-id').innerText = 'Room ' + room_number;
  addMessage("貴方は" + user_name + "として入室しました");
  start({name: user_name, room: room_number});

  $('#modal-join').modal('hide');

  return false; // form submitのキャンセル用
}
