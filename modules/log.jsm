/*global Components: true */
/**
 * Mozilla logging service
 * @class SFLog is a class to make the logging easier
 * @constructor
 */
var SurfKeysLog = function () {
    this.s = this.serv();
};
SurfKeysLog.prototype = {
    /**
    * Stores a log service
    */
    s: null,
    /**
    * Stores the loggable message
    */
    msg: null,
    /**
    * Mozilla log service initialization method
    * @return Mozilla log service
    * @type Service
    */
    serv: function () {
        return Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    },
    /**
    * @param {String} arguments The arguments will be written to the error console
    */
    log: function () {
        var msg = [], i, al;
        for (i = 0, al = arguments.length; i < al; i += 1) {
            msg.push(arguments[i].toString());
        }
        try {
            this.s.logStringMessage('SurfKeys: ' + msg.join(', '));
        }
        catch (e) {
            // alert(this.msg.join(', '));
            // alert(this.msg);
        }
    }
};
var surfKeysLog = new SurfKeysLog();

let EXPORTED_SYMBOLS = ['surfKeysLog'];
