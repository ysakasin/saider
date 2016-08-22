exports.escapeHTML = function (str) {
  str = str.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&#39;');
  return str;
};

exports.cspParams = function (host) {
  'default-src "self" ' + host + ' ws://' + host + '; img-src "self" *';
}

var crypto =  require('crypto');
var seed = Date.now() * Math.random();
var serial = 1;

exports.generateId = function () {
  var data = seed + ':' + serial++;
  return crypto
    .createHash('sha1')
    .update(data)
    .digest('hex');
};

exports.passwordToHash = function (password) {
  var sha512 = crypto.createHash('sha512');
  sha512.update(password);
  return sha512.digest('hex');
}
