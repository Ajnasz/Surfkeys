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

function surfkeys_() {

  //var modified_flag = false;
  var sk_isFirstTime = true;
  var surfScroll = false;
  var SK_X = 0;
  var SK_Y = 1;
  var scrDelta = Array(2);
  var scrAccel = Array(2);
  var surfScrDelta = 2;
  var s;
  var maxScrAccel = 5;
  var disableFlag = false;

  //var isHahModeEnabled = false; // in case hah isn't installed
  var surfkeysStringbundle;

  var surfkeysPrefs = Components.classes["@mozilla.org/preferences-service;1"].
    getService(Components.interfaces.nsIPrefService);

  surfkeysPrefs = surfkeysPrefs.getBranch("extensions.surfkeys.");

  // public methods

  this.scrollUp = function() {
      surfkeysScrAccelerateScroller(SK_Y, -1);
  };

  this.scrollDown = function() {
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
      surfkeysChangePage(window._content.location.href, 1);
  };

  this.previous = function() {
      stopScroller();
      surfkeysChangePage(window._content.location.href, 2);
  };


  this.newTab = function() {
      stopScroller();
      BrowserOpenTab();
  };

  this.nextTab = function() {
      stopScroller();
      // gBrowser.mTabContainer.advanceSelectedTab(1);
      gBrowser.mTabContainer.advanceSelectedTab(1, true);
  };

  this.prevTab = function() {
      stopScroller();
      // gBrowser.mTabContainer.advanceSelectedTab(-1);
      gBrowser.mTabContainer.advanceSelectedTab(-1, true);
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

  function getWindow() {
    return document.commandDispatcher.focusedWindow;
  };

  this.scroller = function() {

    frames = window._content.frames;

    var w = document.commandDispatcher.focusedWindow;

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
      s = window.setInterval("surfkeys.scroller()", 10);
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
  // logging
  ////////////////////////////////////////////////////////////////////////////////

  var gConsoleService = Components.classes['@mozilla.org/consoleservice;1']
    .getService(Components.interfaces.nsIConsoleService);

  function surfkeysLogMessage(aMessage) {
    gConsoleService.logStringMessage('surfkeys: ' + aMessage);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // configuration and initialization related functions
  ////////////////////////////////////////////////////////////////////////////////

  function quickDisable() {
    surfkeysQuickDisabled = true;
  }

  function quickEnable() {
    surfkeysQuickDisabled = false;
  }

  function sk_isFormElemFocused()
    {
      var elt = document.commandDispatcher.focusedElement;
      if (elt == null) return false;

      var tagName = elt.localName.toUpperCase();

      if (tagName == "INPUT" ||
	  tagName == "TEXTAREA" ||
	  tagName == "SELECT" ||
	  tagName == "BUTTON" ||
	  tagName == "ISINDEX")
	return true;

      return false;
    }

  ////////////////////////////////////////////////////////////////////////////////
  // surfkeys
  ////////////////////////////////////////////////////////////////////////////////

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
    var linkArray = window._content.document.links;
    var siteArray = surfkeysPrefs.getCharPref("resultpattern").split(";");

    for (s = 0; s < siteArray.length; s++) {
      site = siteArray[s].split(":");
      if (url.indexOf(site[0]) != -1 || site[0] == "*") {
	for (i = 0; i < linkArray.length; i++) {
	  if (site[0] == "*") {
	    var hrefstripped = url.substring(url.indexOf("//") + 2, url.length);
	    var domain = hrefstripped.substring(0, hrefstripped.indexOf("/"));
	    site[0] = domain;
	  }
	  var txt = linkArray[i].innerHTML;
	  // we check that the text inside anchor matches the next/prev-text
	  // defined for the site, and also verify that the link's href
	  // is still in the same site (just to prevent a situation where
	  // google's result link have a text "Previous" inside it)
	  if (txt.indexOf(site[value]) != -1 && linkArray[i].href.indexOf(site[0]) != -1) {
	    window._content.location.replace(linkArray[i].href);
	    return;
	  }
	}
      }
    }
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


      /*	var gBrowser = document.getElementById("content");
		if (gBrowser) {
		var TabBox = document.getAnonymousNodes(gBrowser)[1];
		var TabBar = TabBox.getElementsByAttribute('class', 'tabbrowser-tabs')[0];
		//	TabBar.hidden = true;
		}
      */
      var menu = window.document.getElementById("contentAreaContextMenu");
      menu.addEventListener("popupshowing", surfkeysShowcontext, false);
      menu.addEventListener("popuphiding", surfkeysEnable, false);
      setKeys();
    }
  }

  /**
   * Function called when context menu pops up, decides whether to show
   * option for adding as next/previous link.
   *
   * @author				aeternus
   */

  function surfkeysShowcontext() {
    var sk_menuitem1 = document.getElementById("sk_markasnext");
    sk_menuitem1.hidden = !gContextMenu.onLink;
    var sk_menuitem2 = document.getElementById("sk_markasprev");
    sk_menuitem2.hidden = !gContextMenu.onLink;
    surfkeysDisable();
  }

  /**
   * Allows to add/modify next/previous links, called by items in context menu.
   * First checks if there is an entry for the domain in the urlbar. If yes,
   * replaces the link text associated with the specified direction. If not, adds
   * a section for current domain.
   *
   * @param direction		the direction of the link (1: next, 2: previous)
   * @author				aeternus
   */

  this.SurfKeysAddNextPrev = function(direction) {
    var modfied_flag;

    if(gContextMenu) {
      var href = gContextMenu.linkURL;
      var linktext = gContextMenu.linkText();

      var hrefstripped = href.substring(href.indexOf("//") + 2, href.length);
      var domain = hrefstripped.substring(0, hrefstripped.indexOf("/"));

      var currloc = window._content.location.href;
      var siteArray = surfkeysPrefs.getCharPref("resultpattern").split(";");

      var modified_flag = false;

      var site;

      for (s = 0; s < siteArray.length; s++) {
        site = siteArray[s].split(":");
        if ((currloc.indexOf(site[0]) != -1) && (site[0].length > 0) && (currloc.indexOf(domain)!=-1)) {
          modified_flag = true;
          site[direction] = linktext;
          siteArray[s] = site.join(":");
          alert(surfkeysStringbundle.getString("modifiedlink_for") + " " + domain +
          surfkeysStringbundle.getString("linktext") + " " + linktext);
        }
      }

      var siteList = siteArray.join(";");

      if ((!modified_flag) && (currloc.indexOf(domain) != -1)) {

        var linkToadd;
        if (direction == 1) {
          linkToadd = linktext + ":";
        } else {
          linkToadd = ":" + linktext;
        }
        alert(surfkeysStringbundle.getString("addedlink_for") + " " +
              domain + surfkeysStringbundle.getString("linktext") + " " + linktext);
        siteList = siteList + ";" + domain + ":" + linkToadd;
      }

      surfkeysPrefs.setCharPref("resultpattern", siteList);
    }
  }

  /**
   * Two functions to temporarily disable surfkeys, currently only when
   * a menu is shown, in the future: also when a buffer list is shown
   * @author				aeternus
   */

  function surfkeysDisable() {
    disableFlag = true;
    stopScroller();
  }

  function surfkeysEnable() {
    disableFlag = false;
  }

  function setKeys() {
    var keys = eval('(' + surfkeysPrefs.getCharPref('keys') + ')');
    var modifiers = new Array();
    var keyNode, key;
    for(var k in keys) {
      key = keys[key];
      modifiers = new Array();
      keyNode = document.getElementById(k);
      if(keyNode) {
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
        if(modifiers)
        keyNode.setAttribute('modifiers', modifiers);
      }
    }
  }
  //  window.addEventListener("keypress", surfkeysOnKeypress, true);

  // listeners to suppress keyboard browsing when in menu
  window.addEventListener("DOMMenuItemActive", surfkeysDisable, true);
  window.addEventListener("DOMMenuItemInactive", surfkeysEnable, true);

  // applied to window, not window._content, since in the latter case
  // surfkeysLoad was never called.
  window.addEventListener("load", surfkeysLoad, true);

  surfkeysLogMessage("Initialized");

}

var surfkeys = new surfkeys_()

