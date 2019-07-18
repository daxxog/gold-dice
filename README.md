# GoldDice

  the gold standard for provably fair dice

  [![NPM Version][npm-image]][npm-url]
  [![Build Status][travis-image]][travis-url]

Install
-------
```bash
npm install --save gold-dice
```

Examples
-------
```bash
var GoldDice = require('gold-dice'),
    dice = new GoldDice();

//two sides, one roll
console.log(dice.roll(2));

//six sides, ten rolls
console.log(dice.roll(6, 10));

//the state of the dice, save this in a database or wherever
console.log(dice.toString());
```

[npm-image]: https://img.shields.io/npm/v/gold-dice.svg
[npm-url]: https://npmjs.org/package/gold-dice
[travis-image]: https://img.shields.io/travis/daxxog/gold-dice.png?branch=master
[travis-url]: https://travis-ci.org/daxxog/gold-dice
