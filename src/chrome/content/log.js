/**
 * Mozilla logging service
 * @class SFLog is a class to make the logging easier
 * @constructor
 */
var SurfKeysLog = function() {
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
  serv: function() {
    return Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  },
  /**
   * @param {String} arguments The arguments will be written to the error console
   */
  log: function() {
    this.msg = new String();
    for(var i = 0; i < arguments.length; i++) {
      this.msg += ', ' + arguments[i];
    }
    try {
      this.s.logStringMessage('SurfKeys: ' + this.msg.replace(/^, /, ''));
    }
    catch(e) {
      // alert(this.msg.join(', '));
      // alert(this.msg);
    };
  }
};
var SKLog = new SurfKeysLog();
