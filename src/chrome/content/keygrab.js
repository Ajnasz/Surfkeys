var SK_keygrab = function(event) {
  event.preventDefault();
  event.stopPropagation();

  var original = document.getElementById('surfkeys-grabbed-key');
  var modifiers = new Array();
  if(event.altKey) {
    modifiers.push('Alt');
  }
  if(event.ctrlKey) {
    modifiers.push('Ctrl');
  }
  if(event.shiftKey) {
    modifiers.push('Shift');
  }
  if(event.metaKey) {
    modifiers.push("meta");
  }
  var key = null, keycode = null;
  if(event.charCode) {
    key = String.fromCharCode(event.charCode).toUpperCase();
  } else {
    return;
  }
  original.value = modifiers.length ? modifiers.join(' + ') + ' + ' : '';
  original.value += key.toUpperCase();
}
var focusShadow = function() {
  document.getElementById('surfkeys-grabbed-key-shadow').focus();
}
window.addEventListener('keypress', SK_keygrab, true);

