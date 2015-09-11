$.getJSON('./room.json', function(data) {
  var select = $('#room-number');
  var amount = data['amount'];
  for (var i = 1; i <= amount; i++) {
    var option = $('<option/>').val(i).text(i);
    select.append(option);
  }
});

$('#modal-join').modal('show');

var socketio;
var user_name;
var msg_area = document.getElementById('msg-area');
var room_number;

socketio = io.connect(document.URL);

socketio.on("connected",  function(name) {});
socketio.on("publish",    function(data) { addMessage(data.value); });
socketio.on("roll",       function(data) { addNumber(data); });
socketio.on("disconnect", function() { addMessage('通信が切断されました') });

function joinRoom(name) {
  socketio.emit("connected", name);
}

function leaveRoom() {
  socketio.emit("leave");
}

function publishMessage() {
  var textInput = document.getElementById('msg-input');
  var msg = textInput.value;

  if (isOrderDiceRoll(msg)) {
    rollDice(msg.replace(/d/g, 'D'));
  }
  else {
    socketio.emit("publish", {name: user_name, value: msg});
  }

  textInput.value = '';

  return false; // form submitのキャンセル用
}

function addMessage(msg) {
  var domMsg = document.createElement('div');
  domMsg.innerText = new Date().toLocaleTimeString() + ' ' + msg;
  msg_area.appendChild(domMsg);
}

function rollDice(dice) {
  socketio.emit("roll", dice);
}

function addNumber(data) {
  var dice_roll = new DiceRoll(data);
}

function isOrderDiceRoll(msg) {
  return /^\d+[dD]\d+(([+-]\d+[dD]\d+)|([+-]\d+))*([<>]=?\d+)?$/.test(msg);
}

function login() {
  if (room_number != null) {
    leaveRoom();
  }

  user_name   = document.getElementById('user-name').value;
  room_number = document.getElementById('room-number').value;

  if (user_name == '') {
    return false;
  }

  document.getElementById('room-id').innerText = 'Room ' + room_number;
  addMessage("貴方は" + user_name + "として入室しました");
  joinRoom({name: user_name, room: room_number});

  $('#modal-join').modal('hide');

  return false; // form submitのキャンセル用
}
