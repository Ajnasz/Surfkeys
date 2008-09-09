var surfkeysPrefs = Components.classes["@mozilla.org/preferences-service;1"].
  getService(Components.interfaces.nsIPrefService);

surfkeysPrefs = surfkeysPrefs.getBranch("extensions.surfkeys.");

var generateKeys = function(keys, selection) {
  if(!keys) {
    var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
  }
  var _keys = new Array();
  for(key in keys) {
    keys[key].id = key;
    _keys.push(keys[key]);
  }
  var treeView = {
    rowCount: 27,
    getCellText : function(row,column) {
      var bundle = document.getElementById('surfkeys-bundles');
      switch(column.id) {
        case 'idcol':
          return _keys[row].id;
          break;

        case 'namecol':
          return bundle.getString(_keys[row].id);
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

        case 'disabledcol':
          return _keys[row].disabled;
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
  var tree = document.getElementById('surfkeys-tree');
  tree.view = treeView;
  if(!isNaN(selection)) {
    tree.view.selection.select(selection);
  } else {
    tree.view.selection.select(0);
  }
};
var keySelected = function() {
  var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
  var tree = document.getElementById("surfkeys-tree");
  var selectedKey  = {
      id: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)),
      name: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(1)),
      key: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(2)),
      shift: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(3)),
      alt: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(4)),
      disabled: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(5))
    }
    var currentKey = document.getElementById('current-key');
    var currentShift = document.getElementById('current-shift');
    var currentAlt = document.getElementById('current-alt');
    var currentDisabled = document.getElementById('current-disabled');
    currentKey.value = selectedKey.key;
    currentShift.checked = (selectedKey.shift == 'false') ? false : true;
    currentAlt.checked = (selectedKey.alt == 'false') ? false : true;
    currentDisabled.checked = (selectedKey.disabled == 'false') ? false : true;
  }
  var setCurrentShift = function(val) {
    var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
    var tree = document.getElementById('surfkeys-tree');
    var currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
    keys[currentId].shift = val;
    generateKeys(keys, tree.currentIndex);
    setKeyPreferences(keys);
  }
  var setCurrentAlt = function(val) {
    var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
    var tree = document.getElementById('surfkeys-tree');
    var currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
    keys[currentId].alt = val;
    generateKeys(keys, tree.currentIndex);
    setKeyPreferences(keys);
  }
  var setCurrentDisabled = function(val) {
    var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
    var tree = document.getElementById('surfkeys-tree');
    var currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
    keys[currentId].disabled = val;
    generateKeys(keys, tree.currentIndex);
    setKeyPreferences(keys);
  }
  var setCurrentKey = function(val) {
    var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
    var tree = document.getElementById('surfkeys-tree');
    var currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
    keys[currentId].key = val;
    generateKeys(keys, tree.currentIndex);
    setKeyPreferences(keys);
  }
  var setKeyPreferences = function(keys) {
    var json = new Array();
    for(k in keys) {
      json.push(k + ': {key:\'' + keys[k].key + '\',shift:' + keys[k].shift + ',alt:' + keys[k].alt + ',disabled:' + keys[k].disabled + '}');
    }
    var json = '{' + json.join(',') + '}';
    surfkeysPrefs.setCharPref('keys', json);
  }
  setAllWinKeys = function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator('navigator:browser'), win;
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(win.surfkeys_) {
        win.surfkeys = new win.surfkeys_(true);
      }
  }
};
