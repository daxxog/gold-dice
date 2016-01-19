/* GoldDice
 * the gold standard for provably fair dice
 * (c) 2015 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */

/* UMD LOADER: https://github.com/umdjs/umd/blob/master/returnExports.js */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        root.GoldDice = factory();
  }
}(this, function() {
    var GoldDice,
        Crypto = require('bitcore-lib').crypto;
    
    GoldDice = function(constructor) {
        if(constructor) { //todo add constructor / serialization
        }
        
        if(!(Buffer.isBuffer(this.server) && (this.server.length === 64))) {
            this.server = Crypto.Hash.sha512(new Buffer(Math.random().toString(), 'utf8'));
        }
        
        if(!(Buffer.isBuffer(this.client) && (this.server.length === 32))) {
            this.client = Crypto.Hash.sha256(new Buffer(Math.random().toString(), 'utf8'));
        }
        
        if(typeof this.nonce !== 'number') {
            this.nonce = 0;
        }
    };
    
    GoldDice.kalc = function(k, digits) {
        return k.toString(10).split('').reverse().splice(0, digits).join('');
    };
    
    GoldDice.k = function(s, o) {
        return parseInt(s[0 + o] + s[1 + o] + s[2 + o] + s[3 + o] + s[4 + o], 16);
    };
    
    GoldDice.UPPER_LIMIT = 1000000; //0xfffff - 1000000 = 48575
    GoldDice.MAX_SEEK = 6; //Math.floor(b.length / 5)
    
    GoldDice.prototype.roll = function(digits, rolls) {
        var result = [],
            p, b, s, k, o, r;
        
        for(var i = 0; i < rolls; i++) {
            r = false;
            o = 10;
            this.nonce += 1;
            
            p = Crypto.Hash.hmac(Crypto.Hash.sha256, new Buffer(this.nonce.toString(), 'utf8'), this.client);
            b = Crypto.Hash.hmac(Crypto.Hash.sha256, p, this.server);
            
            s = b.toString('hex').split('');
            k = GoldDice.k(s, o);
            
            for(var j = 0; j < GoldDice.MAX_SEEK; j++) {
                if(k < GoldDice.UPPER_LIMIT) {
                    r = GoldDice.kalc(k, digits);
                    break;
                } else {
                    o += 5;
                    k = GoldDice.k(s, o);
                }
            }
            
            if(r === false) { //re roll
                i--;
            } else {
                result.push(r);
            }
            
        }
        
        return result;
    };
    
    return GoldDice;
}));
