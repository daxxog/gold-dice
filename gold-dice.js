/* GoldDice
 * the gold standard for provably fair dice
 * (c) 2016 David (daXXog) Volm ><> + + + <><
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
        Big = require('big.js'),
        Crypto = require('bitcore-lib').crypto;
    
    GoldDice = function(constructor) {
        var that = this;
        
        if(constructor) {
            if(typeof constructor === 'string') {
                constructor = JSON.parse(constructor);
                constructor.server = new Buffer(constructor.server.data);
                constructor.client = new Buffer(constructor.client.data);
            }
            
            ['server', 'client', 'nonce'].forEach(function(v) {
                that[v] = constructor[v];
            });
        }
        
        if(!(Buffer.isBuffer(this.server) && (this.server.length === 64))) {
            this.server = Crypto.Hash.sha512(new Buffer(Math.random().toString(), 'utf8'));
        }
        
        if(!(Buffer.isBuffer(this.client) && (this.client.length === 32))) {
            this.client = Crypto.Hash.sha256(new Buffer(Math.random().toString(), 'utf8'));
        }
        
        if(typeof this.nonce !== 'number') {
            this.nonce = 0;
        }
        
        if(this.nonce < 0) {
            this.nonce = 0;
        }
        
        if(this.nonce.toString().indexOf('.') !== -1) {
            this.nonce = 0;
        }
    };
    
    //- Constants
    Big.DP = 10;
    Big.RM = 1;
    GoldDice.MAX_VAL = new Big(0xffffffffff); //1099511627775
    
    //- Static Functions
    GoldDice.splice = function(k, digits) {
        return k.split('').reverse().splice(0, digits).join('');
    };
    
    GoldDice.k = function(s) {
        var k = (new Big(parseInt(s[0] + s[1] + s[2] + s[3] + s[4] + s[5] + s[6] + s[7] + s[8] + s[9], 16)))
            .div(GoldDice.MAX_VAL)
            .toString(),
            kl;
        
        if(k === '1') {
            k = '0000000001';
        } else {
            k = k.split('.')[1];
        }
        
        if(k.length < 10) {
            kl = k.length;
            
            for(var i = 0; i < (10 - kl); i++) {
                k += '0';
            }
        }
        
        return k;
    };
    
    //- Class Functions
    GoldDice.prototype.roll = function(digits, rolls) {
        var result = [],
            p, b, s, k, r;
        
        if(typeof rolls === 'undefined') {
            rolls = 1;
        }
        
        for(var i = 0; i < rolls; i++) {
            this.nonce += 1;
            
            p = Crypto.Hash.hmac(Crypto.Hash.sha256, new Buffer(this.nonce.toString(), 'utf8'), this.client);
            b = Crypto.Hash.hmac(Crypto.Hash.sha256, p, this.server);
            
            s = b.toString('hex').split('');
            
            k = GoldDice.k(s);
            r = GoldDice.splice(k, digits);
            
            if(rolls === 1) {
                result = r;
            } else {
                result.push(r);
            }
        }
        
        return result;
    };
    
    GoldDice.prototype.toObject = function() {
        return {
            server: this.server,
            client: this.client,
            nonce: this.nonce
        };
    };
    
    GoldDice.prototype.toString = function() {
        return JSON.stringify(this.toObject());
    };
    
    return GoldDice;
}));
