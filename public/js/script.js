// $.getJSON('./room.json', function(data) {
//   var select = $('#room-number');
//   var amount = data['amount'];
//   for (var i = 1; i <= amount; i++) {
//     var option = $('<option/>').val(i).text(i);
//     select.append(option);
//   }
// });

// $('#modal-join').modal('show');

var socketio;
var user_name;
var msg_area = document.getElementById('result-area');
var memo_area = document.getElementById('memo-area');
var room_number;

var input_memo_title = document.getElementById('memo-title');
var input_memo_body = document.getElementById('memo-body');

socketio = io.connect(document.URL);

socketio.on("connected",  function(name) {});
// socketio.on("publish",    function(data) { addMessage(data.value); });
socketio.on("roll",       function(data) { addNumber(data); });
socketio.on("memo",       function(data) { addMemo(data); });
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
  var label = document.createElement('label');
  var result = document.createElement('p');

  label.innerText = msg.name;
  result.innerText = msg.request + '→' + msg.total;

  domMsg.className = "result";
  domMsg.appendChild(label);
  domMsg.appendChild(result);
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

function addMemo(memo) {
  var div = document.createElement('div');

  div.className = 'memo';
  div.setAttribute('data-container', 'body');
  div.setAttribute('data-toggle', 'popover');
  div.setAttribute('data-trigger', 'hover');
  div.setAttribute('data-content', memo.body);
  div.innerText = memo.title;

  // div.onclick = function() {
  //   $('.popover').popover('hide');
  //   $('#modal-join').modal('show');
  // };

  $(div).popover();

  memo_area.appendChild(div);
}

function sendMemo() {
  socketio.emit("memo", {title: input_memo_title.value, body: input_memo_body.value});

  $('#modal-join').modal('hide');
}

function showMemoModal() {
  input_memo_title.value = "";
  input_memo_body.value = "";
  $('#modal-join').modal('show');
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

$(function () {
  $('[data-toggle="popover"]').popover();
})


joinRoom({name: 'sakasin', room: '1'});
