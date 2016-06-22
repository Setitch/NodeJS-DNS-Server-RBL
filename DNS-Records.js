"use strict";
/**
 * https://en.wikipedia.org/wiki/List_of_DNS_record_types
 *
 * http://tools.ietf.org/html/rfc1035
 */

var fs = require('fs');
var path = require('path');

var Errors = require('./errors');
function RecordBase() {
    this._question = null;
    this.addQuestion = function (question) {
        this._question = question;
    };
}
RecordBase.prototype.addQuestion = function (question) {
    this._question = question;
};

module.exports.Base = RecordBase;

var Records = new function obj() {
    var that = this;
    Object.defineProperty(that, 'exists', {
        enumerable: false,
        value: function (type) {
            //console.log(this.queryTypes);
            return (typeof(that.queryTypes[type]) !== 'undefined');
        }
    });
    Object.defineProperty(that, 'get', {
        value: function (type) {
            //console.log(type, isNaN(type), that.exists(type) , that.hasOwnProperty(type), that.exists(type) && that.hasOwnProperty(type), that.queryTypes[type], that[that.queryTypes[type]]);
            if (that.exists(type) && (that.hasOwnProperty(type) || that.hasOwnProperty(that.queryTypes[type]))) {
                //if (typeof(type) == '')
                if (!isNaN(type)) return that[that.queryTypes[type]];
                else
                    return that[type];
            }
            else {
                if (that.exists('ANY')) {
                    return that[that.queryTypes['ANY']];
                } else
                    throw new TypeError('Brak odpowiedniego typu requestu!');
            }
        }
    });

    Object.defineProperty(that, 'isType', {
        value: function (base, type) {
            var tmp = null;
            var compareTo = base;
            if (!isNaN(base)) { compareTo = that.queryTypes[base]; }

            if (isNaN(type)) tmp = type;
            else
                tmp = that.queryTypes[type];

            return tmp === compareTo;
        }
    });
};

RecordBase.prototype.valid = function () {
    throw Errors.NotImplemementedYet();
};

// Export all the record types at the top-level
var subdir = path.join(__dirname, 'DNS-Records');
fs.readdirSync(subdir).forEach(function (file) {
    var name = path.basename(file);
    if (/\w+\.js/.test(name)) {
        name = name.split('.').shift();
        Object.defineProperty(Records, name, {
            enumerable: false,
            value: require(path.join(subdir, file))
        });
    }
});
/**
 * List of protocol query types
 */
Object.defineProperty(Records, 'queryTypes', {
    enumerable: true,
    value: (function () {
        var tmp = {};
        var base = {
            // https://en.wikipedia.org/wiki/List_of_DNS_record_types (ru => english translated too - much better list)
            //0
            A       : 0x01,     // IPv4
            NS      : 0x02,     // Name Server
            CNAME   : 0x05,     // Canonical name
            SOA     : 0x06,     // Start of Authority
            PTR     : 0x0C,     // Pointer Record
            HINFO   : 0x0D,     // Host Information
            MINFO   : 0x0E,     // Mailbox or mailing list information
            MX      : 0x0F,     // Mail Exchanger
            //16
            TXT     : 0x10,     // Text Record/String
            RP      : 0x11,     // Responsible person
            AFSDB   : 0x12,     // ASF Database
            X25     : 0x13,     // PSDN address / Address Format X.25 => https://en.wikipedia.org/wiki/X.25
            ISDN    : 0x14,     // ISDN address // https://en.wikipedia.org/wiki/Integrated_Services_Digital_Network
            RT      : 0x15,     // Route through
            NSAP    : 0x16,     // Network service access point address
            SIG     : 0x18,     // Cryptographic public key signature
            KEY     : 0x19,     // Public Key
            AAAA    : 0x1C,     // IPv6
            LOC     : 0x1D,     // Location information
            //32
            SRV     : 0x21,     // Server selection
            NAPTR   : 0x23,     // Namin authority pointer
            KS      : 0x24,     // Key Exchanger
            CERT    : 0x25,     // Certificate record  //  Stores PKIS, SPKI, PGP, etæ
            DNAME   : 0x27,     // Delegation Name
            SINK    : 0x28,     // Option // This is a "pseudo DNS record type" needed to support EDNS => https://en.wikipedia.org/wiki/EDNS        @@@ Pseudo resource
            OPT     : 0x29,     // Option // This is a "pseudo DNS record type" needed to support EDNS => https://en.wikipedia.org/wiki/EDNS        @@@ Pseudo resource
            DS      : 0x2B,     // Delegation signer
            SSHFP   : 0x2C,     // SSH Public Key Fingerprint
            IPSECKEY: 0x2D,     // IPsec Key
            RRSIG   : 0x2E,     // DNSSEC Signature
            NSEC    : 0x2F,     // Next-Secure Record
            //48
            DNSKEY  : 0x30,     // DNS Key Record
            DHCID   : 0x31,     // DHCP Identifier
            NSEC3   : 0x32,     // NSEC Record Version 3
            NSEC3PARAM: 0x33,   // NSEC3 Parameters
            TLSA    : 0x34,     // TLSA Certificate association
            HIP     : 0x37,     // Host Identity Protocol
            NINFO   : 0x38,     // http://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#Jim_Reid
            RKEY    : 0x39,     // http://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#Jim_Reid
            TALINK  : 0x3A,     // Trust Anchor LINK // http://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#Wouter_Wijngaards
            CDS     : 0x3B,     // Child DS
            CDNSKEY : 0x3C,     // Child DNSKEY
            OPENPGPKEY: 0x3D,   // OpenPGP Key
            CSYNC   : 0x3E,     // Child-To-Parent Synchronization

            SPF     : 0x63,     // http://www.iana.org/go/rfc7208

            TKEY    : 0xF9,     // Secret Key Record
            TSIG    : 0xFA,     // Transaction Signature
            IXFR    : 0xFB,     // Incremental Zone Transfer
            AXFR    : 0xFC,     // Authoritative Zone Transfer
            MAILA   : 0xFE,     // ?
            MAILB   : 0xFD,     // ?
            ANY     : 0xFF,     // ANY (cached records)
            URI     : 0x100,    // URI
            CAA     : 0x101,    // Certificate Authority Restriction
            TA      : 0x8000,   // DNSSEC Trust Authorities
            DVL     : 0x8001,   // DNSSEC Lookaside Validation
            // OBSOLETE
            MD      : 0x03,
            MF      : 0x04,
            'NSAP-PTR': 0x17,     // NSAP pointer
            GPOS    : 0x1A,     // Geographical position
            NXT     : 0x1E,     // Next domain
            EID     : 0x1F,     // ?
            NIMLOC  : 0x20,     // ?
            ATMA    : 0x22,     // ?
            A6      : 0x26,     // IPv4 - downgraded!
            UINFO   : 0x64,     // ?
            UID     : 0x65,     // ?
            GID     : 0x66,     // ?
            UNSPEC  : 0x67,     // ?
            NID     : 0x68,     // ?
            L32     : 0x69,     // ?
            L64     : 0x6A,     // ?
            LP      : 0x6B,     // ?
            EUI48   : 0x6C,     // ?
            EUI64   : 0x6D,     // ?
            // Experimentals
            MB      : 0x07,   // MailBox
            MG      : 0x08,   // Mail group Member
            MR      : 0x09,   // Mail rename domain name.
            NULL    : 0x0A,   // Null record
            WKS     : 0x0B,   // Well-known service
            APL     : 0x2A,     // Address Prefix List
            // UNASIGNED
            '?1'    : 0x35,     // Unassigned
            '?2'    : 0x36,     // Unassigned
            '?A.'   : 0x3F,     // 63 -- Begin Unassigned
            '?A..'  : 0x62,     // 98 -- END Unassigned
            '?B.'   : 0x6E,     // 110  -- Begin Unassigned
            '?B..'  : 0xF8,     // 248  -- END: Unassigned
            '?C.'   : 0x8002,   // 32770 - Begin Unassigned
            '?C..'  : 0xFEFF,   // 65279 - END Unassigned
            '?D.'   : 0xFF00,   // 65280 - Begin: Priv
            '?D..'  : 0xFFFE,   // 65534 - END: Priv
            '?3'    : 0xFFFF,   // 65535 -- RESERVED
        };

        for (var i in base) {
            if (!base.hasOwnProperty(i)) continue;
            //console.log(i, base[i]);
            Object.defineProperty(tmp, i, {
                enumerable: true,
                value: base[i]
            });
            Object.defineProperty(tmp, base[i], {
                enumerable: true,
                value: i
            });
        }

        return tmp;
    })()
});


module.exports = Records;

