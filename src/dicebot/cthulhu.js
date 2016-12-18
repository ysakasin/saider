import {stripIndent} from 'common-tags';
import util from './module/util.js';
import DiceBot from './dicebot.js';

export default class Cthulhu extends DiceBot {
  constructor(){
    super();
    this.name = 'クトゥフル神話TRPG';

    this.description = stripIndent`
      c=クリティカル値 ／ f=ファンブル値 ／ s=スペシャル

      1d100<=n  1d100ロールを行う c=1、f=100

      ・cfs判定付き判定コマンド

      CC   1d100ロールを行う c=1、f=100
      CCB  同上、c=5、f=96

      例：CC<=80  （技能値80で行為判定。1%ルールでcf適用）
      例：CCB<=55 （技能値55で行為判定。5%ルールでcf適用）

      ・組み合わせロールについて

      CBR(x,y)  c=1、f=100
      CBRB(x,y) c=5、f=96

      ・抵抗表ロールについて
      RES(x-y)  c=1、f=100
      RESB(x-y) c=5、f=96

      ※故障ナンバー判定

      ・CC(x) c=1、f=100
      x=故障ナンバー。出目x以上が出た場合、判定の成否と故障を共に出力する。("成功/故障", "失敗/故障")
      故障した場合にはcfs判定は行わない。

      ・CCB(x) c=5、f=96
      同上`;

    this.prefix = ['choice', 'cc', 'ccb', 'res', 'resb', 'cbr', 'cbrb'];
    this.infix = [];
  }

  getPrefixResult(request) {
    const prefix = request.prefix;
    const args = request.args;

    if (prefix == 'cc') {
      let rate = (request.comp == '<=') ? request.lhs : null;
      let break_rate = Number(args[0]);
      return this.checkRoll(rate, 1, 20, break_rate);
    }
    else if (prefix == 'ccb') {
      let rate = (request.comp == '<=') ? request.lhs : null;
      let break_rate = Number(args[0]);
      return this.checkRoll(rate, 5, 20, break_rate);
    }
    else if (prefix == 'res') {
      return this.registRoll(args[0], 1);
    }
    else if (prefix == 'resb') {
      return this.registRoll(args[0], 5);
    }
    else if (prefix == 'cbr') {
      return this.combineRoll(args[0], args[1], 1);
    }
    else if (prefix == 'resb') {
      return this.conbineRoll(args[0], args[1], 5);
    }

    return super.getPrefixResult(request);
  }

  // getInfixResult(request) {
  //   return super.getInfixResult(request);
  // }

  specialCase(request) {
    let match = request.match(/^1D100\s*<=\s*(\d+)$/i);
    if (match == null) {
      return null;
    }

    let rate = Number(match[1]);
    return this.checkRoll(rate, 1, 20);
  }


  //
  //  Private
  //

  checkRoll(rate, critical, special, break_rate) {
    let dice = util.rollDice(1, 100);
    let total = dice.total;
    let result = this.getResult(total, rate, critical, special, break_rate);

    return {dices: [dice], total: total, result: result};
  }

  getResult(total, rate, critical, special, break_rate) {
    let is_break = (break_rate == null)
    ? false
    : total >= break_rate;

    if (rate == null) {
      if (is_break) {
        return '故障';
      }
      else {
        return null;
      }
    }

    if (total <= rate) {
      if (is_break) {
        return '成功/故障';
      }

      let is_critical = total <= critical;
      let is_special = total <= rate * special / 100;

      if (is_critical && is_special ) {
        return '決定的成功/スペシャル';
      }
      else if (is_critical) {
        return '決定的成功';
      }
      else if (is_special) {
        return 'スペシャル';
      }
      else {
        return '成功';
      }
    }
    else {
      if (is_break) {
        return '失敗/故障';
      }

      let fumble = 101 - critical;
      if (total >= fumble) {
        return '致命的失敗';
      }
      else {
        return '失敗';
      }
    }
  }

  registRoll(arg, critical) {
    if (! /^\d+-\d+$/.test(arg)) {
      return null;
    }
    let args = arg.split('-');
    let diff = Number(args[0]) - Number(args[1]);
    let rate = 50 + diff * 5;
    return this.checkRoll(rate, critical, 0);
  }

  combineRoll(rate1, rate2, critical) {
    rate1 = Number(rate1);
    rate2 = Number(rate2);

    let dice = util.rollDice(1, 100);
    let total = dice.total;

    let result1 = this.getResult(total, rate1, critical, 20);
    let result2 = this.getResult(total, rate2, critical, 20);

    let rank;
    if (total <= rate1 && total <= rate2) {
      rank = '成功';
    }
    else if (total <= rate1 || total <= rate2) {
      rank = '部分的成功';
    }
    else {
      rank = '失敗';
    }

    let result = `[${result1}, ${result2}] ${rank}`;

    return {dices: [dice], total: total, result: result};
  }
}
