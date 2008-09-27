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
SKSites = {
  tree: function(){return document.getElementById('sk-resultpattern-tree')},
  siteSelected: function() {
    var tree = this.tree();
    this.selectedSite  = {
      site: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)),
      next: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(1)),
      prev: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(2))
    }
    var currentSite = document.getElementById('sk-site-name');
    var currentNext = document.getElementById('sk-site-next');
    var currentPrev = document.getElementById('sk-site-prev');
    currentSite.value = this.selectedSite.site;
    currentNext.value = this.selectedSite.next;
    currentPrev.value = this.selectedSite.prev;
  },
  siteStringFromObj: function(obj) {
    var sites = new Array(),next,prev;
    for(site in obj) {
      next = obj[site].next || '';
      prev = obj[site].prev || '';
      sites.push('"' + site + '":{"site":"' + site + '","next":"' + next + '","prev":"' + prev + '"}');
    }
    return '{' + sites.join(',') + '}';
  },
  setSitePreferencesFromObject: function(sites) {
    surfkeysPrefs.setCharPref('resultpattern', this.siteStringFromObj(sites));
  },
  getSitesArray: function(pattern) {
    pattern = this.getPatterns(pattern);
    var sites = new Array();
    for(site in pattern) {
      sites.push(pattern[site]);
    }
    return sites;
  },
  getPatterns: function(patterns) {
    if(!patterns) {
      patterns = surfkeysPrefs.getCharPref("resultpattern");
    }
    SKLog.log(patterns);
    try {
      patterns = eval('(' + patterns + ')');
      SKLog.log('eval done');
    } catch(e) {
      patterns = {};
      SKLog.log('eval failed');
    }
    return patterns;
  },
  setCurrentSite: function(val) {
    var sites = this.getPatterns();
    SKLog.log(this.siteStringFromObj(sites));
    var tree = this.tree();
    var currentSite = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
    if(val == '') {
      delete sites[this.selectedSite.site];
      var sites = this.siteStringFromObj(sites)
      this.setSitePreferences(sites);
      generatePattern(sites, tree.currentIndex, val);
      return;
    }
    if(sites[this.selectedSite.site]) {
      sites[val] = sites[this.selectedSite.site];
      delete sites[this.selectedSite.site];
    } else {
      sites[val] = {
        next: '',
        prev: '',
        site: val
      };
    }
    sites[val].site = val;
    var sites = this.siteStringFromObj(sites)
    this.setSitePreferences(sites);
    generatePattern(sites, tree.currentIndex, val);
  },
  setCurrentNext: function(val) {
    var sites = this.getPatterns();
    var tree = this.tree();
    var currentSite = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
    sites[currentSite].next = val;
    var sites = this.siteStringFromObj(sites)
    this.setSitePreferences(sites);
    generatePattern(sites, tree.currentIndex);
  },
  setCurrentPrev: function(val) {
    var sites = this.getPatterns();
    var tree = this.tree();
    var currentSite = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
    sites[currentSite].prev = val;
    var sites = this.siteStringFromObj(sites)
    this.setSitePreferences(sites);
    generatePattern(sites, tree.currentIndex);
  },
  getSiteRow: function(site) {
    var tree = this.tree();
    var column = tree.columns.getColumnAt(0);
    for (var i = 0; i < tree.view.rowCount; i++){
      if(tree.view.getCellText(i, column) == site) {
        return i;
      }
    }
    return 0;
  },
  addSite: function() {
    var tree = this.tree();
    tree.view.selection.select(tree.view.rowCount-1);
    document.getElementById('sk-site-name').focus();
  },
  /**
  * @param {String} sites string sites
  */
   setSitePreferences: function(sites) {
    surfkeysPrefs.setCharPref('resultpattern', sites);
  },
  logSelected: function() {
    SKLog.log(this.selectedSite.site);
  }
};
var initPreferences = function() {
  generateKeys();
  generatePattern();
}
