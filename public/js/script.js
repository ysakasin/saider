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
var input_map_url = document.getElementById('map-url');

socketio = io.connect(window.location.host);

socketio.on("connected",  function(name) {});
// socketio.on("publish",    function(data) { addMessage(data.value); });
socketio.on("roll",       function(data) { addNumber(data); });
socketio.on("memo",       function(data) { addMemo(data); });
socketio.on("map",       function(data) { changeMap(data); });
socketio.on("disconnect", function() { addMessage('通信が切断されました') });

function joinRoom(name) {
  socketio.emit("connected", name);
}

function leaveRoom() {
  socketio.emit("leave");
}

function publishMessage() {
  var textInput = document.getElementById('dice-input');
  var msg = textInput.value;

  if (isOrderDiceRoll(msg)) {
    rollDice(msg.replace(/d/g, 'D'));
  }
  else {
    socketio.emit("publish", {name: user_name, value: msg});
  }

  textInput.value = '';
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

function changeMap(map) {
  console.log("changeMap");
  var img = document.getElementById('map-img');
  img.src = map.url;
}

function sendMemo() {
  socketio.emit("memo", {title: input_memo_title.value, body: input_memo_body.value});
  $('#modal-memo').modal('hide');
}

function showMemoModal() {
  input_memo_title.value = "";
  input_memo_body.value = "";
  $('#modal-memo').modal('show');
}

function sendMapUrl() {
  console.log("sendMapUrl");
  socketio.emit("map", {url: input_map_url.value});
  $('#modal-map').modal('hide');
  return false;
}

function showMapModal() {
  console.log("sendMapModal");
  input_map_url.value = "";
  $('#modal-map').modal('show');
}

$(function () {
  $('[data-toggle="popover"]').popover();
})

var room_id = window.location.pathname;
joinRoom({name: 'sakasin', room: room_id});
