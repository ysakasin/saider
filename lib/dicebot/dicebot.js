"use strict"

const util = require('./module/util.js')

class DiceBot {
  constructor(){
    /* name : ダイスボット名 */
    this.name = '標準ダイスボット';

    /* description : ダイスボットの説明や使用例 */
    this.description = `
例：
3d6
1D100 <= 50
3d6 + 1d4
1d6 + 3`;
  }

  /**
  * ダイスロールのリクエストであるか判定する
  * @method isDiceRequest
  * @param {string} req リクエストの文字列
  * @return {boolean} リクエストであれば true
  */
  isDiceRequest(req) {
    return util.basic_request_reg.test(req);
  }

  /**
  * ダイスロールを行う
  * @method roll
  * @param {string} request リクエストの文字列
  * @return {object} ダイスロール結果
  */
  roll(request) {
    const comp = (request.match(/[<>]=?\d+/) || [])[0];
    let formula = request.replace(/[<>]=?\d+/, '');

    let res = {};
    let rolled = [];

    let dices = formula.match(/\d*[dD]\d+/g);
    dices.forEach(function(dice){
      let data = dice.split(/d|D/);
      let result = util.rollDice(parseInt(data[0]), parseInt(data[1]));
      formula = formula.replace(dice, result.total);
      rolled.push(result);
    });

    res['dices'] = rolled;
    res['total'] = eval(formula);
    if (comp != null) {
      res['result'] = eval(res.total + comp) ? '成功' : '失敗';
    }
    return res;
  }
}

module.exports = DiceBot;
