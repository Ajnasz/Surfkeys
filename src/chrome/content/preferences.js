/**
 * generates the rows to the tree on the site matching tab
 * @param {Object} [patterns]
 * @param {Integer} [selection]
 * @param {String} [val]
 */
var generatePattern = function(patterns, selection, val) {
  if(!patterns) {
    patterns = false;
  }
  var sites = SK.Sites.getSites(patterns),
  treeView = {
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
  var tree = SK.Sites.tree();
  tree.view = treeView;

  if(val) {
    tree.view.selection.select(SK.Sites.getSiteRow(val));
  } else if(!isNaN(selection)) {
    tree.view.selection.select(selection);
  } else {
    tree.view.selection.select(0);
  }
};
/**
 * generates the rows to the tree on the key configuration tab
 * @param {Object} [keys]
 * @param {Integer} [selection]
 */
var generateKeys = function(keys, selection) {
  if(!keys) {
    var keys = SK.Keys.getKeys(keys);
  }
  var _keys = new Array();
  for(key in keys) {
    keys[key].id = key;
    _keys.push(keys[key]);
  }
  var treeView = {
    rowCount: _keys.length,
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
          return _keys[row].key.toUpperCase();
          break;
      };
    },
    getCellValue: function(row, column) {
      if(!_keys[row]) { return; }
      var bundle = document.getElementById('surfkeys-bundles');
      switch(column.id) {
        case 'shiftcol':
          return _keys[row].shift || false;
          break;

        case 'altcol':
          return _keys[row].alt || false;
          break;

        case 'controlcol':
          return _keys[row].control || false;
          break;

        case 'metacol':
          return _keys[row].meta || false;
          break;

        case 'disabledcol':
          return _keys[row].disabled || false;
          break;
      };
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
  var tree = SK.Keys.tree();
  tree.view = treeView;
  if(!isNaN(selection)) {
    tree.view.selection.select(selection);
  } else {
    tree.view.selection.select(0);
  }
};
/**
 * creates surfkeys instance for all window
 * @method setAllWinKeys
 */
var setAllWinKeys = function() {
  /**
   * @private
   */
  var enumerator = Components.classes["@mozilla.org/appshell/window-mediator;1"].
                    getService(Components.interfaces.nsIWindowMediator).
                    getEnumerator('navigator:browser'),
  /**
   * variable to store the window objects
   * @private
   */
  win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(win.surfkeys_) {
      win.surfkeys = new win.surfkeys_(true);
    }
  }
};
SK.Keys.tree =  function() {return document.getElementById('sk-keys-tree');};
/**
 * runs when select a row in a tree
 */
SK.Keys.keySelected = function() {
  /**
   * tree object
   * @private
   */
  var tree = SK.Keys.tree(),
  /**
   * the properties of the currently selected command
   * @private
   */
  selectedKey  = {
    id: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)),
    name: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(1)),
    key: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(2)),
    shift: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(3)),
    alt: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(4)),
    control: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(5)),
    meta: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(6)),
    disabled: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(7))
  },
  /**
   * input field where the key combo is displayed
   * @param
   */
  currentKey = document.getElementById('current-key'),
  /**
   * the disabler checkbox
   * @param
   */
  currentDisabled = document.getElementById('current-disabled'),
  /**
   * an array to store the active modifiers
   * @param
   */
  modifiers = new Array();
  if(selectedKey.shift == 'true') {
    modifiers.push('SHIFT');
  }
  if(selectedKey.alt == 'true') {
    modifiers.push('ALT');
  }
  if(selectedKey.control == 'true') {
    modifiers.push('CTRL');
  }
  if(selectedKey.meta == 'true') {
    modifiers.push('META');
  }

  currentKey.value = '';
  if(modifiers.length) currentKey.value += modifiers.join(' + ') + ' + ';
  currentKey.value += selectedKey.key.toUpperCase();
  currentDisabled.checked = (selectedKey.disabled == 'false') ? false : true;
};
/**
 * Sets the the current key value
 * @namespace SK.Keys
 * @method setCurrentKey
 * @param {String} val the letter of the current key
 */
SK.Keys.setCurrentKey = function(val) {
  /**
   * all of the keys
   * @private
   */
  var keys = this.getKeys(),
  /**
   * tree object
   * @private
   */
  tree = this.tree(),
  /**
   * The id of the selected key
   * @private
   */
  currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)),
  keys[currentId].key = val;
  if(SK.Keys.isConflict(keys)) {
    alert('key already used');
    tree.view.selection.clearSelection();
    tree.view.selection.select(tree.currentIndex);
    return;
  }
  generateKeys(keys, tree.currentIndex);
  this.setKeys(keys);
};
/**
 * Changes the disable state of the currently selected key
 * @namespace SK.Keys
 * @method setCurrentDisabled
 * @param {Boolean} val
 */
SK.Keys.setCurrentDisabled = function(val) {
  /**
   * all of the keys
   * @private
   */
  var keys = this.getKeys(),
  /**
   * tree object
   * @private
   */
  tree = this.tree(),
  /**
   * The id of the selected key
   * @private
   */
  currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)),

  keys[currentId].disabled = val;
  if(SK.Keys.isConflict(keys)) {
    alert('key already used');
    tree.view.selection.clearSelection();
    tree.view.selection.select(tree.currentIndex);
    return;
  }
  generateKeys(keys, tree.currentIndex);
  this.setKeys(keys);
};
/**
 * Updates all value of the current key
 * @namespace SK.Keys
 * @method setCurrent
 * @param {Object} obj
 */
SK.Keys.setCurrent = function(obj) {
  /**
   * All of the keys
   * @private
   */
  var keys = this.getKeys(),
  /**
   * tree object
   * @private
   */
  tree = this.tree(),
  /**
   * The id of the selected key row
   * @private
   */
  currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
  keys[currentId].key = obj.key;
  keys[currentId].shift = obj.shift;
  keys[currentId].alt = obj.alt;
  keys[currentId].control = obj.control;
  keys[currentId].meta = obj.meta;
  if(SK.Keys.isConflict(keys)) {
    alert('key config already used');
    tree.view.selection.clearSelection();
    tree.view.selection.select(tree.currentIndex);
  } else {
    generateKeys(keys, tree.currentIndex);
    this.setKeys(keys);
  }
};
/**
 * Grabs pressed key combo and set to it the current command
 * @namespace Sk.Keys
 * @method grabKey
 * @param {Event} event A keypress event
 */
SK.Keys.grabKey = function(event) {
  event.preventDefault();
  event.stopPropagation();
  /**
   * The target element of the event
   * @private
   */
  var element = event.originalTarget,
  /**
   * An array to store wich modifiers are set
   * @private
   */
  modifiers = new Array(),
  /**
   * A key object
   * @private
   */
  keys = {
    key: null, shift: false, alt: false, control: false, meta: false
  }
  if(event.charCode) {
    var key = String.fromCharCode(event.charCode).toUpperCase();
    keys.key =  key;
  } else {
    return;
  }
  if(event.shiftKey) {
    modifiers.push('Shift');
    keys.shift = true;
  };
  if(event.altKey) {
    modifiers.push('Alt');
    keys.alt = true;
  }
  if(event.ctrlKey) {
    modifiers.push('Ctrl');
    keys.control = true;
  }
  if(event.metaKey) {
    modifiers.push("meta");
    keys.meta = true;
  }
  element.value = modifiers.length ? modifiers.join(' + ') + ' + ' : '';
  element.value += key.toUpperCase();
  SK.Keys.setCurrent(keys);
  return false;
};
/**
 * Extending SK.Sites object for preferences window
 */
SK.Sites.tree = function(){return document.getElementById('sk-resultpattern-tree')};
SK.Sites.siteSelected = function() {
  var tree = this.tree();
  this.selectedSite  = {
    id: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)),
    site: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(1)),
    next: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(2)),
    prev: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(3))
  };
  var currentId = document.getElementById('sk-site-id');
  var currentSite = document.getElementById('sk-site-name');
  var currentNext = document.getElementById('sk-site-next');
  var currentPrev = document.getElementById('sk-site-prev');
  currentSite.value = this.selectedSite.site;
  currentNext.value = this.selectedSite.next;
  currentPrev.value = this.selectedSite.prev;
};
/**
 * Sets the current value for the site
 * @param {String} val The url what should be the current site
 */
SK.Sites.setCurrentSite = function(val) {
  this.siteSetCurrent('site', val);
};
/**
 * Sets the current value of the next property
 * @param {String} val the inner text of the next link
 */
SK.Sites.setCurrentNext = function(val) {
  this.siteSetCurrent('next', val);
};
/**
 * Sets the current value of the previous property
 * @param {String} val the inner text of the previous link
 */
SK.Sites.setCurrentPrev = function(val) {
  this.siteSetCurrent('prev', val);
};
/**
 * Sets the value for a specified field
 * @param {String} field The field name what should be changed
 * @param {String} value The new value
 */
SK.Sites.siteSetCurrent = function(field, val) {
  /**
   * tree object
   * @private
   */
  var tree = this.tree(),
  /**
   * current site id
   * @private
   */
  currentSite = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)),
  /**
   * The current site object
   * @private
   */
  site = SK.Sites.getSiteFromID(currentSite) || {site:'',next:'',prev:'',id:false};
  if(['site', 'next', 'prev', 'id'].indexOf(field) != -1) {
    site[field] = val;
    if(site.site == '') {
      SK.Sites.removeSite(site.id);
    } else {
      SK.Sites.addSite(site);
    }
    generatePattern(null, tree.currentIndex);
  }
};
/**
 * Adds row to the tree
 */
SK.Sites.addSiteRow = function() {
  generatePattern();
  var tree = this.tree();
  tree.view.selection.select(tree.view.rowCount - 1);
};
/**
 * Deletes a row from the tree
 */
SK.Sites.delSiteRow = function() {
  this.setCurrentSite('');
};
/**
 * @param {String} site
 */
SK.Sites.getSiteRow = function(site) {
  /**
   * tree object
   * @private
   */
  var tree = this.tree(),
  /**
   * first column of the tree object
   * @private
   */
  column = tree.columns.getColumnAt(0);
  for (var i = 0; i < tree.view.rowCount; i++){
    if(tree.view.getCellText(i, column) == site) {
      return i;
    }
  }
  return 0;
};
/**
 * intialize the the values for the preference window
 */
var initPreferences = function() {
  generateKeys();
  generatePattern();
  document.getElementById('current-key').addEventListener('keypress', SK.Keys.grabKey, true);
};
