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
        crypto = require('crypto'),
        Crypto = (function() { //placeholder functions for bitcore-lib/crypto
            _Crypto = {
                Hash: {
                    sha512: function(buffer) { //- https://github.com/bitpay/bitcore/blob/v8.2.0/packages/bitcore-lib/lib/crypto/hash.js#L38
                        //$.checkArgument(BufferUtil.isBuffer(buf));
                        return crypto.createHash('sha512').update(buffer).digest();
                    },
                    sha256: function(buffer) { //- https://github.com/bitpay/bitcore/blob/v8.2.0/packages/bitcore-lib/lib/crypto/hash.js#L16
                        //$.checkArgument(BufferUtil.isBuffer(buf));
                        return crypto.createHash('sha256').update(buffer).digest();
                    },
                    hmac: function(hashf, data, key) { //- https://github.com/bitpay/bitcore/blob/v8.2.0/packages/bitcore-lib/lib/crypto/hash.js#L45
                        //$.checkArgument(BufferUtil.isBuffer(data));
                        //$.checkArgument(BufferUtil.isBuffer(key));
                        //$.checkArgument(hashf.blocksize);

                        var blocksize = hashf.blocksize / 8;

                        if (key.length > blocksize) {
                            key = hashf(key);
                        } else if (key < blocksize) {
                            var fill = Buffer.alloc(blocksize);
                            fill.fill(0);
                            key.copy(fill);
                            key = fill;
                        }

                        var o_key = Buffer.alloc(blocksize);
                        o_key.fill(0x5c);

                        var i_key = Buffer.alloc(blocksize);
                        i_key.fill(0x36);

                        var o_key_pad = Buffer.alloc(blocksize);
                        var i_key_pad = Buffer.alloc(blocksize);
                        for (var i = 0; i < blocksize; i++) {
                            o_key_pad[i] = o_key[i] ^ key[i];
                            i_key_pad[i] = i_key[i] ^ key[i];
                        }

                        return hashf(Buffer.concat([o_key_pad, hashf(Buffer.concat([i_key_pad, data]))]));
                    }
                }
            };

            _Crypto.Hash.sha512.blocksize = 1024; //- https://github.com/bitpay/bitcore/blob/v8.2.0/packages/bitcore-lib/lib/crypto/hash.js#L43
            _Crypto.Hash.sha256.blocksize = 512; //- https://github.com/bitpay/bitcore/blob/v8.2.0/packages/bitcore-lib/lib/crypto/hash.js#L21

            return _Crypto;
        })(),
        BufferFromString = function(string, encoding) { //replaces new Buffer(string, encoding)
            if(encoding === 'utf8' || encoding === 'latin1') {
                return Buffer.alloc(string.length, string, encoding);
            } else { //haven't tested other encodings so use the old method
                return new Buffer(string, encoding);
            }
        };
    
    GoldDice = function(constructor) {
        var that = this;
        
        if(constructor) {
            if(typeof constructor === 'string') {
                constructor = JSON.parse(constructor);
                constructor.server = Buffer.from(constructor.server.data);
                constructor.client = Buffer.from(constructor.client.data);
            }
            
            ['server', 'client', 'nonce'].forEach(function(v) {
                that[v] = constructor[v];
            });
        }
        
        if(!(Buffer.isBuffer(this.server) && (this.server.length === 64))) {
            this.server = Crypto.Hash.sha512(BufferFromString(Math.random().toString(), 'utf8'));
        }
        
        if(!(Buffer.isBuffer(this.client) && (this.client.length === 32))) {
            this.client = Crypto.Hash.sha256(BufferFromString(Math.random().toString(), 'utf8'));
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
            
            p = Crypto.Hash.hmac(Crypto.Hash.sha256, BufferFromString(this.nonce.toString(), 'utf8'), this.client);
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
