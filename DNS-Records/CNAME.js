"use strict";

var util = require('util');
var Base = require('../DNS-Records').Base;
var validators = require('../validators');

function Record(value) {
    if (typeof (value) !== 'string')
        throw new TypeError('IPv4 Addr (string) is required');

    this.value = value;
    Object.defineProperty(this, '_type', {
        enumerable: true,
        value: 'CNAME'
    });

    return this;
}
util.inherits(Record, Base);

module.exports = Record;

Record.prototype._record = {
    value: validators.nsName
};

Record.prototype.valid = function valid() {
    var that = this;
    return validators.validate(that, this._record);
};