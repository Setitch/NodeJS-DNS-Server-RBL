var util = require('util');
var Base = require('../DNS-Records').Base;
var validators = require('../validators');

function Record(cpu, os) {
    if (typeof (cpu) !== 'string')
        throw new TypeError('CPU as (string) is required');
    if (typeof (os) !== 'string')
        throw new TypeError('OS as (string) is required');

    this.cpu = cpu;
    this.os = os;
    Object.defineProperty(this, '_type', {
        enumerable: true,
        value: 'HINFO'
    });

    return this;
}
util.inherits(Record, Base);

module.exports = Record;

Record.prototype._record = {
    cpu: validators.nsName,
    os: validators.nsName
};

Record.prototype.valid = function valid() {
    var self = this;
    return validators.validate(self, this._record);
};