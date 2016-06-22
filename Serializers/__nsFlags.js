"use strict";
/** USED: BIT OR [ | ] && BIT AND [ & ] : in the code! **/
    /*jslint -W016 *//*jshint -W016 */
var Buffer = require('buffer').Buffer;
var nsFlagObject = function (flags) {
    // Bajt 1
    {
        this.QR     = ( flags & 0x8000 ) ? true : false;    //1// //0 - query, 1 - answer
        this.OpCode = ( flags & 0x7800 );                   //4// //0 - standard query, 1 - obsolete, 2 - server status request, 3 - reserved, 4 - notify from other servers (ignore), 5 - update (ignore)
        this.AA     = ( flags & 0x0400 ) ? true : false;    //1// //true - authoritative server
        this.TC     = ( flags & 0x0200 ) ? true : false;    //1// //true - msg is longer than 512 bytes
        this.RD     = ( flags & 0x0100 ) ? true : false;    //1// //true - recursion desired      //! change to false if server do not implements it
    }

    // Bajt 2
    {
        this.RA     = ( flags & 0x0080 ) ? true : false;    //1// //true - recursion available    //! change to false if server do not implements it
        this.Z      = ( flags & 0x0040 ) ? true : false;    //3// //000 - reserved
        this.RCode  = ( flags & 0x000F );                   //4//
    }
    return this;
};
var Serializer = {
    encode: function (val) {
        var buf = new Buffer(2);
        var flags = 0x0000;
        //Bajt 1
        {
            flags = flags | (val.QR << 15);
            flags = flags | (val.OpCode << 11);
            flags = flags | (val.AA << 10);
            flags = flags | (val.TC << 9);
            flags = flags | (val.RD << 8);
        }
        //Bajt 2
        {
            flags = flags | (val.RA << 7);
            flags = flags | (val.Z << 6);
            //flags = flags | val.RCode; // Cannot be here as it would overwrite some data!
            flags = flags | val.RCode;
        }
        // Encode
        buf.writeUInt16BE(flags, 0);
        return buf;
    },
    decode: function (val, pos) {
        return { val: new nsFlagObject(val.readUInt16BE(pos)), len: 2 };
    }
};

module.exports = Serializer;
