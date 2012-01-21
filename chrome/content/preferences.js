(function () {
    /*global Components: true, alert: true, SurfKeysLog: true */
    /**
    * generates the rows to the tree on the site matching tab
    * @param {Object} [patterns]
    * @param {Integer} [selection]
    * @param {String} [val]
    */

    var scope = {}, initPreferences, SurfkeysTree, generatePattern, generateKeys,
        setAllWinKeys, KeysCommands, SitesCommands;

    SurfkeysTree = function (treeId) {
        var tree = document.getElementById(treeId);
        return {
            setView: function (view) {
                tree.view = view;
            },
            getTree: function () {
                return tree;
            }
        };
    };
    Components.utils.import("resource://surfkeysmodules/sk.jsm", scope);
    generatePattern = function (patterns, selection, val) {
        if (!patterns) {
            patterns = false;
        }
        var sites, treeView, tree, sitesTree;
        sites = scope.SurfKeys.Sites.getSites(patterns);
        treeView = {
            rowCount: sites.length + 1,
            getCellText: function (row, column) {
                if (!sites[row] || !column) {
                    return;
                }
                switch (column.id) {
                case 'siteidcol':
                    return sites[row].id;

                case 'sitecol':
                    return sites[row].site;

                case 'prevcol':
                    return sites[row].prev;

                case 'nextcol':
                    return sites[row].next;
                }
            },
            setTree: function (treebox) {
                this.treebox = treebox;
            },
            isContainer: function (row) {
                return false;
            },
            isSeparator: function (row) {
                return false;
            },
            isSorted: function () {
                return false;
            },
            getLevel: function (row) {
                return 0;
            },
            getImageSrc: function (row, col) {
                return null;
            },
            getRowProperties: function (row, props) {},
            getCellProperties: function (row, col, props) {},
            cycleHeader: function (col, elem) {},
            getColumnProperties: function (colid, col, props) {}
        };
        sitesTree = new SurfkeysTree('sk-resultpattern-tree');
        scope.sitesTree = sitesTree;
        sitesTree.setView(treeView);
        tree = sitesTree.getTree();

        if (val) {
            tree.view.selection.select(scope.SurfKeys.Sites.getSiteRow(val));
        } else if (!isNaN(selection)) {
            tree.view.selection.select(selection);
        } else {
            tree.view.selection.select(0);
        }
    };
    /**
    * generates the rows to the tree on the key configuration tab
    * @param {Object} [keys]
    * @param {Integer} [selection]
    */
    generateKeys = function (keys, selection) {
        if (!keys) {
            keys = scope.SurfKeys.Keys.getKeys(keys);
        }
        var _keys = [], key, treeView, tree, keysTree;
        for (key in keys) {
            if (keys.hasOwnProperty(key)) {
                keys[key].id = key;
                _keys.push(keys[key]);
            }
        }
        treeView = {
            rowCount: _keys.length,
            getCellText: function (row, column) {
                if (!_keys[row]) {
                    return;
                }
                var bundle = document.getElementById('surfkeys-bundles');
                switch (column.id) {
                case 'idcol':
                    return _keys[row].id;
                case 'namecol':
                    return bundle.getString(_keys[row].id);
                case 'keycol':
                    return _keys[row].key.toUpperCase();
                }
            },
            getCellValue: function (row, column) {
                if (!_keys[row]) {
                    return;
                }
                switch (column.id) {
                case 'shiftcol':
                    return _keys[row].shift || false;

                case 'altcol':
                    return _keys[row].alt || false;

                case 'controlcol':
                    return _keys[row].control || false;

                case 'metacol':
                    return _keys[row].meta || false;

                case 'disabledcol':
                    return _keys[row].disabled || false;
                }
            },
            setTree: function (treebox) {
                this.treebox = treebox;
            },
            isContainer: function (row) {
                return false;
            },
            isSeparator: function (row) {
                return false;
            },
            isSorted: function () {
                return false;
            },
            getLevel: function (row) {
                return 0;
            },
            getImageSrc: function (row, col) {
                return null;
            },
            getRowProperties: function (row, props) {},
            getCellProperties: function (row, col, props) {},
            getColumnProperties: function (colid, col, props) {}
        };
        keysTree = new SurfkeysTree('sk-keys-tree');
        keysTree.setView(treeView);
        tree = keysTree.getTree();
        scope.keysTree = keysTree;
        if (!isNaN(selection)) {
            tree.view.selection.select(selection);
        } else {
            tree.view.selection.select(0);
        }
    };
    /**
    * creates surfkeys instance for all window
    * @method setAllWinKeys
    */
    setAllWinKeys = function () {
        var enumerator, win;
        /**
        * @private
        */
        enumerator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
              .getService(Components.interfaces.nsIWindowMediator)
              .getEnumerator('navigator:browser');
        /**
        * variable to store the window objects
        * @private */
        while (enumerator.hasMoreElements()) {
            win = enumerator.getNext();
            if (win.surfkeys_) {
                win.surfkeys = new win.surfkeys_(true);
            }
        }
    };
    /**
    * runs when select a row in a tree
    */
    KeysCommands = {
        keySelected: function () {
            /**
            * tree object
            * @private
            */
            var tree = scope.keysTree.getTree(), selectedKey, currentKey, currentDisabled, modifiers;
            /**
            * the properties of the currently selected command
            * @private
            */
            selectedKey = {
                id: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0)),
                name: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(1)),
                key: tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(2)),
                shift: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(3)),
                alt: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(4)),
                control: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(5)),
                meta: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(6)),
                disabled: tree.view.getCellValue(tree.currentIndex, tree.columns.getColumnAt(7))
            };
            /**
            * input field where the key combo is displayed
            * @param
            */
            currentKey = document.getElementById('sk-current-key');
            /**
            * the disabler checkbox
            * @param
            */
            currentDisabled = document.getElementById('sk-current-disabled');
            /**
            * an array to store the active modifiers
            * @param
            */
            modifiers = [];
            if (selectedKey.shift === 'true') {
                modifiers.push('SHIFT');
            }
            if (selectedKey.alt === 'true') {
                modifiers.push('ALT');
            }
            if (selectedKey.control === 'true') {
                modifiers.push('CTRL');
            }
            if (selectedKey.meta === 'true') {
                modifiers.push('META');
            }

            currentKey.value = '';
            if (modifiers.length) {
                currentKey.value += modifiers.join(' + ') + ' + ';
            }
            currentKey.value += selectedKey.key !== null ? selectedKey.key.toUpperCase() : '';
            currentDisabled.checked = (selectedKey.disabled === 'false') ? false : true;
        },
        /**
        * Sets the the current key value
        * @method setCurrentKey
        * @param {String} val the letter of the current key
        */
        setCurrentKey: function (val) {
            /**
            * all of the keys
            * @private
            */
            var keys = scope.SurfKeys.Keys.getKeys(),
            /**
            * tree object
            * @private
            */
            tree = scope.keysTree.getTree(),
            /**
            * The id of the selected key
            * @private
            */
            currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
            keys[currentId].key = val;
            if (scope.SurfKeys.Keys.isConflict(keys)) {
                alert('key already used');
                tree.view.selection.clearSelection();
                tree.view.selection.select(tree.currentIndex);
                return;
            }
            generateKeys(keys, tree.currentIndex);
            scope.SurfKeys.Keys.setKeys(keys);
        },
        /**
        * Changes the disable state of the currently selected key
        * @method setCurrentDisabled
        * @param {Boolean} val
        */
        setCurrentDisabled: function (val) {
            /**
            * all of the keys
            * @private
            */
            var keys = scope.SurfKeys.Keys.getKeys(),
            /**
            * tree object
            * @private
            */
            tree = scope.keysTree.getTree(),
            /**
            * The id of the selected key
            * @private
            */
            currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));

            keys[currentId].disabled = val;
            if (scope.SurfKeys.Keys.isConflict(keys)) {
                alert('key already used');
                tree.view.selection.clearSelection();
                tree.view.selection.select(tree.currentIndex);
                return;
            }
            generateKeys(keys, tree.currentIndex);
            scope.SurfKeys.Keys.setKeys(keys);
        },
        /**
        * Updates all value of the current key
        * @method setCurrent
        * @param {Object} obj
        */
        setCurrent: function (obj) {
            /**
            * All of the keys
            * @private
            */
            var keys = scope.SurfKeys.Keys.getKeys(),
            /**
            * tree object
            * @private
            */
            tree = scope.keysTree.getTree(),
            /**
            * The id of the selected key row
            * @private
            */
            currentId = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
            keys[currentId].key = obj.key;
            keys[currentId].shift = obj.shift;
            keys[currentId].alt = obj.alt;
            keys[currentId].control = obj.control;
            keys[currentId].meta = obj.meta;
            if (scope.SurfKeys.Keys.isConflict(keys)) {
                alert('key config already used');
                tree.view.selection.clearSelection();
                tree.view.selection.select(tree.currentIndex);
            } else {
                generateKeys(keys, tree.currentIndex);
                scope.SurfKeys.Keys.setKeys(keys);
            }
        }
    };
    /**
    * Grabs pressed key combo and set to it the current command
    * @namespace Sk.Keys
    * @method grabKey
    * @param {Event} event A keypress event
    */
    scope.SurfKeys.Keys.grabKey = function (event) {
        event.preventDefault();
        event.stopPropagation();
        /**
        * The target element of the event
        * @private
        */
        var element = event.originalTarget,
        /**
        * An array to store wich modifiers are set
        * @private
        */
        modifiers = [],
        /**
        * A key object
        * @private
        */
        keys = {
            key: null,
            shift: false,
            alt: false,
            control: false,
            meta: false
        }, key;
        if (event.charCode) {
            key = String.fromCharCode(event.charCode).toUpperCase();
            keys.key = key;
        } else {
            return;
        }
        if (event.shiftKey) {
            modifiers.push('Shift');
            keys.shift = true;
        }
        if (event.altKey) {
            modifiers.push('Alt');
            keys.alt = true;
        }
        if (event.ctrlKey) {
            modifiers.push('Ctrl');
            keys.control = true;
        }
        if (event.metaKey) {
            modifiers.push("meta");
            keys.meta = true;
        }
        element.value = modifiers.length ? modifiers.join(' + ') + ' + ' : '';
        element.value += key.toUpperCase();
        KeysCommands.setCurrent(keys);
        return false;
    };
    SitesCommands = {
        /**
        * Sets the current value for the site
        * @param {String} val The url what should be the current site
        */
        setCurrentSite: function (val) {
            SitesCommands.siteSetCurrent('site', val);
        },
        /**
        * Sets the current value of the next property
        * @param {String} val the inner text of the next link
        */
        setCurrentNext: function (val) {
            SitesCommands.siteSetCurrent('next', val);
        },
        /**
        * Sets the current value of the previous property
        * @param {String} val the inner text of the previous link
        */
        setCurrentPrev: function (val) {
            SitesCommands.siteSetCurrent('prev', val);
        },
        /**
        * Sets the value for a specified field
        * @param {String} field The field name what should be changed
        * @param {String} value The new value
        */
        siteSetCurrent: function (field, val) {
            var tree, currentSite, site;
            /**
            * tree object
            * @private
            */
            tree = scope.sitesTree.getTree();
            /**
            * current site id
            * @private
            */
            currentSite = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
            /**
            * The current site object
            * @private
            */
            site = scope.SurfKeys.Sites.getSiteFromID(currentSite);
            if (!site) {
                site = scope.SurfKeys.Sites.createSite('', '', '');
            }
            if (['site', 'next', 'prev', 'id'].indexOf(field) > -1) {
                site[field] = val;
                if (site.site === '') {
                    scope.SurfKeys.Sites.removeSite(site.id);
                } else {
                    scope.SurfKeys.Sites.addSite(site);
                }
                generatePattern(null, tree.currentIndex);
            }
        },
        /**
        * Adds row to the tree
        */
        addSiteRow: function () {
            generatePattern();
            var tree = scope.sitesTree.getTree();
            tree.view.selection.select(tree.view.rowCount - 1);
        },
        /**
        * Deletes a row from the tree
        */
        delSiteRow: function () {
            SitesCommands.setCurrentSite('');
        },
        /**
        * Extending scope.SurfKeys.Sites object for preferences window
        */
        siteSelected: function () {
            var tree = scope.sitesTree.getTree(),
            currentIndex = tree.currentIndex,
            currentId,
            currentSite,
            currentNext,
            currentPrev,
            selectedSite = {
                id: tree.view.getCellText(currentIndex, tree.columns.getColumnAt(0)),
                site: tree.view.getCellText(currentIndex, tree.columns.getColumnAt(1)),
                next: tree.view.getCellText(currentIndex, tree.columns.getColumnAt(2)),
                prev: tree.view.getCellText(currentIndex, tree.columns.getColumnAt(3))
            };
            currentId = document.getElementById('sk-site-id');
            currentSite = document.getElementById('sk-site-name');
            currentNext = document.getElementById('sk-site-next');
            currentPrev = document.getElementById('sk-site-prev');
            currentSite.value = selectedSite.site;
            currentNext.value = selectedSite.next;
            currentPrev.value = selectedSite.prev;
        }
    };
    /**
    * @param {String} site
    */
    scope.SurfKeys.Sites.getSiteRow = function (site) {
        /**
        * tree object
        * @private
        */
        var tree = scope.sitesTree.getTree(),
        /**
        * first column of the tree object
        * @private
        */
        column = tree.columns.getColumnAt(0),
        i, rowCount;
        for (i = 0, rowCount = tree.view.rowCount; i < rowCount; i += 1) {
            if (tree.view.getCellText(i, column) === site) {
                return i;
            }
        }
        return 0;
    };
    /**
    * intialize the the values for the preference window
    */
    initPreferences = function () {
        document.getElementById('sk-current-key').addEventListener('keypress', scope.SurfKeys.Keys.grabKey, true);
        document.getElementById('sk-current-disabled').addEventListener('command', function () {
            KeysCommands.setCurrentDisabled(this.checked);
        }, false);
        document.getElementById('sk-keys-tree').addEventListener('select', function () {
            KeysCommands.keySelected();
        }, false);
        document.getElementById('sk-site-name').addEventListener('keyup', function () {
            SitesCommands.setCurrentSite(this.value);
        }, false);
        document.getElementById('sk-site-next').addEventListener('keyup', function () {
            SitesCommands.setCurrentNext(this.value);
        }, false);
        document.getElementById('sk-site-prev').addEventListener('keyup', function () {
            SitesCommands.setCurrentPrev(this.value);
        }, false);
        document.getElementById('sk-site-add').addEventListener('click', function () {
            SitesCommands.addSiteRow();
        }, false);
        document.getElementById('sk-site-remove').addEventListener('click', function () {
            SitesCommands.delSiteRow();
        }, false);
        document.getElementById('sk-resultpattern-tree').addEventListener('select', function () {
            SitesCommands.siteSelected();
        }, false);
        generateKeys();
        generatePattern();
    };
    window.addEventListener('load', initPreferences, false);
    window.addEventListener('dialogcancel', setAllWinKeys, false);
}());
