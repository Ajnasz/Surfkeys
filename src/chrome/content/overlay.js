/*jslint indent:2*/
/*global SK: true, goDoCommand: true, gBrowser: true, gContextMenu: true, SKLog */
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

function Surfkeys_(reload) {
  var sk_isFirstTime = true,
    surfScroll = false,
    SK_X = 0,
    SK_Y = 1,
    scrDelta = [],
    scrAccel = [],
    s, // scroll interval
    maxScrAccel = 5,
    _this = this,
    //isHahModeEnabled = false, // in case hah isn't installed
    surfkeysStringbundle;


  // private methods
  function getContent() {
    return window._content;
  }
  function getWindow() {
    return document.commandDispatcher.focusedWindow;
  }
  function isSidebarWindow() {
    var focusedWindow = getWindow(),
      sidebarWindow = document.getElementById("sidebar").contentWindow;
    if (SK.Prefs().getBoolPref('disableinsidebar') &&
      focusedWindow && focusedWindow === sidebarWindow) {
      return true;
    }
  }
  function startScroller() {
    if (!surfScroll) {
      surfScroll = true;
      s = window.setInterval(function () {
        _this.scroller();
      }, 10);
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
  /**
   * search for <link...> tags which rel attribute is next
   * if a link found, redirects to it's value
   * @return true if link found false if not found
   * @type Boolean
   */
  function nextRel() {
    var linkArray = getContent().document.getElementsByTagName('link'),
      i, l;
    for (i = 0, l = linkArray.length; i < l; i += 1) {
      if (linkArray[i].rel === 'next') {
        getContent().document.location.href = linkArray[i].href;
        return true;
      }
    }
    return false;
  }
  /**
   * search for <link...> tags which rel attribute is prev or previous
   * if a link found, redirects to it's value
   * @return true if link found false if not found
   * @type Boolean
   */
  function previousRel() {
    var linkArray = getContent().document.getElementsByTagName('link'),
      i, l;
    for (i = 0, l = linkArray.length; i < l; i += 1) {
      if (linkArray[i].rel === 'previous' || linkArray[i].rel === 'prev') {
        getContent().document.location.href = linkArray[i].href;
        return true;
      }
    }
    return false;
  }
  function focusCurrentContent() {
    gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow.focus();
  }
  /**
   * Function called when context menu pops up, decides whether to show
   * option for adding as next/previous link.
   *
   * @author        aeternus
   */
  function surfkeysShowcontext() {
    var sk_menuitem1 = document.getElementById("sk_markasnext"),
      sk_menuitem2 = document.getElementById("sk_markasprev");
    sk_menuitem1.hidden = !gContextMenu.onLink;
    sk_menuitem2.hidden = !gContextMenu.onLink;
    stopScroller();
  }
  /**
   * A function to change the key bindings
   * @author ajnasz
   */
  function setKeys() {
    // postInstall();
    var keys = SK.Keys.getKeys(),
      modifiers = [],
      keyNode, key, parent, command, oncommand,
      k, keyset;
    for (k in keys) {
      if (keys.hasOwnProperty(k)) {
        key = keys[k];
        modifiers = [];
        keyNode = document.getElementById(k);
        if (keyNode) {
          command = keyNode.getAttribute('command');
          oncommand = keyNode.getAttribute('oncommand');
          keyset = keyNode.parentNode;
          keyset.removeChild(keyNode);
          keyNode = document.createElement('key');
          if (key.shift) {
            modifiers.push('shift');
          }
          if (key.alt) {
            modifiers.push('alt');
          }
          if (key.control) {
            modifiers.push('control');
          }
          if (key.meta) {
            modifiers.push('meta');
          }
          modifiers = (modifiers.length) ? modifiers.join(' ') : false;
          keyNode.setAttribute('key', key.key);
          if (modifiers) {
            keyNode.setAttribute('modifiers', modifiers);
          }
          if (command) {
            keyNode.setAttribute('command', command);
          }
          if (oncommand) {
            keyNode.setAttribute('oncommand', oncommand);
          }
          keyNode.setAttribute('disabled', key.disabled);
          keyset.appendChild(keyNode);
          oncommand = null;
          command = null;
        }
      }
    }
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
    var win = getWindow(),
        // url = win.location.href,
        linkArray = win.document.links,
        currloc = win.location.href,
        sites = SK.Sites.getSites(),
        i, lr, link, txt, rel, title, href,
        j, sl, site, siter, rex;

    for (i = 0, lr = linkArray.length; i < lr; i += 1) {
      txt = linkArray[i].innerHTML;
      href = linkArray[i].href;
      rel = linkArray[i].rel;
      title = linkArray[i].title;
      for (j = 0, sl = sites.length; j < sl; j += 1) {
        site = sites[j];
        // regexp for the url, to make possible the usage on sites like google.com/?search=.*
        siter = new RegExp(site.site);
        if (siter.test(currloc)) {
          if (value === 1) {
            rex = new RegExp('(?:\\b|^)' + site.next + '(?:\\b|$)');
          } else if (value === 2) {
            rex = new RegExp('(?:\\b|^)' + site.prev + '(?:\\b|$)');
          }
          //RC NEW: Bypass onsite check if javascript link
          if ((rel && rex.test(rel) || title && rex.test(title) ||
            txt && rex.test(txt) && !/^javascript:/.test(href))) {
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
    } else if (scrAccel[dir] === 0) {
      scrDelta[dir] = 0;
    } else {
      scrDelta[dir] = Math.pow(2, Math.abs(scrAccel[dir]));
      if (scrAccel[dir] < 0) {
        scrDelta[dir] = -scrDelta[dir];
      }
    }

    startScroller();
  }
  // public methods
  this.scrollUp = function () {
    if (isSidebarWindow()) {
      return;
    }
    surfkeysScrAccelerateScroller(SK_Y, -1);
  };
  this.scrollDown = function () {
    if (isSidebarWindow()) {
      return;
    }
    surfkeysScrAccelerateScroller(SK_Y, 1);
  };
  this.scrollLeft = function () {
    surfkeysScrAccelerateScroller(SK_X, -1);
  };
  this.scrollRight = function () {
    surfkeysScrAccelerateScroller(SK_X, 1);
  };
  this.pgDown = function () {
    stopScroller();
    // window._content.scrollByPages(1);
    goDoCommand('cmd_scrollPageDown');
  };
  this.pgUp = function () {
    stopScroller();
    // window._content.scrollByPages(-1);
    goDoCommand('cmd_scrollPageUp');
  };
  this.top = function () {
    stopScroller();
    getWindow().scrollTo(getWindow().scrollX, 0);
  }
  this.bottom = function () {
    stopScroller();
    getWindow().scrollTo(getWindow().scrollX, getWindow().scrollMaxY);
  }
  /**
   * go back one page in the history
   */
  this.back = function () {
    stopScroller();
    getWindow().back();
  };
  /**
   * go forward one page in the history
   */
  this.forward = function () {
    stopScroller();
    getWindow().forward();
  };
  /**
   * Try to the find a 'next' link in the header, if not found,
   * search for a matching site from the 'resultpattern'
   */
  this.next = function () {
    stopScroller();
    if (!nextRel()) {
      surfkeysChangePage(getContent().location.href, 1);
    }
  };
  /**
   * Try to the find a 'prev' link in the header, if not found,
   * search for a matching site from the 'resultpattern'
   */
  this.previous = function () {
    stopScroller();
    if (!previousRel()) {
      surfkeysChangePage(getContent().location.href, 2);
    }
  };
  /**
   * search for <link...> tags which rel attribute is up
   * if a link found, redirects to it's value
   * @return true if link found false if not found
   * @type Boolean
   */
  this.up = function () {
    var linkArray = getContent().document.getElementsByTagName('link'),
      i, l;
    for (i = 0, l = linkArray.length; i < l; i += 1) {
      if (linkArray[i].rel === 'up' || linkArray[i].rel === 'contents') {
        getContent().document.location.href = linkArray[i].href;
        return true;
      }
    }
    return false;
  };
  /**
   * open a new browser tab
   */
  this.newTab = function () {
    stopScroller();
    BrowserOpenTab();
  };
  /**
   * Switch to next tab
   * @author ajnasz, Rick-112
   */
  this.nextTab = function () {
    stopScroller();
    // gBrowser.mTabContainer.advanceSelectedTab(1);
    gBrowser.mTabContainer.advanceSelectedTab(1, true);
    focusCurrentContent();
  };
  /**
   * Switch to previous tab
   * @author ajnasz, Rick-112
   */
  this.prevTab = function () {
    stopScroller();
    // gBrowser.mTabContainer.advanceSelectedTab(-1);
    gBrowser.mTabContainer.advanceSelectedTab(-1, true);
    focusCurrentContent();
  };
  /**
   * Focus to the first tab
   * @author ajnasz
   */
  this.focusFirst = function () {
    stopScroller();
    gBrowser.mTabContainer.selectedIndex = 0;
    focusCurrentContent();
  };
  /**
   * Focus the last tab
   * @author ajnasz
   */
  this.focusLast = function () {
    stopScroller();
    gBrowser.mTabContainer.selectedIndex = gBrowser.browsers.length - 1;
    focusCurrentContent();
  };
  /**
   * close the current tab
   */
  this.closeTab = function () {
    stopScroller();
    BrowserCloseTabOrWindow();
  };
  /**
   * focus to the location bar
   */
  this.gotoLocationBar = function () {
    stopScroller();
    var urlbar = document.getElementById("urlbar");
    urlbar.focus();
    urlbar.select();
  };
  /**
   * close the firefox window
   */
  this.closeWindow = function () {
    stopScroller();
    BrowserTryToCloseWindow();
  };
  /**
   * stop the loading and/or scrolling
   */
  this.stop = function () {
    stopScroller();
    getWindow().stop();
  };
  /**
   * reload the current page
   */
  this.reload = function () {
    stopScroller();
    BrowserReload();
  };
  /**
   * Move the current tab to left
   */
  this.moveLeft = function () {
    stopScroller();
    if (gBrowser.mCurrentTab.previousSibling) {
      gBrowser.moveTabTo(gBrowser.mCurrentTab, gBrowser.mCurrentTab._tPos - 1);
    } else {
      gBrowser.moveTabTo(gBrowser.mCurrentTab, gBrowser.mTabContainer.childNodes.length - 1);
    }
  };
  /**
   * Move the current tab to right
   */
  this.moveRight = function () {
    stopScroller();
    if (gBrowser.mCurrentTab.nextSibling) {
      gBrowser.moveTabTo(gBrowser.mCurrentTab, gBrowser.mCurrentTab._tPos + 1);
    } else {
      gBrowser.moveTabTo(gBrowser.mCurrentTab, 0);
    }
  };
  /**
   * Move the current tab to the beginnin of the tabbar
   * @author ajnasz
   */
  this.moveToBeginning = function () {
    stopScroller();
    gBrowser.moveTabTo(gBrowser.mCurrentTab, 0);
  };
  /**
   * Move the current tab to the end of the tabbar
   * @author ajnasz
   */
  this.moveToEnd = function () {
    stopScroller();
    gBrowser.moveTabTo(gBrowser.mCurrentTab, gBrowser.mTabContainer.childNodes.length - 1);
  };
  /**
   *
   */
  this.focusFirstInput = function () {
    stopScroller();
    var inputs, textareas;
    inputs = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex)
      .contentWindow.getElementsByTagName('input');
    if (inputs.length) {
      inputs[0].focus();
    } else {
      textareas = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex)
        .contentWindow.getElementsByTagName('textarea');
      if (textareas.length) {
        textareas[0].focus();
      }
    }
  };
  this.scroller = function () {
    var w = getWindow(),
      oScrollX = w.scrollX,
      oScrollY = w.scrollY;
    w.scrollBy(scrDelta[SK_X], 0);
    w.scrollBy(0, scrDelta[SK_Y]);
    if (w.scrollX === oScrollX) {
      scrDelta[SK_X] = 0;
    }
    if (w.scrollY === oScrollY) {
      scrDelta[SK_Y] = 0;
    }
    if (scrDelta[SK_X] === 0 && scrDelta[SK_Y] === 0) {
      stopScroller();
    }
  };
  /**
   * Allows to add/modify next/previous links, called by items in context menu.
   * First checks if there is an entry for the domain in the urlbar. If yes,
   * replaces the link text associated with the specified direction. If not, adds
   * a section for current domain.
   *
   * @param direction   the direction of the link (1: next, 2: previous)
   * @author        aeternus
   */
  this.SurfKeysAddNextPrev = function (direction) {
    var modfied_flag,
      href, linktext, hrefstripped, domain, currloc,
      site;

    if (gContextMenu) {
      href = gContextMenu.linkURL;
      linktext = gContextMenu.linkText();

      hrefstripped = href.substring(href.indexOf("//") + 2, href.length);
      domain = hrefstripped.substring(0, hrefstripped.indexOf("/"));

      // use an object here to make possible to change it's value in the dialog
      currloc = {
        loc: getContent().location.href
      };
      window.openDialog("chrome://surfkeys/content/edit-path.xul",
        'Surfkeys Edit Path', 'chrome,titlebar,toolbar,centerscreen,modal', currloc);
      if (currloc.loc === false) {
        return;
      }
      site = SK.Sites.getSiteFromURL(currloc.loc);
      if (!site) {
        site = SK.Sites.createSite(currloc.loc, '', '');
      }
      if (direction === 1) {
        site.next = linktext;
      } else {
        site.prev = linktext;
      }
      SK.Sites.addSite(site);
      return;
    }
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
  function postInstall() {
    var finished, convertSites;
    try {
      finished = SK.Prefs().getCharPref('version');
    } catch (e) {}
    convertSites = function () {
      var siteArray = SK.Prefs().getSites(),
        sites = [],
        i, sl, site;
      for (i = 0, sl = siteArray.length; i < sl; i += 1) {
        site = siteArray[i].split(":");
        sites.push(SK.Sites.createSite(site[0], site[1], site[2]));
      }
      SK.Sites.setSites(sites);
    }
    if (finished !== '0.5.2') {
      // Convert the old store format to the new one
      SKLog.log('postinstall');
      convertSites();
    }
    SK.Prefs().setCharPref('version', '0.6');
  }
  //  window.addEventListener("keypress", surfkeysOnKeypress, true);
  // listeners to suppress keyboard browsing when in menu
  window.addEventListener("DOMMenuItemActive", stopScroller, true);
  // window.addEventListener("DOMMenuItemInactive", surfkeysEnable, true);
  // applied to window, not window._content, since in the latter case
  // surfkeysLoad was never called.
  if (reload) {
    surfkeysLoad();
  } else {
    window.addEventListener("load", surfkeysLoad, true);
  }
  // SKLog.log("Initialized!'!a");
}

var surfkeys = new Surfkeys_();

