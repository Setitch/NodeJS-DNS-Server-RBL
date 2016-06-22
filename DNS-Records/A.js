var util = require('util');
var Base = require('../DNS-Records').Base;
var validators = require('../validators');
var serializers = require('../serializers');

function Record(value) {
    //console.log("Creating A: ", value);
    if (typeof (value) !== 'string')
        throw new TypeError('IPv4 as (string) is required');

    this.value = value;
    Object.defineProperty(this, '_type', {
        enumerable: true,
        value: 'A'
    });

    var serializers = require('../serializers');
    this._serializers =  {
        value: serializers.UInt32BE
    };
    this._validators = {
        value: validators.IPv4
    };

    this.encode = function serialize() {
        //console.log("A: ", this, this._serializers, this._serializers.value.encode, this.value);
        var tmp = this.value.split('.');
        var value = +tmp[0] * 256*256*256 + tmp[1]*256*256 + tmp[2] * 256 + tmp[3]*1;
        //console.log("A::", this.value, this._serializers.value.encode(value));
        return this._serializers.value.encode(value);
    };

    return this;
}
util.inherits(Record, Base);

Record.prototype.valid = function valid() {
    var that = this;
    //var validators = require('../validators');

    return validators.validate(that, that._validators);
};


module.exports = Record;
