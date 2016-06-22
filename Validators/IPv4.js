"use strict";

var net = require('net');

function Validator(value) {
    return net.isIPv4(value);
}
module.exports = Validator;

