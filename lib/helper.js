exports.escapeHTML = function (str) {
  str = str.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&#39;');
  return str;
};

exports.deleteRoom = function (client, room_id) {
  client.del('map.' + room_id);
  client.del('memos.' + room_id);
  client.del('results.' + room_id);
  client.hdel('rooms', room_id);
}

exports.cspParams = function (host) {
  'default-src "self" ' + host + ' ws://' + host + '; img-src "self" *';
}
