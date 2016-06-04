var socketio = io.connect(window.location.host);
var user_name = 'ななし';
var memo_data = {};
var room_id = document.getElementById('room').getAttribute('room-id');
var is_need_password = document.getElementById('room').getAttribute('is-need-password');

function joinRoom(user) {
  socketio.emit("connected", user);
}

function deleteRoom() {
  socketio.emit("delete-room");
}

function roomDeleted() {
  socketio.disconnect();
  $('#modal-deleted').modal('show');
}

function escapeHTML(str) {
  str = str.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&#39;');
  return str;
}

/* User Name */

function changeUserName() {
  var input = document.getElementById('user-name');
  if (user_name == input.value) {
    return;
  }

  user_name = input.value;
  $('#changed').show();
  $('#changed').delay(1500).fadeOut();
  socketio.emit("user-name", input.value);
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
  p.innerText = result.text;

  div.className = "result";
  div.appendChild(label);
  div.appendChild(p);
  result_area.appendChild(div);
}

function addDice(data) {
  var dice_roll = new DiceRoll(data);
}

function initResult(results) {
  for (var result of results) {
    addResult(result);
  }
}

/* Memo */

function addMemo(memo) {
  var memo_area = document.getElementById('memo-area');
  var div = document.createElement('div');

  div.id = 'memo-' + memo.memo_id;
  div.className = 'memo';
  div.setAttribute('memo-id', memo.memo_id);
  div.setAttribute('data-container', 'body');
  div.setAttribute('data-toggle', 'popover');
  div.setAttribute('data-trigger', 'hover');
  div.innerText = memo.title;

  div.onclick = function() {
    showMemoModal(this);
  };
  $(div).popover();

  memo_area.appendChild(div);

  memo_data[memo.memo_id] = memo;
}

function initMemo(memos) {
  for (id in memos) {
    addMemo(memos[id]);
  }
}

function updateMemo(memo) {
  var div = document.getElementById('memo-' + memo.memo_id);
  div.innerText = memo.title;

  memo_data[memo.memo_id] = memo;
}

function removeMemo(memo_id) {
  $('#memo-' + memo_id).remove();
  delete memo_data[memo_id];
}

function showMemoModal(memo_div) {
  $('.popover').popover('hide');
  var memo_modal = document.getElementById('modal-memo');
  var input_memo_title = document.getElementById('memo-title');
  var input_memo_body = document.getElementById('memo-body');

  if (memo_div === undefined) {
    memo_modal.setAttribute('memo-id', 0);
    input_memo_title.value = "";
    input_memo_body.value = "";
    $('#btn-memo-delete').hide();
  }
  else {
    var memo_id = memo_div.getAttribute('memo-id');
    memo_modal.setAttribute('memo-id', memo_id);
    input_memo_title.value = memo_data[memo_id].title;
    input_memo_body.value = memo_data[memo_id].body;
    $('#btn-memo-delete').show();
  }
  $('#modal-memo').modal('show');
}

function sendMemo() {
  var modal = document.getElementById('modal-memo');
  var input_memo_title = document.getElementById('memo-title');
  var input_memo_body = document.getElementById('memo-body');

  var memo_id = modal.getAttribute('memo-id');
  if (memo_id == 0) {
    socketio.emit("memo", {title: input_memo_title.value, body: input_memo_body.value});
  }
  else {
    socketio.emit("update-memo", {memo_id: memo_id, title: input_memo_title.value, body: input_memo_body.value});
  }
  $('#modal-memo').modal('hide');
}

function deleteMemo() {
  var modal = document.getElementById('modal-memo');
  var memo_id = modal.getAttribute('memo-id');
  socketio.emit("delete-memo", memo_id);
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
  var map_img = document.getElementById('map-img');

  input_map_url.value = map_img.src;
  $('#modal-map').modal('show');
}

function sendMapUrl() {
  var input_map_url = document.getElementById('map-url');

  socketio.emit("map", {url: input_map_url.value});
  $('#modal-map').modal('hide');
}

/* socketio listener */

// socketio.on("connected",  function() {});
socketio.on("init-result",  initResult);
socketio.on("roll",         addDice);
socketio.on("init-memo",    initMemo);
socketio.on("memo",         addMemo);
socketio.on("update-memo",  updateMemo);
socketio.on("remove-memo",  removeMemo);
socketio.on("map",          changeMap);
socketio.on("room-deleted", roomDeleted);
socketio.on("accepted", function () {$('#modal-login').modal('hide');});
socketio.on("rejected", function () {
  $('#password-input-group').addClass('has-error');
  $('#error-password').show();
  $('#error-password').delay(1500).fadeOut();
});
// socketio.on("disconnect", function() {});

/* Override Bootstrap */

$.fn.popover.Constructor.prototype.getContent = function () {
  var $e = this.$element
  var o  = this.options

  var content = memo_data[$e.attr('memo-id')].body
  return escapeHTML(content).replace(/\n/g, '<br />')
}

$.fn.popover.Constructor.prototype.setContent = function () {
  var $tip    = this.tip()
  var content = this.getContent()

  $tip.find('.popover-content').children().detach().end()[
    'html'
  ](content)

  $tip.removeClass('fade top bottom left right in')

  // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
  // this manually by checking the contents.
  if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
}

/* init */

document.getElementById('form-user-name').onsubmit = function () {
  $('#user-name').blur();
  return false;
};

document.getElementById('form-dice').onsubmit = function () {
  rollDice();
  return false;
};

document.getElementById('add-memo').onclick = function () {
  showMemoModal();
};

document.getElementById('form-memo').onsubmit = function () {
  sendMemo();
  return false;
};

document.getElementById('form-map').onsubmit = function () {
  sendMapUrl();
  return false;
};

document.getElementById('form-login').onsubmit = function () {
  var password = document.getElementById('password').value;
  joinRoom({name: 'ななし', room: room_id, password: password});
  return false;
}

document.getElementById('user-name').onblur = changeUserName;
document.getElementById('change-map').onclick = showMapModal;
document.getElementById('btn-memo-delete').onclick = deleteMemo;
document.getElementById('btn-delete-room').onclick = deleteRoom;

if (is_need_password == 1) {
  $('#modal-login').modal('show');
  document.getElementById('password').focus();
}
else {
  joinRoom({name: 'ななし', room: room_id});
}
