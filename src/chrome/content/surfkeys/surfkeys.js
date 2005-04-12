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
var xDelta = 0;
var yDelta = 0;
var surfDelta = 2;
var s;

isHahModeEnabled = false; // in case hah isn't installed

var SK_KEY_SCROLL_UP = "i";
var SK_KEY_SCROLL_DOWN = "k";
var SK_KEY_SCROLL_LEFT = "j";
var SK_KEY_SCROLL_RIGHT = "l";
var SK_KEY_BACK = "b";
var SK_KEY_FORWARD = "h";
var SK_KEY_NEXT = "n";
var SK_KEY_PREVIOUS = "p";


function scroller() {
  var w = window._content;

  var oScrollX = w.scrollX;
  var oScrollY = w.scrollY;
  w.scrollBy(xDelta, 0);
  w.scrollBy(0, yDelta);
  if (w.scrollX == oScrollX) xDelta = 0;
  if (w.scrollY == oScrollY) yDelta = 0;
  if (xDelta == 0 && yDelta == 0) stopScroller();
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
    xDelta = 0;
    yDelta = 0;
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

var minDelta = 2;
var maxDelta = 64;

function surfkeysOnKeypress(event) {
  
  if (isHahModeEnabled || !surfkeysPrefs.get(SURFKEYS_PREFS.ENABLED) ||
      !document.getElementById("FindToolbar").hidden) {
    stopScroller();    
    return; 
  }
  
  if (sk_isFormElemFocused() && !event.altKey) return;
  
  key = String.fromCharCode(event.charCode);

  switch (key) {
  case SK_KEY_NEXT:
    stopScroller();
    surfkeysChangePage(window._content.location.href, 1);
    break;
  case SK_KEY_PREVIOUS:
    stopScroller();
    surfkeysChangePage(window._content.location.href, 2);
    break;
  case SK_KEY_BACK: // these are handled in the XUL file
    stopScroller();
    break;
  case SK_KEY_FORWARD:
    stopScroller();  
    break;
  case SK_KEY_SCROLL_RIGHT:
    surfkeysAccelerateRight();
    break;
  case SK_KEY_SCROLL_LEFT:
    surfkeysAccelerateLeft();
    break;
  case SK_KEY_SCROLL_DOWN:
    surfkeysAccelerateDown();
    break;
  case SK_KEY_SCROLL_UP:
    surfkeysAccelerateUp();
    break;
  default:
    stopScroller();
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
 * @author       Pekka Sillanpaa
 */
function surfkeysChangePage(url, value) {
  var linkArray = window._content.document.links;
  var siteArray = surfkeysPrefs.get(SURFKEYS_PREFS.RESULTLINKS).split(";");

  //  url = window._content.location.href;

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

function surfkeysAccelerateUp() {
  if (yDelta <= -minDelta)
    yDelta *= 2;
  else if (yDelta > -minDelta && yDelta <= minDelta)
    yDelta = -minDelta;
  else yDelta /= 2;
  if (yDelta < -maxDelta) yDelta = -maxDelta;

  startScroller();
}

function surfkeysAccelerateDown() {
  //  alert("boo");
  if (yDelta >= minDelta)
    yDelta *= 2;
  else if (yDelta >= -minDelta && yDelta < minDelta)
    yDelta = minDelta;
  else yDelta /= 2;
  if (yDelta > maxDelta) yDelta = maxDelta;

  startScroller();
}

function surfkeysAccelerateRight() {
  if (xDelta >= minDelta)
    xDelta *= 2;
  else if (xDelta >= -minDelta && xDelta < minDelta)
    xDelta = minDelta;
  else xDelta /= 2;
  if (xDelta > maxDelta) xDelta = maxDelta;
  
  startScroller();
}

function surfkeysAccelerateLeft() {
  if (xDelta <= -minDelta)
    xDelta *= 2;
  else if (xDelta > -minDelta && xDelta <= minDelta)
    xDelta = -minDelta;
  else xDelta /= 2;
  if (xDelta < -maxDelta) xDelta = -maxDelta;

  startScroller();
}

function surfkeysLoad() {
  if (isFirstTime) {
    isFirstTime = false;
    surfkeysPrefs.setDefaultPreferences();
  }
}

window.addEventListener("keypress", surfkeysOnKeypress, true);

window.document.addEventListener("load", surfkeysLoad, true);

surfkeysLogMessage("Initialized.");






