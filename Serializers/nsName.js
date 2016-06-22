"use strict";
var Buffer = require('buffer').Buffer;

var Serializer = {
    encode: function (val) {
        if (typeof(val) !== 'string')
            throw new TypeError('Name (string) is required');

        var parts = val.split(/\./i);
        var buff = new Buffer(parts.toString().length + 2);
        var offset = 0;

        // [3]www[5]google[2]pl[0]
        for (var i = 0; i < parts.length; ++i) {
            var len = parts[i].length;
            buff[offset] = len;
            buff.write(parts[i], ++offset, len, 'utf8');
            offset += len;
        }
        buff[offset] = 0x00;
        return buff;
    },
    decode: function (val, pos) {
        var startPos = pos;
        var name = [];

        var len = val.readUInt8(pos);

        // [3]www[5]google[2]pl[0]
        while (len != 0x00) {
            ++pos;
            var t = val.slice(pos, pos + len);
            name.push(t.toString());
            pos = pos + len;
            len = val.readUInt8(pos);
        }

        return { val: name.join('.'), len: (pos - startPos + 1) };
    }
};

module.exports = Serializer;
