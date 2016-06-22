function Errors() {
    function BaseError(message, level) {
        this.message = message;
        this.level = level || 'ERROR';
        this.toString = function () {
            return this.message ? '[' + this.level + ']: ' + this.message : '[' + this.level + ']';
        };

        return this;
    }
    //
    this.NotImplemementedYet = function (message) { return new BaseError(message || '', 'NotImplemementedYet'); };
    //module.exports.Error = Error;
    return this;
}

module.exports = new Errors();
