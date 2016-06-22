
"use strict";
var Buffer = require('buffer').Buffer;
var serializers = require('../serializers');
var Records = require('../DNS-Records');

var Serializer = {
    encode: function (answer) {
        try {
            //console.log('Answer Serialize:', answer);
            this.type = answer.type;
            var data = answer.encode(); //serializers.get(this.type).encode(val);
            //console.log("DATA", data, serializers.nsName.encode(answer._question.name));
            var buff = new Buffer(0);
            buff = Buffer.concat([serializers.nsName.encode(answer._question.name), serializers.UInt16BE.encode(answer._question.type), serializers.UInt16BE.encode(answer._question.qClass), serializers.UInt32BE.encode(255)]);
            buff = Buffer.concat([buff, serializers.UInt16BE.encode(data.length), data]);
            //console.log("Answer BUFFER", buff, data.length);
            return buff;
        } catch (e) {
            throw {type: "Answers"};
        }
    },
    decode: function (val, pos) {
        throw new EventException('Cannot be run on this object');
    }
};

module.exports = Serializer;
