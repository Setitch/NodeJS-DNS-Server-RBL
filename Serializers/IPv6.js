"use strict";
var Buffer = require('buffer').Buffer;


var Serializer = {
    encode: function (val) {
        var ret = (new Buffer(16));
        var ip6Parts = val.split('.'); // Find a simple way to parse IPv6.
        for (var i = 0; i < 8; ++i) {
            ret.writeUInt16BE(val, i*2);
        }
        return ret;
    },
    decode: function (val, pos) {
        //var val = '';
        //
        //return {val: val.readUInt16BE(pos), len: 16};
    }
};

module.exports = Serializer;