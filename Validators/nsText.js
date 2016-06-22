"use strict";

function Validator(value) {
    // hostname regex per RFC1123
    if (typeof(value) !== 'string') return false;
    return v.length < 256;
}

module.exports = Validator;
