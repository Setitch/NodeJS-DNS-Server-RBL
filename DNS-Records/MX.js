"use strict";

var util = require('util');
var Base = require('../DNS-Records').Base;
var validators = require('../validators');

var defaults = {
    priority: 0,
    ttl: 600
};

function Record(value, params) {
    if (typeof (value) !== 'string')
        throw new TypeError('MX as (string) is required');


    // Merge options with default values!
    if (!params) params = {};
    for (var key in defaults) {
        if (!defaults.hasOwnProperty(key)) continue;
        if (key in params) continue;

        params[key] = defaults[key];
    }

    this.value = value;
    this.ttl = params.ttl;
    this.priority = params.priority;
    Object.defineProperty(this, '_type', {
        enumerable: true,
        value: 'MX'
    });

    return this;
}
util.inherits(Record, Base);

module.exports = Record;

Record.prototype._record = {
    value: validators.nsName,
    ttl: validators.UInt32BE,
    priority: validators.UInt16BE
};

Record.prototype.valid = function valid() {
    var that = this;
    return validators.validate(that, this._record);
};