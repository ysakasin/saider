exports.rollDice = function(n, d) {
  var numbers = [];
  var total = 0;

  if (Number.isNaN(n)) {
    n = 1;
  }

  if (n == 1 && d == 66) {
    var dice1 = Math.ceil(Math.random() * 6);
    var dice2 = Math.ceil(Math.random() * 6);
    numbers.push(dice1);
    numbers.push(dice2);
    if (dice1 < dice2) {
      total = dice1 * 10 + dice2;
    }
    else {
      total = dice2 * 10 + dice1;
    }
  }
  else {
    for (var i = 0; i < n; i++) {
      var dice = Math.ceil(Math.random() * d);
      total += dice;
      numbers.push(dice);
    }
  }

  var result = {
    n: n,
    d: d,
    numbers: numbers,
    total: total
  };
  return result;
};

exports.basic_request_reg = /^\d*[dD]\d+(([+-]\d*[dD]\d+)|([+-]\d+))*([<>]=?\d+)?$/;
