"use strict";

function Validator(value) {
    // RegExp: http://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address @ Sakari A. Maaranen
    //var reg =/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;
    var reg =/^([a-z0-9]|[a-z0-9][a-z0-9\-]{0,61}[a-z0-9])(\.([a-z0-9]|[a-z0-9][a-z0-9\-]{0,61}[a-z0-9]))*$/i;
    if (typeof(value) !== 'string') return false;
    if (value.length > 255) return false;

    return reg.test(value);
}

module.exports = Validator;