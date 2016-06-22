"use strict";

var util = require('util');
var Base = require('../DNS-Records').Base;
var validators = require('../validators');

function Record(value) {
    if (typeof (value) !== 'string')
        throw new TypeError('TXT as (string) is required');

    this.value = value;
    Object.defineProperty(this, '_type', {
        enumerable: true,
        value: 'TXT'
    });

    var serializers = require('../serializers');
    this._serializers =  {
        value: serializers.nsName
    };
    this._validators = {
        value: validators.neText
    };

    this.encode = function serialize() {
        //console.log("A: ", this, this._serializers, this._serializers.value.encode, this.value);
        return this._serializers.value.encode(this.value);
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
