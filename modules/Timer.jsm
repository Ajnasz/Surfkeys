var timer = Components.classes["@mozilla.org/timer;1"]
              .createInstance(Components.interfaces.nsITimer);
var later = function(fn, delay) {
  var callback = {notify: fn};
  timer.initWithCallback(callback, delay, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
  return timer;
};
var never = function(timer) {
  if(timer && typeof timer.cancel === 'function') {
    timer.cancel();
  }
};
var repeat = function(fn, delay) {
  var callback = {notify: fn};
  timer.initWithCallback(callback, delay, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
  return timer;
};

let EXPORTED_SYMBOLS = ['later', 'never', 'repeat'];
