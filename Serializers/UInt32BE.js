"use strict";
var Buffer = require('buffer').Buffer;

var Serializer = {
    encode: function (val) {
        //return (new Buffer(4)).writeUInt32BE(val, 0);
        var ret = (new Buffer(4));
        //console.log("UIN:",val);
        ret.writeUInt32BE(val, 0);
        return ret;

    },
    decode: function (val, pos) {
        //return val.readUInt32BE(pos); // Zwyk³y int
        return {val: val.readUInt32BE(pos), len: 4};
    }
};

module.exports = Serializer;