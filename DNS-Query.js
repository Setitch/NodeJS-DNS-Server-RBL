"use strict";
var Serializers = require('./serializers');
var Records = require('./DNS-Records');


var toParse = {
    header: {
        /* BEGIN: Header */
        id: null,
        nsFlags: null,
        QDCount: null,
        ANCount: null,
        NSCount: null,
        ARCount: null,
        /* END: Header */
    },
    /* BEGIN: Questions */
    Questions: ['header.QDCount.val'],
    /* END: Questions */
};

function Query(request, requester) {
    var _request = request;
    var _requester = requester;

    var filters = {
        id: Serializers.UInt16BE,
        nsFlags: Serializers.__nsFlags,
        nsCounts: Serializers.__nsCounts,
        QDCount: Serializers.UInt16BE,
        ANCount: Serializers.UInt16BE,
        NSCount: Serializers.UInt16BE,
        ARCount: Serializers.UInt16BE,
        Questions: Serializers.nsQuestion,
        Answers: Serializers.nsAnswer,
    };

    var tmp = {};
    var queryAnswer = {};
    var pos = {pos:0}; //For Reference!

    function getCount(result, tree) {
        var o = result;
        var txt = tree[0].split('.');
        for (var p in txt) {
            if (!txt.hasOwnProperty(p)) continue;
            //console.log(p,o, txt[p]);
            o = o[txt[p]];
        }
        return o;
    }

    function parse(obj, res, /*&*/pos) {
        var tmp = {};
        for (var i in obj) {
        //console.log('Parsing: ', i, pos.pos);
            if (!obj.hasOwnProperty(i)) continue;

            if (obj[i] instanceof Array) {
                var count = getCount(tmp, obj[i]);
                tmp[i] = [];
                for (var j = 0; j < count; ++j) {
                    if (filters.hasOwnProperty(i)) {
                        var t = filters[i].decode(res, pos.pos);
                        //console.log('Question', t);
                        tmp[i].push(t);
                        pos += t.len;
                    }
                }
            } else if (!filters.hasOwnProperty(i)) {
                tmp[i] = parse(obj[i], res, pos);
            } else {
                //console.log(filters, i, filters[i]);
                tmp[i] = filters[i].decode(res, pos.pos);
                pos.pos += tmp[i].len;
            }
        }

        return tmp;
    }

    function encode(obj) {
        var tmp = new Buffer(0);
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;

            if (obj[i] instanceof Array) {
                var count = obj[i].length;
                    for (var j = 0; j < count; ++j) {
                        if (filters.hasOwnProperty(i)) {
                            //console.log('Answer1', filters[i], obj[i][j]);
                            var t = filters[i].encode(typeof(obj[i][j].val) === 'undefined' ? obj[i][j] : obj[i][j].val);
                            //console.log('Answer3', t);
                            tmp = Buffer.concat([tmp, t]);
                        }
                    }
            } else if (!filters.hasOwnProperty(i)) {
                tmp = Buffer.concat([tmp, encode(obj[i], obj[i].val)]);
            } else {
                //console.log(obj[i].val, tmp, i, filters[i], filters[i].encode(obj[i].val));
                tmp = Buffer.concat([tmp, filters[i].encode(obj[i].val)]);
            }
            //console.log(tmp);
        }

        return tmp;
    }

    tmp = parse(toParse, request, pos);
    //console.log(pos, tmp);
//console.log('Flags', tmp.header);
    Object.defineProperty(this, 'query', {
        value: tmp
    });

    queryAnswer = JSON.parse(JSON.stringify(tmp));
    queryAnswer.Answers = [];
    queryAnswer.header.nsFlags.val.QR = 1;
    queryAnswer.header.nsFlags.val.AA = 1;


    this.encode = function () {};
    this.addAnswer = function (answer) {
        //console.log('Adding answer', answer);
        ++queryAnswer.header.ANCount.val;
        queryAnswer.Answers.push(answer);
    };
    this.addAnswers = function (answers) {
        for (var i in answers) {
            if (!answers.hasOwnProperty(i)) continue;

            var answer = answers[i];
            this.addAnswer(answer);
        }
    };

    this.setError = function (type) {
        queryAnswer.header.nsFlags.val.RCode = Errors.DNS_EREFUSED;
    };

    this.areAnswersReady = function () {
        return queryAnswer.Answers.length === queryAnswer.Questions.length;
    };
    this.getID = function () {
        return this.query.header.id;
    };

    this.getQuestions = function () {
        return this.query.Questions;
    };
    this.answer = function (socket) {
        //console.log('Sending query', _requester);
        //var packet = query.getAnswerPacket();
        //socket.socket.sendTo(packet,0, packet.length, query.getRequester().port, query.getRequester().address, function () {console.log('Query Answered');});
    };
    this.getAnswerPacket = function () {
        var ret = null;
        while((true)) {
            try {
                //console.log(queryAnswer);
                ret = encode(queryAnswer);
                break;
            } catch (e) {
                //console.log(e.type);
                if (e.type === 'Answers') {
                    queryAnswer.header.ANCount.val = 0;
                    queryAnswer.Answers = [];
                    queryAnswer.header.nsFlags.val.RCode =Errors.DNS_ESERVER;
                }
            }

        }
        return ret;
    };
    this.getRequester = function () {
        return _requester;
    };
    return this;
}


module.exports = Query;

// http://www.tcpipguide.com/free/t_DNSMessageHeaderandQuestionSectionFormat.htm
var Errors =  {
    // Regular Errors
    DNS_ENOERR   : 0x00, // No error
    DNS_EFORMAT  : 0x01, // Format Error
    DNS_ESERVER  : 0x02, // Server Failure
    DNS_ENONAME  : 0x03, // Name Error
    DNS_ENOTIMPL : 0x04, // Not Implemented
    DNS_EREFUSED : 0x05, // Refused
    // Dynamic Errors
    DNS_EYXDMN   : 0x06, // A name exists when it should not.
    DNS_EYXRRSET : 0x07, // Resource Record set exists that should not
    DNS_ENXRRSET : 0x08, // Resource Record set exists that should not
    DNS_ENOTAUTH : 0x09, // Server requesting change is not authoritative for the zone
    DNS_ENOTZONE : 0x10  // Name specified in message is not within specified zone.
};
module.exports.Errors = Errors;

var qClasses = {
    QCLASS_INTERNET     : 0x0000,
    QCLASS_CHAOS        : 0x0003,
    QCLASS_HEDIOD       : 0x0004,

    0x000               : 'QCLASS_INTERNET',
    0x003               : 'QCLASS_CHAOS',
    0x004               : 'QCLASS_HEDIOD'
};
module.exports.qClasses = qClasses;
