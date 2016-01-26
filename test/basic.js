/* GoldDice / test / basic.js
 * basic test
 * (c) 2016 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */

var vows = require('vows'),
    assert = require('assert'),
    GoldDice = require('../gold-dice.min.js');

var TEST_STATE = '{"server":{"type":"Buffer","data":[136,83,241,170,20,162,114,241,198,206,110,48,183,198,5,13,13,196,51,68,44,152,122,128,136,163,6,183,53,166,218,9,100,60,26,212,183,75,240,106,82,211,172,209,217,99,238,138,70,19,96,64,157,139,5,95,170,9,28,73,84,98,82,51]},"client":{"type":"Buffer","data":[52,255,9,99,166,227,180,183,136,19,109,137,122,103,96,221,103,127,195,191,96,216,95,187,188,86,196,47,17,148,54,101]},"nonce":0}',
    TEST_ARRAY = [
        '4012160480',
        '4763859193',
        '9886493019',
        '6336559451',
        '7191256047',
        '9704329710',
        '6763840480',
        '7561518669',
        '0739409513',
        '9161762844',
        '0954324144',
        '0905322518',
        '4483292364',
        '1591757305',
        '4134061051',
        '9488497722',
        '3280958187',
        '1299993807',
        '3200415277',
        '3393054218',
        '2401401067',
        '3099165099',
        '9894126981',
        '2658389225',
        '0035393730',
        '3648618504',
        '3384631616',
        '1730264397',
        '5026451652',
        '7416492870',
        '2009705081',
        '9401910842',
        '6733400776',
        '3839912653',
        '2247243034',
        '2139083905',
        '8613608185',
        '9247304989',
        '6460127621',
        '9578532699',
        '7662228565',
        '5787766415',
        '1771676143',
        '8793156227',
        '1196553353',
        '6151886095',
        '9250585402',
        '8548842128',
        '4031585973',
        '2081230509',
        '2913939494',
        '0086062545',
        '7052409631',
        '7163013017',
        '5729319176',
        '9965475021',
        '1278550344',
        '8135622030',
        '2374393867',
        '4403654028',
        '3994376881',
        '0401844202',
        '0527238697',
        '4806134773',
        '2371933204',
        '0164598691',
        '9913008209',
        '7227688580',
        '8855333729',
        '2061706066',
        '8529426250',
        '8184966461',
        '6212461260',
        '8033240802',
        '5267759998',
        '0933101205',
        '2529826781',
        '8349601788',
        '8501649066',
        '6648534726',
        '0622294777',
        '6202035922',
        '8979539642',
        '1740467898',
        '7540513581',
        '3330728305',
        '8308681568',
        '2836869862',
        '6751853987',
        '5997786850',
        '7709649958',
        '8121267017',
        '0175588953',
        '7482764119',
        '1982610662',
        '2278366010',
        '4086477271',
        '8944748327',
        '3993973822',
        '1191703274'
    ];

vows.describe('basic').addBatch({
    'GoldDice': {
        topic: function() {
        	return GoldDice;
        },
        '.MAX_VAL === 1099511627775': function(topic) {
            assert.equal(topic.MAX_VAL.toString(), '1099511627775');
        },
        '.splice is a function': function(topic) {
            assert.equal(typeof topic.splice, 'function');
        },
        '.splice returns a spliced string with the length specified': function(topic) {
            for(var i = 0; i < 10; i++) {
                assert.equal(topic.splice('hello world', i).length, i);
            }
        },
        '.k is a function': function(topic) {
            assert.equal(typeof topic.k, 'function');
        },
        '.k(\'ffffffffff\') is a string': function(topic) {
            assert.equal(typeof topic.k('ffffffffff'), 'string');
        },
        '.k(\'ffffffffff\') length === 10': function(topic) {
            assert.strictEqual(topic.k('ffffffffff').length, 10);
        },
        '.k(\'ffffffffff\') === \'0000000001\'': function(topic) {
            assert.strictEqual(topic.k('ffffffffff'), '0000000001');
        }
    },
    'GoldDice.k': {
        topic: function() {
        	return GoldDice.k;
        },
        'is randomly battle tested': function(k) {
            for(var i = 0; i<1000; i++) {
                var x = (i*8).toString(16) + 'ffffffffff',
                    kx = k(x);
                
                assert.equal(typeof kx, 'string');
                assert.equal(kx.length, 10);
            }
        }
    },
    'typeof GoldDice': {
        topic: function() {
        	return typeof GoldDice;
        },
        'is a function': function(topic) {
            assert.equal(topic, 'function');
        }
    },
    'new GoldDice()': {
        topic: new GoldDice(),
        '.server is a Buffer': function(topic) {
            assert.equal(Buffer.isBuffer(topic.server), true);
        },
        '.server length === 64': function(topic) {
            assert.strictEqual(topic.server.length, 64);
        },
        '.client is a Buffer': function(topic) {
            assert.equal(Buffer.isBuffer(topic.client), true);
        },
        '.client length === 32': function(topic) {
            assert.strictEqual(topic.client.length, 32);
        },
        '.nonce is a number': function(topic) {
            assert.strictEqual(typeof topic.nonce, 'number');
        },
        '.nonce is >= 0': function(topic) {
            assert.equal(topic.nonce >= 0, true);
        },
        '.nonce does not have a decimal point': function(topic) {
            assert.equal(topic.nonce.toString().indexOf('.'), -1);
        },
        '.roll average difference is within 1%': function(gd) {
            console.log('\ntesting 100k rolls of four sided dice. please be patient');
            
            var red = gd.roll(4, 100000).reduce(function(p, c) {
                    return parseInt(p, 10) + parseInt(c, 10);
                }) / 100000,
                diff = Math.abs(4999.5 - red);
            
            console.log('average roll: ' + red);
            console.log('average difference = abs(4999.5 - ' + red + ') = ' + diff);
            
            assert.strictEqual(diff < 100, true);
        }
    },
    'new GoldDice({nonce: 1.1})': {
        topic: new GoldDice({nonce: 1.1}),
        '.nonce is a number': function(topic) {
            assert.strictEqual(typeof topic.nonce, 'number');
        },
        '.nonce is >= 0': function(topic) {
            assert.equal(topic.nonce >= 0, true);
        },
        '.nonce does not have a decimal point': function(topic) {
            assert.equal(topic.nonce.toString().indexOf('.'), -1);
        }
    },
    'new GoldDice({nonce: -1})': {
        topic: new GoldDice({nonce: -1}),
        '.nonce is a number': function(topic) {
            assert.strictEqual(typeof topic.nonce, 'number');
        },
        '.nonce is >= 0': function(topic) {
            assert.equal(topic.nonce >= 0, true);
        },
        '.nonce does not have a decimal point': function(topic) {
            assert.equal(topic.nonce.toString().indexOf('.'), -1);
        }
    },
    'new GoldDice(TEST_STATE)': {
        topic: new GoldDice(TEST_STATE),
        '.server is a Buffer': function(topic) {
            assert.equal(Buffer.isBuffer(topic.server), true);
        },
        '.server length === 64': function(topic) {
            assert.strictEqual(topic.server.length, 64);
        },
        '.client is a Buffer': function(topic) {
            assert.equal(Buffer.isBuffer(topic.client), true);
        },
        '.client length === 32': function(topic) {
            assert.strictEqual(topic.client.length, 32);
        },
        '.nonce is a number': function(topic) {
            assert.strictEqual(typeof topic.nonce, 'number');
        },
        '.nonce is >= 0': function(topic) {
            assert.equal(topic.nonce >= 0, true);
        },
        '.nonce does not have a decimal point': function(topic) {
            assert.equal(topic.nonce.toString().indexOf('.'), -1);
        },
        '.roll(10) (second call) equals \'4763859193\'': function(topic) {
            topic.nonce = 0;
            topic.roll(1);
            assert.strictEqual(topic.roll(10), TEST_ARRAY[1]);
        },
        '.roll(10, 100) equals TEST_ARRAY': function(topic) {
            topic.nonce = 0;
            assert.deepStrictEqual(topic.roll(10, 100), TEST_ARRAY);
        }
    }

}).export(module);