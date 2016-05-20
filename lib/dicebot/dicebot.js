/**
* ダイスボット
* @module dicebot
*/

util = require('./module/util.js')

/**
* @prop {string} name ダイスボット名
*/
exports.name = '標準ダイスボット';

/**
* @prop {string} description ダイスボットの使用例
*/
exports.description =
"\
例：\n\
3d6\n\
1D100 <= 50\n\
3d6 + 1d4\n\
1d6 + 3\n\
";

/**
* ダイスロールのリクエストであるか判定する
* @method isDiceRequest
* @param {string} req リクエストの文字列
* @return {boolean} リクエストであれば true
*/
exports.isDiceRequest = function(req) {
  return util.basic_request_reg.test(req);
};

/**
* ダイスロールを行う
* @method roll
* @param {string} request リクエストの文字列
* @return {object} ダイスロール結果
*/
exports.roll = function(request) {
  var comp = (request.match(/[<>]=?\d+/) || [])[0];
  var formula = request.replace(/[<>]=?\d+/, '');

  var res = {};
  var rolled = [];

  var dices = formula.match(/\d*[dD]\d+/g);
  dices.forEach(function(dice){
    var data = dice.split(/d|D/);
    var result = util.rollDice(parseInt(data[0]), parseInt(data[1]));
    formula = formula.replace(dice, result.total);
    rolled.push(result);
  });

  res['dices'] = rolled;
  res['total'] = eval(formula);
  if (comp != null) {
    res['result'] = eval(res.total + comp) ? '成功' : '失敗';
  }
	return res;
};
