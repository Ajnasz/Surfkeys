var EditPath = {
  init: function() {
    var currloc = window.arguments[0];
    var url = currloc.loc.replace(/^\w+:\/\//, '').split('/');
    var values = {
      original: currloc.loc,
      domain: url[0],
      extended: url.slice(0, url.length).join('/'),
    };
    var inputs = {
      original: document.getElementById('original'),
      extended: document.getElementById('extended'),
      custom: document.getElementById('custom'),
      customPath: document.getElementById('custom-path'),
      domain: document.getElementById('domain'),
      path: document.getElementById('path')
    };
    inputs.original.setAttribute('label', values.original);
    inputs.extended.setAttribute('label', values.extended);
    inputs.domain.setAttribute('label', values.domain);
    inputs.path.value = values.original;
    inputs.customPath.value = values.original;
    inputs.original.addEventListener('click', function(event){
      inputs.customPath.disabled = true;
      inputs.path.value = this.getAttribute('label');
    }, false);
    inputs.extended.addEventListener('click', function(event){
      inputs.customPath.disabled = true;
      inputs.path.value = this.getAttribute('label');
    }, false);
    inputs.domain.addEventListener('click', function(event){
      inputs.customPath.disabled = true;
      inputs.path.value = this.getAttribute('label');
    }, false);
    inputs.custom.addEventListener('click', function(event){
      SKLog.log(inputs.customPath.id, inputs.custom.id);
      inputs.customPath.disabled = false;
      inputs.path.value = inputs.customPath.value;
    }, false);
    inputs.customPath.addEventListener('keyup', function(event){
      inputs.path.value = this.value;
    }, false);
  },
  save: function() {
    var input = document.getElementById('path');
    var currloc = window.arguments[0];
    currloc.loc = input.value;
    return true;
  }
};
