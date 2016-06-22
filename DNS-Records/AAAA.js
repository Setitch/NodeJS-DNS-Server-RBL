"use strict";

var util = require('util');
var Base = require('../DNS-Records').Base;
var validators = require('../validators');
var serializers = require('../serializers');

function Record(value) {
    if (typeof (value) !== 'string')
        throw new TypeError('IPv6 as (string) is required');

    this.value = value;
    Object.defineProperty(this, '_type', {
        enumerable: true,
        value: 'AAAA'
    });

    this.encode = function serialize() {
        return new Buffer(0);
        //console.log("A: ", this, this._serializers, this._serializers.value.encode, this.value);
        var tmp = this.value.split('.');
        var value = +tmp[0] * 256*256*256 + tmp[1]*256*256 + tmp[2] * 256 + tmp[3]*1;
        return this._serializers.value.encode(value);
    };

    return this;
}
util.inherits(Record, Base);

module.exports = Record;

Record.prototype._validators = {
    value: validators.IPv6
};

Record.prototype._serializers = {
    value: serializers.IPv6
};
Record.prototype.valid = function valid() {
    var that = this;
    return validators.validate(that, that._serializers);
};