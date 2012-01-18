/*jslint indent: 2*/
/*global SurfKeys: true */
/**
 * @namespace SurfKeys
 */
SurfKeys.EditPath = {
  /**
   * Converts the current url to an object which contains the following properties:
   *  original: the original url
   *  domain: only the domain of the url
   *  extended: the original url without it's last element
   * @namespace SurfKeys.EditPath
   * @method getURl
   * @returns an object with the parsed url
   * @type Object
   */
  getUrl: function () {
    var currloc = window.arguments[0],
      url = currloc.loc.replace(/(^\w+:\/\/|\?.*$)/g, '').split('/');
    return {
      original: currloc.loc,
      domain: url[0],
      extended: url.slice(0, url.length).join('/')
    };
  },
  /**
   * Initializer function, which sets the input labels in the path editor window
   */
  init: function (event) {
    var values = SurfKeys.EditPath.getUrl(),
      inputs,
      customPath;
    // get input elements
    inputs = {
      original: document.getElementById('original'),
      extended: document.getElementById('extended'),
      domain: document.getElementById('domain'),
      custom: document.getElementById('custom'),
      customPath: document.getElementById('custom-path'),
      path: document.getElementById('path')
    };
    // enable/disable the custom path input field
    customPath = {
      enable: function () {
        if (inputs.customPath.disabled) {
          inputs.customPath.disabled = false;
        }
      },
      disable: function () {
        if (!inputs.customPath.disabled) {
          inputs.customPath.disabled = true;
        }
      }
    };


    // sets the value of the input labels and inputs
    inputs.original.setAttribute('label', values.original);
    inputs.extended.setAttribute('label', values.extended);
    inputs.domain.setAttribute('label', values.domain);
    inputs.path.value = values.original;
    inputs.customPath.value = values.original;

    // add event listeners
    inputs.original.addEventListener('click', function (event) {
      customPath.disable();
      inputs.path.value = this.getAttribute('label');
    }, false);
    inputs.extended.addEventListener('click', function (event) {
      customPath.disable();
      inputs.path.value = this.getAttribute('label');
    }, false);
    inputs.domain.addEventListener('click', function (event) {
      customPath.disable();
      inputs.path.value = this.getAttribute('label');
    }, false);
    inputs.custom.addEventListener('click', function (event) {
      customPath.enable();
      inputs.path.value = inputs.customPath.value;
    }, false);
    inputs.customPath.addEventListener('keyup', function (event) {
      inputs.path.value = this.value;
    }, false);
  },
  /**
   * saves the path value to the currloc variable
   * @see surfkesy#SurfKeysAddNextPrev
   * @returns true, to enable to close the window
   * @type Boolean
   */
  save: function () {
    var input = document.getElementById('path'),
      currloc = window.arguments[0];
    currloc.loc = input.value;
    return true;
  },
  cancel: function () {
    var currloc = window.arguments[0];
    currloc.loc = false;
    return true;
  }
};
