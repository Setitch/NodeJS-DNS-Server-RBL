"use strict";
/*jslint node: true *//*jshint strict:false */
/*jslint nomen: true *//*jshint nomen: true */
var fs = require('fs');
var path = require('path');

var Sys = require('sys');
var Buffer = require('buffer').Buffer;
var Serializers = require('./serializers');
var Dgram = require('dgram');
var Query = require('./DNS-Query');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var host = 'localhost';
var port = 53;


var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('dns.db');

function Server() {
    var that = this;
    var socket = Dgram.createSocket('udp4');
	
	//console.log(that);
    //util.inherits(that, EventEmitter);

    socket.on('message', function(msg, rinfo) {
        rinfo.socket = socket;
        //console.log('Received %d bytes from %s:%d\n', msg.length, rinfo.address, rinfo.port);
        //console.log(rinfo);

        var query = new Query(msg, rinfo);
        console.log(msg);
        //console.log(query);

        var questions = query.getQuestions();
        console.log('questions', questions);
        for (var i in questions) {
            if (!questions.hasOwnProperty(i)) continue;

            var question = questions[i];
            that.emit('question', query, question.val);
        }
        that.emit('queryEnd', query);
    });

    socket.on('listening', function (a,b) {
        //that.emit('listening', a,b);
    });

    socket.on('error', function (err) {
        //console.log('Error', err);
        that.emit('error', err);
    });

    socket.on('close', function () {
        console.log('Server Closed');
    });


    socket.bind(53);

    //console.log(socket);
    this.getSocket = function (type) {
        return socket;
    };

    return this;
}
Server.prototype = Object.create(EventEmitter.prototype);

function Addresses() {
    var types = {
        perma: '127.0.0.255',
        spam: '127.0.0.2',
        virus: '127.0.0.3'
    };


    var addr = {};
    var i =0;
    var subdir = path.join(__dirname, 'DB/');
    fs.readdirSync(subdir).forEach(function (file) {
        var name = path.basename(file);
        if (/\w+\.txt/.test(name)) {
            name = name.split('.').shift();
            fs.readFileSync(subdir + name + '.txt', "utf8").toString().split("\n").forEach(function (line) {
                var obj = {
                    type: name,
                    A: types[name]
                };
                addr[line.trim()] = obj;
                console.log(name, line.trim(), ++i);
            });
        }
    });

    this.getRecord = function (domain, recordType) {
        var tmp = domain.split('.');
        var count = tmp.length;
        //console.log(tmp, count);
        for (var i = 0; i < count; ++i) {
            var dmn = [];
            for (var j = 0; j <= i; ++j) {
                dmn.push(tmp[j]);
            }
            dmn = dmn.join('.');


            console.log('Searching for', dmn);
            if (!addr.hasOwnProperty(dmn) || dmn === '') continue;
            var obj = addr[dmn];
            console.log('Found', dmn, obj);
            return obj.A;
        }

        return '127.0.0.0';
    };
}
var addresses = new Addresses();
var server = new Server();



server.on('question', function (query, question) {
    var Records = require('./DNS-Records');
    //console.log('Question', question);

    parseQuestion(question, function (err, question, answer) {
        //console.log("parseQuestion => ", err, "|", question, answer);
        if (err === false) {
            answer.addQuestion(question);
            query.addAnswer(answer);
        } else {
            query.setError('internal');
        }
    });


    //var data = "DUPA";
    //if (Records.isType('A', question.type))
    //    data = '127.1.1.127';
    //else if (Records.isType('AAAA',question.type))
    //    data = '::0';
    //else if (Records.isType('TXT',question.type))
    //    data = "DDDDUPA";
    //var answer = question.createAnswer(data);
    //if (answer === false) {
    //    // Nie udało się.
    //    answer = Records.get('TXT');
    //    answer = new answer('Brak rekordu danego typu!');
    //    //console.log("Brak rekordu danego typu!");
    //    question.type = Records.queryTypes['TXT'];
    //}
    //answer.addQuestion(question);
    //query.addAnswer(answer);
});
server.on('listening', function (a,b) {
    console.log('Listening', this, a,b);
});
server.on('queryEnd', answerQuery);
function answerQuery (query, force) {
    console.log('queryEnd ', query.getID());
    if (query.areAnswersReady() || force === true) {
        var packet = query.getAnswerPacket();
        var socket = server.getSocket(query.getRequester().family);

        socket.send(packet, 0, packet.length, query.getRequester().port, query.getRequester().address, function () {
            console.log('Query Answered: ', query.getID());
        });
    } else {
        if (typeof(query.getID().a) === 'undefined') query.getID().a = 1;
        else
            ++query.getID().a;
        if (query.getID().a < 10) {
            setTimeout(function () {
                answerQuery(query);
            }, 10);
        } else {
            answerQuery(query, true);
        }
    }
}


function parseQuestion ( question, callback ) {
    var Records = require('./DNS-Records');

    var host = question.name;
    var type = Records.queryTypes[question.type];

    if (type === "") {
        //TODO: Gdy pewien wpis to:  <type>.<poziom>.<domena do blocka> jako zapytanie o MD
        return;
    }

    function execute(err, question, answer) {
        if (typeof(callback) === 'function') callback(err, question, answer);

    }

    //TODO: Pobierz odpowiedź z bazy czy coś.

    var err;



    var data = "Request answered...";
    data = addresses.getRecord(question.name, question.type);
    //if (Records.isType('A', question.type))
    //    data = '127.1.1.127';
    var answer = question.createAnswer(data);
    if (answer === false) {
        // Nie udało się.
        answer = Records.get('TXT');
        answer = new answer('Brak rekordu danego typu!');
        //console.log("Brak rekordu danego typu!");
        question.type = Records.queryTypes['TXT'];
    }
    //ŹLE
    //execute(true, err);
    //DOBRZE
    execute(false, question, answer);
}