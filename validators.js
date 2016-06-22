"use strict";

var fs = require('fs');
var path = require('path');

function  Validators () {

}

// Przeyzctaj pliki [sync] i ustaw je jako odpowiednie validatory.
var subdir = path.join(__dirname, 'Validators');
fs.readdirSync(subdir).forEach(function (file) {
    var name = path.basename(file);
    if (/\w+\.js/.test(name)) {
        name = name.split('.').shift();
        Validators[name] = require(path.join(subdir, file));
    }
});


Validators.validate = function (record, config) {
    for (var prop in config) {
        if (!config.hasOwnProperty(prop)) continue;
        //console.log(prop, config[prop], record[prop]);
        var valid = config[prop](record[prop]);
        if (!valid)
            return false;
    }
    return true;
};


module.exports = Validators;
