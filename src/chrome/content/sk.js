SK = {};
SK.Prefs = function() {
  return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.surfkeys.");
}
SK.Sites = {
  /**
   * @param {String} site the url or regexp for a site
   * @param {String,Null} next pattern for the "next" link
   * @param {String,Null} next pattern for the "prev" link
   */
  createSiteStr: function(site, next, prev, lastid) {
    if(!lastid) {
      var lastid = SK.Prefs().getIntPref('lastsiteid');
      lastid++;
    }
    SK.Prefs().setIntPref('lastsiteid', lastid);
    return '{"id":"' + lastid + '","site":"' + site + '","next":"' + next + '","prev":"' + prev + '"}';
  },
  getSites: function(patterns) {
    if(!patterns) {
      patterns = SK.Prefs().getCharPref("resultpattern");
    }
    try {
      patterns = eval('(' + patterns + ')');
    } catch(e) {
      patterns = [];
    }
    return patterns;
  },
  /**
   * @param {Integer} id the id of the site
   * @return a site object
   * @type Object
   */
  getSiteFromID: function(id) {
    var sites = this.getSites();
    for(var i = 0, sl = sites.length; i < sl; i++) {
      if(sites[i].id == id) {
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
  getSiteFromURL: function(url) {
    var sites = this.getSites();
    for(var i = 0, sl = sites.length; i < sl; i++) {
      if(sites[i].site == url) {
        return sites[i];
      }
    }
    return false;
  },
  addSiteToArray: function(site) {
    var sites = this.getSites(), overwrited;
    for(var i = 0, sl = sites.length; i < sl; i++) {
      if(sites[i].id == site.id) {
        sites[i] = site;
        overwrited = true;
        break;
      }
    }
    if(!overwrited) {
      sites.push(site);
    }
    return sites;
  },
  sitesToString: function(sites) {
    var str = new Array();
    for(var i = 0, sl = sites.length; i < sl; i++) {
      str.push(this.createSiteStr(sites[i].site, sites[i].next, sites[i].prev, sites[i].id));
    }
    return  '[' + str.join(',') + ']';
  },
  /**
   * @param Object site a site object {site: foo, next: bar, prev: baz, [id:foobar]}
   */
  addSite: function(site) {
    var sites = this.addSiteToArray(site);
    this.setSites(this.sitesToString(sites));
  },
  removeSite: function(id) {
    var sites = this.getSites();
    for(var i = 0, sl = sites.length; i < sl; i++) {
      if(sites[i].id == id) {
        sites.splice(i, 1);
        break;
      }
    }
    this.setSites(this.sitesToString(sites));
  },
  /**
  * @param {String} sites string sites
  */
  setSites: function(sites) {
    SK.Prefs().setCharPref('resultpattern', sites);
  },
  logSelected: function() {
    SKLog.log(this.selectedSite.site);
  }
};
SK.Keys = {
  getKeys: function(keys) {
    if(!keys) {
      keys = SK.Prefs().getCharPref("keys");
    }
    try {
      keys = eval('(' + keys + ')');
    } catch(e) {
      keys = {};
    }
    return keys;
  },
  setKeys: function(keys) {
    if(typeof keys != 'string') {
      keys = this.keysToString(keys);
    }
    SK.Prefs().setCharPref('keys', keys);
  },
  createKeyStr: function(id, key, shift, alt, disabled) {
    return '' + id + ': {key:"' + key + '",shift:' + shift + ',alt:' + alt + ',disabled:' + disabled + '}';
  },
  keysToString: function(keys) {
    var str = new Array();
    for(k in keys) {
    SKLog.log(k, keys[k].key);
      str.push(SK.Keys.createKeyStr(k, keys[k].key, keys[k].shift, keys[k].alt, keys[k].disabled));
    }
    return  '{' + str.join(',') + '}';
  }
};
