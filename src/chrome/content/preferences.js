var surfkeysPrefs = Components.classes["@mozilla.org/preferences-service;1"].
  getService(Components.interfaces.nsIPrefService);

surfkeysPrefs = surfkeysPrefs.getBranch("extensions.surfkeys.");

var generateKeys = function() {
  var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
  var _keys = new Array();
  for(key in keys) {
    keys[key].id = key;
    _keys.push(keys[key]);
  }
  var treeView = {
    rowCount: 23,
    getCellText : function(row,column) {
      switch(column.id) {
        case 'idcol':
          return _keys[row].id;
          break;

        case 'keycol':
          return _keys[row].key;
          break;

        case 'shiftcol':
          return _keys[row].shift;
          break;

        case 'altcol':
          return _keys[row].alt;
          break;
      }
    },
    setTree: function(treebox){ this.treebox = treebox; },
    isContainer: function(row){ return false; },
    isSeparator: function(row){ return false; },
    isSorted: function(){ return false; },
    getLevel: function(row){ return 0; },
    getImageSrc: function(row,col){ return null; },
    getRowProperties: function(row,props){},
    getCellProperties: function(row,col,props){},
    getColumnProperties: function(colid,col,props){}
  };
  document.getElementById('surfkeys-tree').view = treeView;
};
