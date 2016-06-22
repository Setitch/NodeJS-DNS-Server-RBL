"use strict";

var net = require('net');

function Validator(value) {
    return net.isIPv6(value);
}
module.exports = Validator;

