var socketio = io.connect(window.location.host);

function joinRoom(user) {
  socketio.emit("connected", user);
}

/* Dice */

function rollDice() {
  var diceInput = document.getElementById('dice-input');
  var expr = diceInput.value;

  if (isOrderDiceRoll(expr)) {
    diceInput.value = '';
    expr = expr.replace(/d/g, 'D');
    socketio.emit("roll", expr);
  }
}

function isOrderDiceRoll(msg) {
  return /^\d+[dD]\d+(([+-]\d+[dD]\d+)|([+-]\d+))*([<>]=?\d+)?$/.test(msg);
}

function addResult(result) {
  var result_area = document.getElementById('result-area');

  var div = document.createElement('div');
  var label = document.createElement('label');
  var p = document.createElement('p');

  label.innerText = result.name;
  p.innerText = result.request + '→' + result.total;

  div.className = "result";
  div.appendChild(label);
  div.appendChild(p);
  result_area.appendChild(div);
}

function addDice(data) {
  var dice_roll = new DiceRoll(data);
}

/* Memo */

function addMemo(memo) {
  var memo_area = document.getElementById('memo-area');
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

function showMemoModal() {
  var input_memo_title = document.getElementById('memo-title');
  var input_memo_body = document.getElementById('memo-body');

  input_memo_title.value = "";
  input_memo_body.value = "";
  $('#modal-memo').modal('show');
}

function sendMemo() {
  var input_memo_title = document.getElementById('memo-title');
  var input_memo_body = document.getElementById('memo-body');

  socketio.emit("memo", {title: input_memo_title.value, body: input_memo_body.value});
  $('#modal-memo').modal('hide');
}

$(function () {
  $('[data-toggle="popover"]').popover();
})

/* Map */

function changeMap(map) {
  var img = document.getElementById('map-img');
  img.src = map.url;
}

function showMapModal() {
  var input_map_url = document.getElementById('map-url');

  input_map_url.value = "";
  $('#modal-map').modal('show');
}

function sendMapUrl() {
  var input_map_url = document.getElementById('map-url');

  socketio.emit("map", {url: input_map_url.value});
  $('#modal-map').modal('hide');
}

/* socketio listener */

// socketio.on("connected",  function() {});
socketio.on("roll",       addDice);
socketio.on("memo",       addMemo);
socketio.on("map",        changeMap);
// socketio.on("disconnect", function() {});

/* init */

var room_id = window.location.pathname;
joinRoom({name: 'sakasin', room: room_id});
