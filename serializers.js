"use strict";

var fs = require('fs');
var path = require('path');

function  Serializers () {
    var that = this;
    // Przeycztaj pliki [sync] i ustaw je jako odpowiednie serializatory
    var subdir = path.join(__dirname, 'Serializers');
    fs.readdir(subdir,function (err, files) {
        for (var i in files) {
            if (!files.hasOwnProperty(i)) continue;

            var file = files[i];
            var name = path.basename(file);

            if (/\w+\.js/.test(name)) {
                name = name.split('.').shift();
                that[name] = require(path.join(subdir, file));
            }
        }
    });
    return that;
}

module.exports = new Serializers();
