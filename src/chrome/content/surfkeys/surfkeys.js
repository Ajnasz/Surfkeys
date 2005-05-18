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


var isFirstTime = true;
var surfScroll = false;
var SK_X = 0;
var SK_Y = 1;
var scrDelta = Array(2);
var scrAccel = Array(2);
var surfScrDelta = 2;
var s;
var maxScrAccel = 5;

isHahModeEnabled = false; // in case hah isn't installed

var SK_KEY_SCROLL_UP = "i";
var SK_KEY_SCROLL_DOWN = "k";
var SK_KEY_SCROLL_LEFT = "j";
var SK_KEY_SCROLL_RIGHT = "l";
var SK_KEY_BACK = ",";
var SK_KEY_FORWARD = ".";
var SK_KEY_NEXT = "m";
var SK_KEY_PREVIOUS = "n";

var SK_KEY_NEXTTAB = "o";
var SK_KEY_PREVTAB = "u";
var SK_KEY_PGUP = "p";
var SK_KEY_PGDN = ";";
var SK_KEY_NEWTAB = "t";
var SK_KEY_CLOSETAB = "y";

var SK_KEY_STOP = "s";
var SK_KEY_RELOAD = "r";

var SK_KEY_NEWTAB = "r";
var SK_KEY_GOTOLOCATIONBAR = "g";
var SK_KEY_CLOSEWINDOW = "w";

function scroller() {

  frames = window._content.frames;  
  
  var w = document.commandDispatcher.focusedWindow;

  var oScrollX = w.scrollX;
  var oScrollY = w.scrollY;
  w.scrollBy(scrDelta[SK_X], 0);
  w.scrollBy(0, scrDelta[SK_Y]);
  if (w.scrollX == oScrollX) scrDelta[SK_X] = 0;
  if (w.scrollY == oScrollY) scrDelta[SK_Y] = 0;
  if (scrDelta[SK_X] == 0 && scrDelta[SK_Y] == 0) stopScroller();
}

function startScroller() {
  if (!surfScroll) {
    surfScroll = true;
    s = window.setInterval("scroller()", 10);
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

function surfkeysOnKeypress(event) {
  
  if (isHahModeEnabled || !surfkeysPrefs.get(SURFKEYS_PREFS.ENABLED) ||
      !document.getElementById("FindToolbar").hidden || event.ctrlKey) {
    stopScroller();    
    return; 
  }
  
  if (sk_isFormElemFocused() && !event.altKey) return;
  
  key = String.fromCharCode(event.charCode);

  var w = document.commandDispatcher.focusedWindow;

  stopScroller();

  switch (key) {
  case SK_KEY_NEXT:
    surfkeysChangePage(window._content.location.href, 1);
    break;
  case SK_KEY_PREVIOUS:
    surfkeysChangePage(window._content.location.href, 2);
    break;
  case SK_KEY_BACK: // these are handled in the XUL file
    w.back();
    break;
  case SK_KEY_FORWARD:
    w.forward();
    break;
  case SK_KEY_STOP:
    w.stop();
    break;
  case SK_KEY_RELOAD:
    w.reload();
    break;
  case SK_KEY_CLOSEWINDOW:
    w.close();
    break;
  case SK_KEY_SCROLL_RIGHT:
    surfkeysScrAccelerateScroller(SK_X, 1);
    break;
  case SK_KEY_SCROLL_LEFT:
    surfkeysScrAccelerateScroller(SK_X, -1);
    break;
  case SK_KEY_SCROLL_DOWN:
    surfkeysScrAccelerateScroller(SK_Y, 1);
    break;
  case SK_KEY_SCROLL_UP:
    surfkeysScrAccelerateScroller(SK_Y, -1);
    break;
  case SK_KEY_CLOSETAB:
    gBrowser.removeTab(gBrowser.mCurrentTab);
    break;
  case SK_KEY_NEWTAB:
    break;
  case SK_KEY_NEXTTAB:
    gBrowser.mTabContainer.advanceSelectedTab(1);
    break;
  case SK_KEY_PREVTAB:
    gBrowser.mTabContainer.advanceSelectedTab(-1);
    break;
  case SK_KEY_PGDN:
    window._content.scrollByPages(1);
    break;
  case SK_KEY_PGUP:
    window._content.scrollByPages(-1);
    break;
  case SK_GOTOLOCATIONBAR:
    break;
  default:
    break;
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
  var linkArray = window._content.document.links;
  var siteArray = surfkeysPrefs.get(SURFKEYS_PREFS.RESULTLINKS).split(";");

  for (s = 0; s < siteArray.length; s++) {
    site = siteArray[s].split(":");
    if (url.indexOf(site[0]) != -1) {
      for (i = 0; i < linkArray.length; i++) {
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
  if (isFirstTime) {
    isFirstTime = false;
    scrAccel[0] = 0;
    scrAccel[1] = 0;
    scrDelta[0] = 0;
    scrDelta[1] = 0;

    surfkeysPrefs.setDefaultPreferences();
  }
}

window.addEventListener("keypress", surfkeysOnKeypress, true);

window.document.addEventListener("load", surfkeysLoad, true);

surfkeysLogMessage("Initialized");






