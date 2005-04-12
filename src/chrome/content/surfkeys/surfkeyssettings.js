/**
 *
 * Mozilla Public License Notice
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1  (the "License"); you may  not use this  file except in
 * compliance with the  License. You may obtain a  copy of the License
 * at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the  License  for  the   specific  language  governing  rights  and
 * limitations under the License.
 *
 * The  Original Code and  Idea is  the SurfKeys  Mozilla extension.
 * The Initial  Developer of the Original  Code is Pekka
 * P. Sillanpaa.  Portions created  by Initial Developer are Copyright
 * (C) 2004.  All Rights Reserved.
 *
 * Contributor(s): Pekka Sillanpaa, Paul Stone
 *
 */


////////////////////////////////////////////////////////////////////////////////
// settings dialog code
////////////////////////////////////////////////////////////////////////////////

var surfkeysSettings =
{
  init: function() {
    var elem; 
    var prefVal;
    var pref;
    
    for (i in SURFKEYS_PREFS)  {
      pref = SURFKEYS_PREFS[i];
      elem = document.getElementById(pref.name);
      prefVal = surfkeysPrefs.get(pref);
      switch (elem.nodeName) {
        case 'textbox':
          elem.value = prefVal;
          break;
        case 'checkbox':
          elem.checked = prefVal;
          break;
        case 'radio':
          if (prefVal) elem.radioGroup.selectedItem = elem;
      }
    }
  },


  doOK: function() {
    var value;
    var elem;
    var pref;
    
    for (i in SURFKEYS_PREFS) {
      pref = SURFKEYS_PREFS[i];
      elem = document.getElementById(pref.name);
      switch (elem.nodeName) {
        case 'textbox':
          value = elem.value;
          break;
        case 'checkbox':
          value = elem.checked;
          break;
        case 'radio':
          value = elem.selected;
      }
      surfkeysPrefs.set(pref, value);
    }
    return true;
  },

  doCancel: function() {
    return true;
  }
}


////////////////////////////////////////////////////////////////////////////////
// preference setter/getter code
////////////////////////////////////////////////////////////////////////////////

function SurfkeysPref(name, type, value) {
  this.name = name;
  this.type = type;
  this.defaultValue = value;
}

var SURFKEYS_BOOL = 1;
var SURFKEYS_INT = 2;
var SURFKEYS_STRING = 3;
var SURFKEYS_PREFS = {
  ENABLED:           new SurfkeysPref('enabled',               SURFKEYS_BOOL,   true),
  RESULTLINKS:       new SurfkeysPref('results.patterns',         SURFKEYS_STRING, 'google.com:Next:Previous;google.fi:Seuraava:Edellinen;www.helsinginsanomat.fi/viivijawagner:SEURAAVA:EDELLINEN')
};

var surfkeysPrefs = 
{
  nsIPrefs: null,
  
  getPreferences: function() {
    if (surfkeysPrefs.nsIPrefs == null) {
      var PREFID = '@mozilla.org/preferences;1';
      var nsIPrefBranch = Components.interfaces.nsIPrefBranch;
      surfkeysPrefs.nsIPrefs = Components.classes[PREFID].getService(nsIPrefBranch);
    }
    return surfkeysPrefs.nsIPrefs;
  },

  set: function(surfkeysPref, prefVal) {
    var prefs = surfkeysPrefs.getPreferences();
    prefString = "extensions.surfkeys." + surfkeysPref.name;
    
    switch (surfkeysPref.type) {
      case SURFKEYS_BOOL:
        prefs.setBoolPref(prefString, prefVal);
        break;
      case SURFKEYS_INT:
        prefs.setIntPref(prefString, prefVal);
        break;
      case SURFKEYS_STRING:
        prefs.setCharPref(prefString, prefVal);
        break;
    }       
  },

  get: function(surfkeysPref) {
    var prefs = surfkeysPrefs.getPreferences();
    prefString = "extensions.surfkeys." + surfkeysPref.name;
    
    switch (surfkeysPref.type) {
      case SURFKEYS_BOOL:
        return prefs.getBoolPref(prefString);
        break;
      case SURFKEYS_INT:
        return prefs.getIntPref(prefString);
        break;
      case SURFKEYS_STRING:
        return prefs.getCharPref(prefString);
        break;
    }
    return null;
  },

  setDefaultPreferences: function() {
    var prefs = surfkeysPrefs.getPreferences();
    var name;
    var defaultPref;

    for (i in SURFKEYS_PREFS) {
      defaultPref = SURFKEYS_PREFS[i];
      name = "extensions.surfkeys." + defaultPref.name;
      if (!prefs.prefHasUserValue(name)) {
        switch (defaultPref.type) {
          case SURFKEYS_BOOL:
            prefs.setBoolPref(name, defaultPref.defaultValue);
            break;
          case SURFKEYS_INT:
            prefs.setIntPref(name, defaultPref.defaultValue);
            break;
          case SURFKEYS_STRING:
            prefs.setCharPref(name, defaultPref.defaultValue);
        }
      }
    }
  }
}
