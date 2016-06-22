/**
 * @OBSOLETE
 * @DEPRECATED
 */
"use strict";
/** USED: BIT OR [ | ] && BIT AND [ & ] : in the code! **/
/*jslint -W016 *//*jshint -W016 */
var Buffer = require('buffer').Buffer;
var nsCountObject = function (flags) {
    // Bajt 1
    {
        this.QDCount    = ( flags & 0x0C ); //2// // Question Count
        this.ANCount    = ( flags & 0x03 ); //2// // Answer Count
        this.NSCount    = ( flags & 0xC0 ); //2// // Authority Record Count: Specifies the number of resource records in the Authority section of the message.
        this.ARCount    = ( flags & 0x30 ); //2// // Additional Record Count: Specifies the number of resource records in the Additional section of the message.
    }
    return this;
};
var Serializer = {
    encode: function (val) {
        var buf = new Buffer(1);
        var flags = 0x00;
        //Bajt 1
        {
            flags = flags | (val.QDCount << 6);
            flags = flags | (val.ANCount << 6);
            flags = flags | (val.NSCount << 4);
            flags = flags | (val.ARCount << 2);
        }
        // Encode
        buf.writeUIntBE(flags, 0);
        return buf;
    },
    decode: function (val, pos) {
        return { val: new nsCountObject(val.readUIntBE(pos)), len: 1 };
    }
};

module.exports = Serializer;
