var EditPath = {
  init: function() {
    var input = document.getElementById('path');
    var currloc = window.arguments[0];
    input.value = currloc.loc;
  },
  save: function() {
    var input = document.getElementById('path');
    var currloc = window.arguments[0];
    currloc.loc = input.value;
    return true;
  }
};
