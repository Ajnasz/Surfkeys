var surfkeysPrefs = Components.classes["@mozilla.org/preferences-service;1"].
  getService(Components.interfaces.nsIPrefService);

surfkeysPrefs = surfkeysPrefs.getBranch("extensions.surfkeys.");

var generatePattern = function(patterns, selection, val) {
  if(!patterns) {
    patterns = false;
  }
  var sites = SKSites.getSitesArray(patterns);
  /*
  var _keys = new Array();
  for(key in keys) {
    keys[key].id = key;
    _keys.push(keys[key]);
  }
  */
  var treeView = {
    rowCount: sites.length+1,
    getCellText : function(row,column) {
      if(!sites[row] || !column) { return; }
      switch(column.id) {
        case 'siteidcol':
          return sites[row].id;
          break;

        case 'sitecol':
          return sites[row].site;
          break;

        case 'prevcol':
          return sites[row].prev;
          break;

        case 'nextcol':
          return sites[row].next;
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
  var tree = document.getElementById('sk-resultpattern-tree');
  tree.view = treeView;

  if(val) {
    var row = SKSites.getSiteRow(val);
    tree.view.selection.select(row);
  } else if(!isNaN(selection)) {
    tree.view.selection.select(selection);
  } else {
    tree.view.selection.select(0);
  }
};
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
      if(!_keys[row]) { return; }
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
  var tree = document.getElementById('sk-keys-tree');
  tree.view = treeView;
  if(!isNaN(selection)) {
    tree.view.selection.select(selection);
  } else {
    tree.view.selection.select(0);
  }
};
var keySelected = function() {
  var tree = document.getElementById("sk-keys-tree");
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
};
var setCurrentShift = function(val) {
  var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
  var tree = document.getElementById('sk-keys-tree');
  var currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
  keys[currentId].shift = val;
  generateKeys(keys, tree.currentIndex);
  setKeyPreferences(keys);
};
var setCurrentAlt = function(val) {
  var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
  var tree = document.getElementById('sk-keys-tree');
  var currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
  keys[currentId].alt = val;
  generateKeys(keys, tree.currentIndex);
  setKeyPreferences(keys);
};
var setCurrentDisabled = function(val) {
  var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
  var tree = document.getElementById('sk-keys-tree');
  var currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
  keys[currentId].disabled = val;
  generateKeys(keys, tree.currentIndex);
  setKeyPreferences(keys);
};
var setCurrentKey = function(val) {
  var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
  var tree = document.getElementById('sk-keys-tree');
  var currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
  keys[currentId].key = val;
  generateKeys(keys, tree.currentIndex);
  setKeyPreferences(keys);
};
var setKeyPreferences = function(keys) {
  var json = new Array();
  for(k in keys) {
    json.push(k + ': {key:\'' + keys[k].key + '\',shift:' + keys[k].shift + ',alt:' + keys[k].alt + ',disabled:' + keys[k].disabled + '}');
  }
  var json = '{' + json.join(',') + '}';
  surfkeysPrefs.setCharPref('keys', json);
};
var setAllWinKeys = function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator('navigator:browser'), win;
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(win.surfkeys_) {
        win.surfkeys = new win.surfkeys_(true);
      }
  }
};
/**
 * Extending SKSites object for preferences window
 */
SKSites.tree = function(){return document.getElementById('sk-resultpattern-tree')};
SKSites.siteSelected = function() {
  var tree = this.tree();
  this.selectedSite  = {
    id: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)),
    site: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(1)),
    next: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(2)),
    prev: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(3))
  }
  var currentId = document.getElementById('sk-site-id');
  var currentSite = document.getElementById('sk-site-name');
  var currentNext = document.getElementById('sk-site-next');
  var currentPrev = document.getElementById('sk-site-prev');
  currentSite.value = this.selectedSite.site;
  currentNext.value = this.selectedSite.next;
  currentPrev.value = this.selectedSite.prev;
};
SKSites.setCurrentSite = function(val) {
  this.siteSetCurrent('site', val);
};
SKSites.setCurrentNext = function(val) {
  this.siteSetCurrent('next', val);
};
SKSites.setCurrentPrev = function(val) {
  this.siteSetCurrent('prev', val);
};
SKSites.siteSetCurrent = function(field, val) {
  var tree = this.tree();
  var currentSite = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
  var site = SKSites.getSiteFromID(currentSite);
  if(!site) {
    site = {
      site: '',
      next: '',
      prev: '',
      id: false
    }
  }
  site[field] = val;
  if(site.site == '') {
    SKSites.removeSite(site.id);
  } else {
    SKSites.addSite(site);
  }
  generatePattern(null, tree.currentIndex);
};
SKSites.getSiteRow = function(site) {
  var tree = this.tree();
  var column = tree.columns.getColumnAt(0);
  for (var i = 0; i < tree.view.rowCount; i++){
    if(tree.view.getCellText(i, column) == site) {
      return i;
    }
  }
  return 0;
};
/*
SKSites.addSite = function() {
  var tree = this.tree();
  tree.view.selection.select(tree.view.rowCount-1);
  document.getElementById('sk-site-name').focus();
};
*/

var initPreferences = function() {
  generateKeys();
  generatePattern();
}
