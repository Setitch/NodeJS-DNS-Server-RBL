"use strict";
var Buffer = require('buffer').Buffer;

var Serializer = {
    encode: function (val) {
        return (new Buffer(1)).readUIntBE(val, 0);
    },
    decode: function (val, pos) {
        return {val: val.readUIntBE(pos), len: 1};
    }
};

module.exports = Serializer;