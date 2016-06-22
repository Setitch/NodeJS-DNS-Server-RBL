"use strict";

var util = require('util');
var Base = require('../DNS-Records').Base;
var validators = require('../validators');

var defaults = {
    admin: 'hostmaster.',
    serial: 0,
    refresh: 10,
    retry: 10,
    expire: 10,
    ttl: 10
};

function Record(value, params) {
    if (typeof (value) !== 'string')
        throw new TypeError('SOA as (string) is required');


    // Merge options with default values!
    if (!params) params = {};
    for (var key in defaults) {
        if (!defaults.hasOwnProperty(key)) continue;
        if (key in params) continue;

        params[key] = defaults[key];
        if (key === 'admin') params[key] = params[key] + value;
    }


    this.host = value;
    this.admin = params.admin;
    this.serial = params.serial;
    this.refresh = params.refresh;
    this.retry = params.retry;
    this.expire = params.expire;
    this.ttl = params.ttl    ;
    Object.defineProperty(this, '_type', {
        enumerable: true,
        value: 'SOA'
    });

    return this;
}
util.inherits(Record, Base);

module.exports = Record;

Record.prototype._record = {
    host: validators.nsName,
    admin: validators.nsName,
    serial: validators.UInt32BE,
    refresh: validators.UInt32BE,
    retry: validators.UInt32BE,
    expire: validators.UInt32BE,
    ttl: validators.UInt32BE
};

Record.prototype.valid = function valid() {
    var that = this;
    return validators.validate(that, this._record);
};