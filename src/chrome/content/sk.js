/*jslint indent: 2*/
/*global Components: true, alert: true, SKLog: true */
/**
 * @module SK
 */
var SK = {};
/**
 * Method to access to the preferences of the surfkeys
 * @namespace SK
 * @method Prefs
 */
SK.Prefs = function () {
  return Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService).getBranch("extensions.surfkeys.");
};
/**
 * Method to access to the default preferences of the surfkeys
 * @namespace SK
 * @method Prefs
 */
SK.DefaultPrefs = function () {
  return Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService).getDefaultBranch("extensions.surfkeys.");
};
/**
 * @namespace SK
 */
SK.Sites = {
  /**
   * @namespace SK.Sites
   * @method createSiteStr
   * @param {String} site the url or regexp for a site
   * @param {String,Null} [next] pattern for the "next" link
   * @param {String,Null} pnextrev pattern for the "prev" link
   * @param {} lastid
   * @type String
   */
  createSiteStr: function (site, next, prev, lastid) {
    if (!lastid) {
      lastid = SK.Prefs().getIntPref('lastsiteid');
      lastid += 1;
    }
    SK.Prefs().setIntPref('lastsiteid', lastid);
    return '{"id":"' + lastid + '","site":"' + site +
      '","next":"' + next + '","prev":"' + prev + '"}';
  },
  createSite: function (site, next, prev, lastid) {
    if (!lastid) {
      lastid = SK.Prefs().getIntPref('lastsiteid');
      lastid += 1;
    }
    SK.Prefs().setIntPref('lastsiteid', lastid);
    return {
      id: lastid,
      site: site,
      next: next,
      prev: prev
    };
  },
  /**
   * Generate javascript object from a JSON string
   * @param {String} [patterns]
   * @return a the javascript object which generated from the pattern
   * @type Array
   */
  getSites: function (patternsStr) {
    if (!patternsStr) {
      patternsStr = SK.Prefs().getCharPref('resultpattern');
    }
    if (patternsStr.indexOf('%5') === 0) {
      patternsStr = decodeURIComponent(patternsStr);
    }
    var patterns, sandbox;
    try {
      patterns = JSON.parse(patternsStr);
    } catch (e) {
      try {
        sandbox = Components.utils.Sandbox('http://surfkeys.mozdev.org/');
        patterns = Components.utils.evalInSandbox('(' + patternsStr + ')', sandbox);
      } catch (er) {
        patterns = [];
      }
    }
    return patterns;
  },
  /**
   * @param {Integer} id the id of the site
   * @return a site object
   * @type Object
   */
  getSiteFromID: function (id) {
    var sites = this.getSites(), i, sl;
    for (i = 0, sl = sites.length; i < sl; i += 1) {
      if (parseInt(sites[i].id, 10) === parseInt(id, 10)) {
        return sites[i];
      }
    }
    return false;
  },
  /**
   * @param {String} url the url of the site which shuld match
   * @return a site object
   * @type Object
   */
  getSiteFromURL: function (url) {
    var sites = this.getSites(), i, sl;
    for (i = 0, sl = sites.length; i < sl; i += 1) {
      if (sites[i].site === url) {
        return sites[i];
      }
    }
    return false;
  },
  addSiteToArray: function (site) {
    var sites = this.getSites(),
      overwritten = false,
      i, sl;
    for (i = 0, sl = sites.length; i < sl; i += 1) {
      if (parseInt(sites[i].id, 10) === parseInt(site.id, 10)) {
        sites[i] = site;
        overwritten = true;
        break;
      }
    }
    if (!overwritten) {
      sites.push(site);
    }
    return sites;
  },
  /**
   * converts all the sites object to string
   * @param {Array} sites
   * @returns the sites as a string to make possible to stor them
   * @type String
   */
  sitesToString: function (sites) {
    var str = [], i, sl;
    for (i = 0, sl = sites.length; i < sl; i += 1) {
      str.push(this.createSiteStr(sites[i].site, sites[i].next, sites[i].prev, sites[i].id));
    }
    return '[' + str.join(',') + ']';
  },
  /**
   * @param Object site A site object {site: foo, next: bar, prev: baz, [id:foobar]}
   */
  addSite: function (site) {
    var sites = this.addSiteToArray(site);
    this.setSites(sites);
  },
  removeSite: function (id) {
    /**
     * @private
     */
    var sites = this.getSites(), i, sl;
    for (i = 0, sl = sites.length; i < sl; i += 1) {
      if (sites[i].id === id) {
        sites.splice(i, 1);
        break;
      }
    }
    this.setSites(sites);
  },
  /**
   * Update the site preference
   * @param {String} sites string sites
   */
  setSites: function (sites) {
    // sites = this.sitesToString(sites);
    SK.Prefs().setCharPref('resultpattern', JSON.stringify(sites));
  },
  logSelected: function () {
    SKLog.log('logselected: ', this.selectedSite.site);
  }
};
SK.Keys = {
  getKeys: function (keysStr) {
    if (!keysStr) {
      keysStr = SK.Prefs().getCharPref("keys");
    }
    var defaults, sandbox, i, parsed, keys;
    try {
      keys = JSON.parse(keysStr);
    } catch (e) {
      try {
        sandbox = Components.utils.Sandbox('http://surfkeys.mozdev.org/');
        keys = Components.utils.evalInSandbox('(' + keysStr + ')', sandbox);
      } catch (e1) {
        keys = {};
      }
    }
    try {
      defaults = JSON.parse(SK.DefaultPrefs().getCharPref('keys'));
    } catch (er) {
      try {
        sandbox = Components.utils.Sandbox('http://surfkeys.mozdev.org/');
      } catch (err) {
        keys = Components.utils.evalInSandbox('(' + defaults + ')', sandbox);
        defaults = {};
      }
    }
    for (i in defaults) {
      if (typeof keys[i] === 'undefined') {
        keys[i] = defaults[i];
      }
    }
    return keys;
  },
  setKeys: function (keys) {
    if (typeof keys !== 'string') {
      //keys = this.keysToString(keys);
      keys = JSON.stringify(keys);
    }
    SK.Prefs().setCharPref('keys', keys);
  },
  /**
   * @param {String} id The ID of the hotkey
   * @param {String} key The key of the hotkey
   * @param {Boolean} shift Shift modifier on/off
   * @param {Boolean} alt Alt modifier on/off
   * @param {Boolean} control Control modifier on/off
   * @param {Boolean} disabled Enabled/disabled hotkey
   * @type String
   */
  createKeyStr: function (id, key, shift, alt, control, disabled) {
    return id + ':{key:"' + key + '",shift:' + shift + ',alt:' + alt +
         ',control:' + control + ',disabled:' + disabled + '}';
  },
  /**
   * @param {Object} keys JS object
   * @type String
   */
  keysToString: function (keys) {
    var str = [], k;
    for (k in keys) {
      if (keys.hasOwnProperty(k)) {
        str.push(SK.Keys.createKeyStr(k, keys[k].key, keys[k].shift,
          keys[k].alt, keys[k].control, keys[k].disabled));
      }
    }
    return '{' + str.join(',') + '}';
  },
  /**
   * Check for items, which are the same in the paramter object
   * @param {Object} keys
   * @return true if the keys contains conflicting items
   * @type Boolean
   */
  isConflict: function (keys) {
    var o = {}, i, j;
    for (i in keys) {
      if (keys.hasOwnProperty(i)) {
        for (j in o) {
          if (o.hasOwnProperty(j)) {
            if (j !== i && keys[i].key === o[j].key && keys[i].alt === o[j].alt &&
            keys[i].shift === o[j].shift && keys[i].disabled === o[j].disabled) {
              return true;
            }
          }
        }
        o[i] = keys[i];
      }
    }
    return false;
  }
};
