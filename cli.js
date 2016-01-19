/* GoldDice / cli.js
 * command line interface for GoldDice
 * (c) 2015 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */

var GoldDice = require('./gold-dice.min.js'),
    gd = new GoldDice();

console.log(gd.roll(2, 10000).length);

console.log('testing 1k rolls of four sided dice. please be patient');
console.log('average roll: ' + gd.roll(4, 1000).reduce(function(p, c) {
    return parseInt(p, 10) + parseInt(c, 10);
}) / 1000);


console.log('testing 10k rolls of four sided dice. please be patient');
console.log('average roll: ' + gd.roll(4, 10000).reduce(function(p, c) {
    return parseInt(p, 10) + parseInt(c, 10);
}) / 10000);


console.log('testing 100k rolls of four sided dice. please be patient');
console.log('average roll: ' + gd.roll(4, 100000).reduce(function(p, c) {
    return parseInt(p, 10) + parseInt(c, 10);
}) / 100000);