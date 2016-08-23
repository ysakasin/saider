import util from './module/util.js';

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

    this.prefix = ['choice'];
    this.infix = [];
  }

  getPrefix(request) {
    let prefix = this.prefix.join('|');
    let regtext = '^(' + prefix + ')(\\(.*\\))?(\\+\\d+|-\\d+)?(<|>|<=|>=)?(\\d*)?$'
    let reg = new RegExp(regtext);
    let match = request.match(reg);

    if (match == null) {
      return null;
    }

    let formated = this.formatPrefix(match);
    return this.getPrefixResult(formated);
  }

  getPrefixResult(request) {
    if (request.prefix == 'choice') {
      let index = Math.floor(Math.random() * request.args.length);
      return {dices: [], total: null, result: request.args[index]};
    }

    return null;
  }

  formatPrefix(match) {
    let body = match[0];
    let prefix = match[1];
    let args = match[2] === undefined
                ? []
                : match[2].substr(1, match[2].length-2).split(/\s*,\s*/);
    let offset = Number(match[3]) || 0;
    let comp = match[4];
    let lhs = Number(match[5]);

    let res = {
      body: body,
      prefix: prefix,
      args: args,
      offset: offset,
      comp: comp,
      lhs: lhs
    };
    return res;
  }

  getInfix(request) {
    if (this.infix.length == 0) {
      return null
    }

    let infix = this.infix.join('|');
    let regtext = '^(\\d*)(' + infix + ')(\\d*)?(\\+\\d+|-\\d+)?(<|>|<=|>=)?(\\d*)?$';
    let reg = new RegExp(regtext);
    let match = request.match(reg);

    if (match == null) {
      return null;
    }

    let formated = this.fotmatInfix(match);
    return this.getInfixResult(match);
  }

  getInfixResult(request) {
    return null;
  }

  formatInfix(match) {
    let body = match[0];
    let head = Number(match[1]);
    let infix = match[2];
    let tail = Numbet(match[3]);
    let offset = Number(match[4]) || 0;
    let comp = match[5];
    let lhs = Number(match[6]);

    let res = {
      body: body,
      head: head,
      infix: infix,
      tail: tail,
      offset: offset,
      comp: comp,
      lhs: lhs
    };
    return res;
  }

  /**
  * ダイスロールを行う
  * @method roll
  * @param {string} request リクエストの文字列
  * @return {object} ダイスロール結果
  */
  roll(request) {
    return this.specialCase(request)
            || this.getPrefix(request)
            || this.getInfix(request)
            || this.basicRoll(request);
  }

  specialCase(request) {
    return null;
  }

  basicRoll(request) {
    if (!util.basic_request_reg.test(request)) {
      return null;
    }

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

export default DiceBot;
