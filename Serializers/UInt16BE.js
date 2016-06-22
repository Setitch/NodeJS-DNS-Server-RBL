"use strict";
var Buffer = require('buffer').Buffer;

var Serializer = {
    encode: function (val) {
        var ret = (new Buffer(2));
        ret.writeUInt16BE(val, 0);
        return ret;
    },
    decode: function (val, pos) {
        return {val: val.readUInt16BE(pos), len: 2};
    }
};

module.exports = Serializer;