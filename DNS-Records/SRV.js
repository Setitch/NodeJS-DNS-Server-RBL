"use strict";

var util = require('util');
var Base = require('../DNS-Records').Base;
var validators = require('../validators');

var defaults = {
    priority:   0,
    weight:     10
};

function Record(value, port, params) {
    if (typeof (value) !== 'string')
        throw new TypeError('SOA host as (string) is required');
    if (parseInt(port) != port || port <= 0)
        throw new TypeError('SOA port as (int) is required');


    // Merge options with default values!
    if (!params) params = {};
    for (var key in defaults) {
        if (!defaults.hasOwnProperty(key)) continue;
        if (key in params) continue;

        params[key] = defaults[key];
        if (key === 'admin') params[key] = params[key] + value;
    }


    this.host = value;
    this.port = port;
    this.weight = params.weight;
    this.priority = params.priority;
    Object.defineProperty(this, '_type', {
        enumerable: true,
        value: 'SRV'
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