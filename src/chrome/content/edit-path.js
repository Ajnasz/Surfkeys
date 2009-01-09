var EditPath = {
  init: function() {
    var input = document.getElementById('path');
    this.initPath = input.value;
    for(var i in window) {
      SKLog.log(i, window[i]);
      try {
        for(j in window[i]) {
          SKLog.log(j, window[i][j]);
        }
      } catch(e) {}
    }
  },
  save: function() {
    var input = document.getElementById('path');
    SKLog.log(input.value);
  }
};
