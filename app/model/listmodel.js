/**
 * @fileoverview Provides data view abstraction to work with listing data 
 * as provided from sysmaster servers
 */

define([
	'types/types', 
	'array/array',
	'oop/idisposable',
	'oop/inherit',
	'net/simplexhr',
	'shims/bind',
	'ui/simplescreenselector',
	'transport/request',
	'data/static-strings'
], function(types, array, Disposable, inherit, xhr, bind, appsel, request, strings){
	
    /**
     * Storage implementation
     * @param {ListingApp} The app the model should be attached to
     * @constructor
     */
	var Storage = function(app) {
		Disposable.call(this);
		this.app = app;
		this.history = [];
		this.currentIndex = 0;
		this.data = {
			list: [],
			dirs: {},
			epg: null
		};
		this.isLoaded = false;
		this.pointer = null;
		this.isLoading = false;
		this.bound = bind(this.loadDir, this);
		this.lastLoadedTS = null;
	};
	inherit(Storage, Disposable);
    
    /**
     * Loads the data from server
     * @param {Object} o Object
     */
	Storage.prototype.loadData = function(o) {
		var url = o.url || tui.options.paths.getPath(o.name, o.type);
		var that = this;
		xhr.get(url, function(text) {
			that.load(text, o);
		}, {
			parse: true
		});
		this.app.fire('data-load-start');
	};
    
    /**
     * Handle remote events, events might or might not be filtered at
     * Application level
     * @param {Object.<string>} ev Should contain at least the action
     */
	Storage.prototype.acceptEvent = function(ev) {
		if (this.isLoading) {
            return;
		}
		var step = this.app.presentation.getStep();
		var hstep = this.app.presentation.getHStep();

		switch(ev.action) {
		case 'chdown':
			if (this.currentIndex + (step * hstep) < this.pointer.length) {
				this.app.presentation.activate(this.currentIndex + (step * hstep));
			}
			break;
		case 'chup': 
			if (this.currentIndex - (step * hstep) >= 0) {
				this.app.presentation.activate(this.currentIndex - (step * hstep));
			}
			break;
		case 'right':
			if (step === 1) {
				if (this.data.epg !== null) {
					this.app.fire('epg-selection', true);
				} 
				return;
			}
			if (this.currentIndex + 1 < this.pointer.length) {
				this.app.presentation.activate(this.currentIndex + 1);
			}
			break;
		case 'left':
			if (step === 1) {  
				if (this.data.epg !== null) {
					this.app.fire('epg-selection', false);
				} 
				return;
			}
            if (this.currentIndex > 0 ) {
				this.app.presentation.activate(this.currentIndex -1 );
			}
			break;
		case 'down':
			if (this.currentIndex + step < this.pointer.length) {
				this.app.presentation.activate(this.currentIndex + step);
			}
			break;
		case 'up':
			if (this.currentIndex - step > -1) {
				this.app.presentation.activate(this.currentIndex - step);
			}
			break;	
		case 'ok':
			if (this.enterDir() === false) {
				if (this.getItem().id === null) {
					this.outDir();
				} else {
					this.app.fire('try-play', this.getItem());
				}
			}
			break;
		case 'return':
			if (this.pointer.length > 0  && this.pointer[0].id === null) {
				this.outDir();
			} else {
				appsel.show();
			}
			break;
		case 'recall':
			this.app.presentation.reset(true);
			this.app.Stop();
			var req = request.create('calld', {
				'run':'refresh_media_json'
			});
			req.send();
			tui.loadIndicator.show(strings.common.refresh + this.app.name.toUpperCase());
			break;
		default: break;
		}
	};
    
    /**
     * Selects the next item by its index 
     * @param {number}
     */
	Storage.prototype.selectByIndex = function(index) {
		if (index < this.pointer.length) {
			this.currentIndex = index;
			this.app.presentation.activate(this.currentIndex);
		}
	};
	/**
	 * Finds the next item that is not a dir and play it (should be called only
	 * in playback mode)
	 *
	 * Also skip folders and locked channels
	 *
	 * @private
	 */
	Storage.prototype.activateNextItem = function() {
		var index = this.currentIndex;
		var found = null;		
		for (index++ ; index < this.pointer.length; index++ ) {
			if (this.pointer[index].isDir === false && this.pointer[index].id !== null) {
				found = index;
				break;
			}
		}
		if (found === null) {
			index = 0;
			for (; index < this.currentIndex; index ++) {
				if (this.pointer[index].isDir === false && this.pointer[index].id !== null) {
					found = index;
					break;
				}
			}
		}
        if ( found !== null ) this.selectByIndex(found);
	};
    
    /**
     * Static sort methods to deal with the data structure reordering
     */
	Storage.sortById = function(a, b) {
		var ida = parseInt(a.id, 10);
		var idb = parseInt(b.id, 10);
		if (ida > idb) return 1;
		else if (ida < idb ) return -1;
		return 0;
	};
	Storage.sortByName = function(a,b) {
		var namea = a.publishName.toLowerCase();
		var nameb = b.publishName.toLowerCase();
		if (namea > nameb) {
			return 1;
		} else if (namea < nameb) return -1;
		else return 0;
	};
	Storage.sortByIndex = function(a, b) {
		var ba = (a.isBookmarked) ? 1 : 0;
		var bb = (b.isBookmarked) ? 1 : 0;
		var ia = parseInt(a.sortIndex, 10);
		var ib = parseInt(b.sortIndex, 10);
		if ( ba != bb ) {
			if ( ba < bb ) return 1;
			if ( ba > bb ) return -1;
			return 0;
		}
		if ( ia < ib ) return -1;
		if ( ia > ib ) return 1;
		return 0;
	};
    
    /**
     * Implements sorting of the loaded data
     * @param {string}
     */
	Storage.prototype.sort = function(byWhat) {
		if (this.pointer.length > 0 ) {
			this.pointer.sort(Storage[byWhat]);
			this.app.presentation.reset(true);
			this.app.fire('data-load-end', {
				type: (this.history.length > 0) ?  'folder': 'list'
			});
		}
	};
    
    /**
     * Finds the previous item in the list and activates it
     */
	Storage.prototype.activatePreviousItem = function() {
		var index = this.currentIndex - 1, found = null;
		for (; index >= 0; index--) {
			if (this.pointer[index].isDir === false && this.pointer[index].id !== null) {
				found = index;
				break;
			}
		}
		if (found === null) {
			index = this.pointer.length-1;
			for (; index > this.currentIndex; index--) {
				if (this.pointer[index].isDir === false && this.pointer[index].id !== null) {
					found = index;
					break;
				}
			}
		}
		if (found !== null) {
			this.selectByIndex(found);
		}
	};
    
    /**
     * Try to go up a folder, should be called only if there
     * really is a folder up, does not provides checks
     */
	Storage.prototype.outDir = function() {
		var toLoad = this.history.pop();
		this.pointer = toLoad.dir;
		this.app.fire('data-load-end', {
			type: 'folder',
			index: toLoad.index
		});		
	};
    
    /**
     * Try to load an innner folder
     * @return {boolean} true if folder load is started, false otherwise
     */
	Storage.prototype.enterDir = function() {
		var item = this.getItem();
		var url = {};
		if ( typeof item.isDir !== 'undefined' && item.isDir !== false) {
			this.isLoading = true;
			for (var k in item.isDir) {
				url[k] = item.isDir[k];
			}
			url.newif = 1;
			this.loadData({
				url: url,
				type: 'folder',
				callback: this.bound
			});
			return true;
		} else {
			return false;
		}	
	};
    
    /**
     * Loads a filder
     * @param {Object} data The listing for the dir
     */
	Storage.prototype.loadDir = function(data) {
		this.data.dirs[this.pointer[this.currentIndex].id] = data;
		this.history.push({
			dir: this.pointer,
			index: this.currentIndex
		});
		this.pointer = this.data.dirs[this.pointer[this.currentIndex].id];
		this.isLoading = false;
	};
    
    /**
     * Gets the current item or an item by its index
     * Index validity is not checked
     * @param {number} 
     */
	Storage.prototype.getItem = function(i) {
		var ii = (types.assert(i, 'number'))?i:this.currentIndex;
		return this.pointer[ii];
	};
	
    /**
     * General data getter
     * @param {string} what The type of data requested, 'list' or 'epg'
     *  list is assumed if not param is provided
     */
	Storage.prototype.get = function(what) {
		what = (types.assert(what,'string'))? what : 'list';
		if (what === 'list') {
			return this.pointer;
		} else if ( what === 'epg') {
			return this.data.epg;
		}
	};
	Storage.prototype.load = function(res, o) {
		if (res === null ) {
			throw {
				name: 'NetworkError',
				message: 'Cannot get requested URL : '
			};
		}
		switch (o.type) {
			case 'list':
				this.data.list = res;
				if (array.isEmpty(this.history)) this.pointer = this.data.list;
				this.isLoaded = true;
				this.lastLoadedTS = (new Date()).getTime();
				if (this.lastLoadedTS > tui.DATA_TS.LISTS) {
					this.pointer = this.data.list;
				}
				break;
			case 'folder':
				res.unshift({
					id: null,
					sortIndex: 0,
					publishName: "..",
					type: "",
					time: "",
					cost: 0.00,
					currency: null,
					genre: "FOLDER",
					thumbnail: "app/imgs/mosaic-folder.png",
					settings: function(){
						return false;
					},
					isLocked: false,
					isBookmarked: false,
					personalRecordingOptions: {canRecord: false},
					isDir: false
				});
				break;
			case 'epg':
				this.data.epg = res;
				break;
			default: break;
		}
		if (typeof o.callback === 'function') {
			o.callback(res);
		}
		this.app.fire('data-load-end', {
			type: o.type,
			app: this.app.name
		});
	};
    
	Storage.prototype.getPropertyFromItem = function(item, index) {
		var found = this.getItem(index);
		return found[item];
	};
    
	Storage.prototype.getEPGForItem = function(index) {
		if (this.data.epg === null) {
			return null;
		}
		var itemByID = this.getPropertyFromItem('id',index);
		return this.getEPGForItemByID( itemByID );
	};
	Storage.prototype.getEPGForItemByID = function( id ) {
		if ( this.data.epg[ id ]) return this.data.epg[id].body;
		return [];
	};
    
	Storage.prototype.unload = function(){};
	
    Storage.prototype.disposeInternal = function() {
		Storage.superClass_.disposeInternal.call(this);
		
	};
	return Storage;
});
	
