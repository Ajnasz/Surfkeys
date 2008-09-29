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
 * The Initial  Developer of the Original  Code and the  Idea is Pekka
 * P. Sillanpaa.  Portions created  by Initial Developer are Copyright
 * (C) 2004.  All Rights Reserved.
 *
 * Contributor(s): Pekka Sillanpaa
 *
 * Changelog:
 *
 * 0.1 Intitial version
 *
 */


////////////////////////////////////////////////////////////////////////////////
// Surf Keys
////////////////////////////////////////////////////////////////////////////////

function surfkeys_(reload) {

  //var modified_flag = false;
  var sk_isFirstTime = true;
  var surfScroll = false;
  var SK_X = 0;
  var SK_Y = 1;
  var scrDelta = Array(2);
  var scrAccel = Array(2);
  var s;
  var maxScrAccel = 5;
  var disableFlag = false;
  var _this = this;
  const SK_VERSION = '0.5.2';

  //var isHahModeEnabled = false; // in case hah isn't installed
  var surfkeysStringbundle;


  // public methods

  this.scrollUp = function() {
    if(isSidebarWindow()) {return;}
    surfkeysScrAccelerateScroller(SK_Y, -1);
  };

  this.scrollDown = function() {
    if(isSidebarWindow()) {return;}
    surfkeysScrAccelerateScroller(SK_Y, 1);
  };

  this.scrollLeft = function() {
    surfkeysScrAccelerateScroller(SK_X, -1);
  };

  this.scrollRight = function() {
    surfkeysScrAccelerateScroller(SK_X, 1);
  };

  this.pgDown = function() {
    stopScroller();
    // window._content.scrollByPages(1);
    goDoCommand('cmd_scrollPageDown');
  };

  this.pgUp = function() {
    stopScroller();
    // window._content.scrollByPages(-1);
    goDoCommand('cmd_scrollPageUp');
  };

  this.back = function() {
    stopScroller();
    getWindow().back();
  };

  this.forward = function() {
    stopScroller();
    getWindow().forward();
  };

  this.next = function() {
    stopScroller();
    if(!nextRel()) {
      surfkeysChangePage(window._content.location.href, 1);
    }
  };

  this.previous = function() {
    stopScroller();
    if(!previousRel()) {
      surfkeysChangePage(window._content.location.href, 2);
    }
  };

  /**
   * search for <link...> tags which rel attribute is up
   * if a link found, redirects to it's value
   * @return true if link found false if not found
   * @type Boolean
   */
  this.up = function() {
    var linkArray = window._content.document.getElementsByTagName('link');
    for(var i = 0, l = linkArray.length; i < l; i++) {
      if(linkArray[i].rel == 'up' || linkArray[i].rel == 'contents') {
        window._content.document.location.href = linkArray[i].href;
        return true;
      }
    }
    return false;
  };
  this.newTab = function() {
    stopScroller();
    BrowserOpenTab();
  };

  /**
   * Switch to next tab
   * @author ajnasz, Rick-112
   */
  this.nextTab = function() {
    stopScroller();
    // gBrowser.mTabContainer.advanceSelectedTab(1);
    gBrowser.mTabContainer.advanceSelectedTab(1, true);
    focusCurrentContent();
  };

  /**
   * Switch to previous tab
   * @author ajnasz, Rick-112
   */
  this.prevTab = function() {
    stopScroller();
    // gBrowser.mTabContainer.advanceSelectedTab(-1);
    gBrowser.mTabContainer.advanceSelectedTab(-1, true);
    focusCurrentContent();
  };

  /**
   * Focus to the first tab
   * @author ajnasz
   */
  this.focusFirst = function() {
    stopScroller();
    gBrowser.mTabContainer.selectedIndex = 0;
    focusCurrentContent();
  };

  /**
   * Focus the last tab
   * @author ajnasz
   */
  this.focusLast = function() {
    stopScroller();
    gBrowser.mTabContainer.selectedIndex = gBrowser.browsers.length-1;
    focusCurrentContent();
  };

  this.closeTab = function() {
    stopScroller();
    gBrowser.removeTab(gBrowser.mCurrentTab);
  };

  this.gotoLocationBar = function() {
    stopScroller();
    Urlbar = document.getElementById("urlbar");
    Urlbar.focus();
    Urlbar.select();
  };

  this.closeWindow = function() {
    stopScroller();
    getWindow().close();
  };

  this.stop = function() {
    stopScroller();
    getWindow().stop();
  };

  this.reload = function() {
    stopScroller();
    BrowserReload();
  };


  /**
   * @author ajnasz
   */
  this.moveLeft = function() {
    stopScroller();
    if(gBrowser.mCurrentTab.previousSibling) {
      gBrowser.moveTabTo(gBrowser.mCurrentTab,gBrowser.mCurrentTab._tPos-1);
    }
  };
  /**
   * @author ajnasz
   */
  this.moveRight = function() {
    stopScroller();
    if(gBrowser.mCurrentTab.nextSibling) {
      gBrowser.moveTabTo(gBrowser.mCurrentTab,gBrowser.mCurrentTab._tPos+1);
    }
  };
  /**
   * @author ajnasz
   */
  this.moveToBeginning = function() {
    stopScroller();
    gBrowser.moveTabTo(gBrowser.mCurrentTab,0);
  };
  /**
   * @author ajnasz
   */
  this.moveToEnd = function() {
    stopScroller();
    gBrowser.moveTabTo(gBrowser.mCurrentTab,gBrowser.mTabContainer.childNodes.length-1);
  };

  /**
   * search for <link...> tags which rel attribute is next
   * if a link found, redirects to it's value
   * @return true if link found false if not found
   * @type Boolean
   */
  var nextRel = function() {
    var linkArray = window._content.document.getElementsByTagName('link');
    for(var i = 0, l = linkArray.length; i < l; i++) {
      if(linkArray[i].rel == 'next') {
        window._content.document.location.href = linkArray[i].href;
        return true;
      }
    }
    return false;
  };
  /**
   * search for <link...> tags which rel attribute is prev or previous
   * if a link found, redirects to it's value
   * @return true if link found false if not found
   * @type Boolean
   */
   var previousRel = function() {
    var linkArray = window._content.document.getElementsByTagName('link');
    for(var i = 0, l = linkArray.length; i < l; i++) {
      if(linkArray[i].rel == 'previous' || linkArray[i].rel == 'prev') {
        window._content.document.location.href = linkArray[i].href;
        return true;
      }
    }
    return false;
  };


  function getWindow() {
    return document.commandDispatcher.focusedWindow;
  };

  this.scroller = function() {
    var w = getWindow();
    var oScrollX = w.scrollX;
    var oScrollY = w.scrollY;
    w.scrollBy(scrDelta[SK_X], 0);
    w.scrollBy(0, scrDelta[SK_Y]);
    if (w.scrollX == oScrollX) scrDelta[SK_X] = 0;
    if (w.scrollY == oScrollY) scrDelta[SK_Y] = 0;
    if (scrDelta[SK_X] == 0 && scrDelta[SK_Y] == 0) stopScroller();
  };

  // private methods

  function startScroller() {
    if (!surfScroll) {
      surfScroll = true;
      s = window.setInterval(function(){_this.scroller()}, 10);
    }
    return 1;
  }

  function stopScroller() {
    if (surfScroll) {
      window.clearInterval(s);
      surfScroll = false;
      scrDelta[SK_X] = 0;
      scrDelta[SK_Y] = 0;
      scrAccel[SK_X] = 0;
      scrAccel[SK_Y] = 0;
    }
    return 1;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // surfkeys
  ////////////////////////////////////////////////////////////////////////////////

  function focusCurrentContent() {
    gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow.focus();
  }
  /**
   * Changes page  to next / previous  page depending on the  URL of the
   * current  page. Check  from the  siteString what  are  the next/prev
   * strings on  each page  that have  to be looked  for from  the links
   * texts.  When found, the page url is replaced to the links href
   *
   * @param url    the url of the current page
   * @param value  the direction of the change (1: next, 2: previous)
   * @author       psillanp
   */
  function surfkeysChangePage(url, value) {
    var win = getWindow();
    var url = win.location.href;
    var linkArray = window._content.document.links;
    try {
      var sites = eval('(' + SKSites.surfkeysPrefs().getCharPref("resultpattern") + ')');
    } catch(e) {
      var sites= [];
    }
    var currloc = window._content.location.href;
    for(var i = 0, lr = linkArray.length, link, txt, rel, title; i < lr; i++) {
      txt = linkArray[i].innerHTML;
      href = linkArray[i].href;
      rel = linkArray[i].rel;
      title = linkArray[i].title;
      for(var j = 0, sl = sites.length, site, siter, rex; j < sl; j++) {
        site = sites[j];
        siter = new RegExp(site.site); // regexp for the url, to make possible the usage on sites like google.com/?search=.*
        if(siter.test(currloc)) {
          if(value == 1) {
            rex = new RegExp('(?:\\b|^)' + site.next + '(?:\\b|$)');
          } else if(value == 2) {
            rex = new RegExp('(?:\\b|^)' + site.prev + '(?:\\b|$)');
          }
          //RC NEW: Bypass onsite check if javascript link
          if((rel && rex.test(rel) || title && rex.test(title) || txt && rex.test(txt))) {
            win.location.href = href;
            return;
          }
        }
        
      }
    }
    return;
  }

  /**
   * ScrAccelerates the scroller either horizontally or vertically
   * by the given value
   *
   * @param dir    direction, either SK_X or SK_Y
   * @param value  value indicating the amount how much to scrAccelerate
   * @author       psillanp
   */
  function surfkeysScrAccelerateScroller(dir, value) {

    scrAccel[dir] += value;

    if (scrAccel[dir] > maxScrAccel) {
      scrAccel[dir] = maxScrAccel;
    } else if (scrAccel[dir] < -maxScrAccel) {
      scrAccel[dir] = -maxScrAccel;
    } else if (scrAccel[dir] == 0) {
      scrDelta[dir] = 0;
    } else {
      scrDelta[dir] = Math.pow(2, Math.abs(scrAccel[dir]));
      if (scrAccel[dir] < 0) scrDelta[dir] = -scrDelta[dir];
    }

    startScroller();
  }

  function surfkeysLoad() {

    if (sk_isFirstTime) {
      sk_isFirstTime = false;
      scrAccel[0] = 0;
      scrAccel[1] = 0;
      scrDelta[0] = 0;
      scrDelta[1] = 0;

      surfkeysStringbundle = document.getElementById("surfkeysstringbundle");

      var menu = window.document.getElementById("contentAreaContextMenu");
      menu.addEventListener("popupshowing", surfkeysShowcontext, false);
      // menu.addEventListener("popuphiding", surfkeysEnable, false);
      setKeys();
    }
  }

  function isSidebarWindow() {
    var focusedWindow = getWindow();
    var sidebarWindow = document.getElementById("sidebar").contentWindow;
    // SKLog.log(focusedWindow == sidebarWindow, focusedWindow.window == sidebarWindow);
    if(SKSites.surfkeysPrefs().getBoolPref('disableinsidebar') && focusedWindow && focusedWindow == sidebarWindow) { return true; }
  };

  /**
   * Function called when context menu pops up, decides whether to show
   * option for adding as next/previous link.
   *
   * @author        aeternus
   */

  function surfkeysShowcontext() {
    var sk_menuitem1 = document.getElementById("sk_markasnext");
    var sk_menuitem2 = document.getElementById("sk_markasprev");
    sk_menuitem1.hidden = !gContextMenu.onLink;
    sk_menuitem2.hidden = !gContextMenu.onLink;
    stopScroller();
  }

  /**
   * Allows to add/modify next/previous links, called by items in context menu.
   * First checks if there is an entry for the domain in the urlbar. If yes,
   * replaces the link text associated with the specified direction. If not, adds
   * a section for current domain.
   *
   * @param direction   the direction of the link (1: next, 2: previous)
   * @author        aeternus
   */

  this.SurfKeysAddNextPrev = function(direction) {
    var modfied_flag;

    if(gContextMenu) {
      var href = gContextMenu.linkURL;
      var linktext = gContextMenu.linkText();

      var hrefstripped = href.substring(href.indexOf("//") + 2, href.length);
      var domain = hrefstripped.substring(0, hrefstripped.indexOf("/"));

      var currloc = window._content.location.href;
      var sites = SKSites.getSites();
      var site = SKSites.getSiteFromURL(currloc);
      SKLog.log(site.site, site.next, site.prev, site.id);
      if(!site) {
        site = {
          site: currloc,
          next: '',
          prev: '',
          id: false
        };
      }
      if (direction == 1) {
        site.next = linktext;
      } else {
        site.prev = linktext;
      }
      SKSites.addSite(site);
      return;
    }
  }
  function sitesToTxt(json) {
    var sites = new Array(), next, prev;
    for(site in json) {
      next = json[site].next || '';
      prev = json[site].prev || '';
      sites.push('"' + site + '":{"site":"' + site + '","next":"' + next + '","prev":"' + prev + '"}');
    }
    return '{' + sites.join(',') + '}';
  }
  function postInstall() {
    try {
      var finished = SKSites.surfkeysPrefs().getCharPref('version');
    } catch(e){}
    var convertSites = function() {
      var patterns = SKSites.surfkeysPrefs().getCharPref("resultpattern")
      var siteArray = patterns.split(";");
      var sites = new Array();
      for(var i = 0, sl = siteArray.length, site; i < sl; i++) {
        site = siteArray[i].split(":");
        sites.push(SKSites.createSiteStr(site[0], site[1], site[2]));
        // sites.push('"' + site[0] + '":{"site":"' + site[0] + '","next":"' + site[1] + '","prev":"' + site[2] + '"}');
      }
      SKSites.surfkeysPrefs().setCharPref('resultpattern', '[' + sites.join(',') + ']');
    }
    if(finished != SK_VERSION) {
      // Convert the old store format to the new one
      SKLog.log('postinstall');
      convertSites();
      SKSites.surfkeysPrefs().setCharPref('version', '0.5.2');
    }
  }
  /**
   * A function to change the key bindings
   * @author ajnasz
   */
  function setKeys() {
    postInstall();
    var keys = eval('(' + SKSites.surfkeysPrefs().getCharPref('keys') + ')');
    var modifiers = new Array();
    var keyNode, key, parent, command, oncommand;
    for(var k in keys) {
      key = keys[k];
      modifiers = new Array();
      keyNode = document.getElementById(k);
      if(keyNode) {
        command = keyNode.getAttribute('command');
        oncommand = keyNode.getAttribute('oncommand');
        keyset = keyNode.parentNode;
        keyset.removeChild(keyNode);
        keyNode = document.createElement('key');
        if(key.shift) {
          modifiers.push('shift');
        }
        if(key.alt) {
          modifiers.push('alt');
        }
        if(modifiers.length) {
          modifiers = modifiers.join(' ');
        } else {
          modifiers = false;
        }
        keyNode.setAttribute('key', key.key);
        if(modifiers) {
          keyNode.setAttribute('modifiers', modifiers);
        }
        if(command) {
          keyNode.setAttribute('command', command);
        }
        if(oncommand) {
          keyNode.setAttribute('oncommand', oncommand);
        }
        keyNode.setAttribute('disabled', key.disabled);
        keyset.appendChild(keyNode);
        oncommand = null;
        command = null;
      }
    }
  }
  //  window.addEventListener("keypress", surfkeysOnKeypress, true);

  // listeners to suppress keyboard browsing when in menu
  window.addEventListener("DOMMenuItemActive", stopScroller, true);
  // window.addEventListener("DOMMenuItemInactive", surfkeysEnable, true);

  // applied to window, not window._content, since in the latter case
  // surfkeysLoad was never called.
  if(reload) {
    surfkeysLoad();
  } else {
    window.addEventListener("load", surfkeysLoad, true);
  }
  SKLog.log("Initialized");
};

var surfkeys = new surfkeys_();

