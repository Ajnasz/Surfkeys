SKSites = {
  surfkeysPrefs: function() {
    return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.surfkeys.");
  },
  /**
   * @param {String} site the url or regexp for a site
   * @param {String,Null} next pattern for the "next" link
   * @param {String,Null} next pattern for the "prev" link
   */
  createSiteStr: function(site, next, prev, lastid) {
    if(!lastid) {
      var lastid = this.surfkeysPrefs().getIntPref('lastsiteid');
      lastid++;
    }
    this.surfkeysPrefs().setIntPref('lastsiteid', lastid);
    return '{"id":"' + lastid + '","site":"' + site + '","next":"' + next + '","prev":"' + prev + '"}';
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
  getSitesArray: function(pattern) {
    pattern = this.getSites(pattern);
    var sites = new Array();
    for(site in pattern) {
      sites.push(pattern[site]);
    }
    return sites;
  },
  getSites: function(patterns) {
    if(!patterns) {
      patterns = this.surfkeysPrefs().getCharPref("resultpattern");
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
    this.setSitePreferences(this.sitesToString(sites));
  },
  removeSite: function(id) {
    var sites = this.getSites();
    for(var i = 0, sl = sites.length; i < sl; i++) {
      if(sites[i].id == id) {
        sites.splice(i, 1);
        break;
      }
    }
    this.setSitePreferences(this.sitesToString(sites));
  },
  /**
  * @param {String} sites string sites
  */
  setSitePreferences: function(sites) {
    this.surfkeysPrefs().setCharPref('resultpattern', sites);
  },
  logSelected: function() {
    SKLog.log(this.selectedSite.site);
  }
};
