"use strict";
var Buffer = require('buffer').Buffer;
var serializers = require('../serializers');
var Records = require('../DNS-Records');

var nsQuestionObject = function (question) {
    this.name = '';
    this.type = '';
    this.qClass = '';


    this.createAnswer = function (data) {
        try {
            var record = Records.get(this.type);
            return new record(data);
        } catch (e) {
            return false;
        }
    };

    return this;
};

var Serializer = {
    encode: function (question) {
        //console.log('Question', question, question.val);
        var buff = new Buffer(0);
        buff = Buffer.concat([serializers.nsName.encode(question.name), serializers.UInt16BE.encode(question.type), serializers.UInt16BE.encode(question.qClass)]);
        return buff;
    },
    decode: function (val, pos) {
        var domain = serializers.nsName.decode(val, pos);
        var type = serializers.UInt16BE.decode(val, pos + domain.len);
        var qClass = serializers.UInt16BE.decode(val, pos + domain.len + 2);

        var nsQuestion = new nsQuestionObject();
        nsQuestion.name = domain.val;
        nsQuestion.type = type.val;
        nsQuestion.qClass = qClass.val;
        return {val: nsQuestion, len: domain.len + 4};
    }
};

module.exports = Serializer;
