define(['oop/inherit', 'utils/visualapp', 'model/listmodel2', 'view/mosaicpresentation', 'shims/bind',
// 'net/simplexhr',
'data/static-strings', 'transport/request', 'transport/response',
'json/json', 'view/partials', 'oop/clone',
	'ui/nflist',
	'paths/jsonpaths',
	'tui/tui',
	'ui/popup',
	'ui/player'
], function(inherit, VisualApp, ListModel, MosaicPresentation, bind, strings,
request, response, json, Partials, cloner, NFList, jpaths, TUI, Dialogs, Player) {
	var ListApp = function(options) {
		VisualApp.call(this, options);
		this.numericTimeout_ = null;
		this.selectChannelIndex = '';
		if(options.datamodel) {
			this.model = new options.datamodel(this);
		} else {
			this.model = new ListModel(this);
		}
//		this.presentation = new NFList(this, this.model, 50);

		if (options.listType && options.listType !== 'mosaic' && options.listType  !== 'list' ) {
			this.presentation = new MosaicPresentation(this, options.listType, options.itemWidth, options.itemHeight, options.shouldJump);
		} else if ( window.BACKEND_CONFIG && typeof window.BACKEND_CONFIG['LIST_TYPE'] === 'string' && options.listType !== 'mosaic' && options.listType  !== 'list' ) {
			if ( window.BACKEND_CONFIG['LIST_TYPE'] === '0') {
				this.presentation = new NFList(this, this.model, 50);
			} else if ( window.BACKEND_CONFIG['LIST_TYPE'] === '1') {
				this.presentation = new Partials(this, 'mosaic', options.itemWidth, options.itemHeight, options.shouldJump);
			}
		} else {
			if (options.usePagination) {
				this.presentation = new Partials(this, options.listType, options.itemWidth, options.itemHeight, options.shouldJump);
			} else {
				this.presentation = new MosaicPresentation(this, options.listType, options.itemWidth, options.itemHeight, options.shouldJump);
			}
		}


		this.canResume = options.canResume;
		this.registerDisposable(this.model);
//		this.registerDisposable(this.presentation);
		this.generateDefaultEvents();
		this.appEvents.play = {
			name : 'play',
			func : bind(this.handlePlayButton, this),
			attached : false
		};

		this.on('start-requested', this.defaultStartRequested);
		this.on('show-requested', this.onShowScreen);
		this.on('selection-changed', this.onSelectionChanged);
		this.on('show-complete', this.onShowComplete);
		this.on('stop-requested', this.onStopRequested);
		this.on('data-load-end', this.onDataLoadEnd);
		this.on('try-play', this.onPlayRequest);
	};
	inherit(ListApp, VisualApp);
	ListApp.remoteKeys_ = ['left', 'right', 'up', 'down', 'chup', 'chdown', 'ok', 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'return', 'recall', 'star'];
	ListApp.prototype.onShowComplete = function() {
		this.attachEvents(true);
	};
	ListApp.prototype.getEPGByID = function() {
		return [];
	};
	ListApp.prototype.onPlayRequest = function(obj, resume) {
		var clone = cloner(obj);
        if ( !isNaN(parseInt(clone.id, 10)) ) {
            clone.title = '[' + clone.id + '] ' + ( clone.publishName || '');
        } else clone.title = (clone.publishName || '');
		clone.epg=[];
		Player.getInstance().play(clone, resume);
	};
	ListApp.prototype.onSelectionChanged = function(objectWithIndex) {
		this.model.currentIndex = objectWithIndex.index;
	};
	ListApp.prototype.onStopRequested = function() {
		this.model.unload();
		this.presentation.unload();
		this.attachEvents(false);
	};
	ListApp.prototype.onDataLoadEnd = function(data) {
		if(data.type === 'list') {
			this.fire('start-ready');
		} else if(data.type === 'folder') {
			this.presentation.show(undefined, true);
			if( typeof data.index !== 'undefined')
				this.presentation.activate(data.index);
			else if (this.model.pointer.length > 1)
				this.presentation.activate(1);
            else if (this.model.pointer.length === 1 )
                this.presentation.activate(0);
		}
	};
	ListApp.prototype.onShowScreen = function() {
		this.presentation.show(this.container, this.forceRedraw_);
		this.forceRedraw_ = false;
		if ( this.model.get().length > 0) this.presentation.activate(0);
	};
	ListApp.numerics_ = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
	ListApp.prototype.defaultRemoteKeyHandler = function(key) {
		if(ListApp.numerics_.indexOf(key) !== -1) {
			this.handleNumerics(key);
		} else if (key === 'star') {
			this.handleSortRequest();
		} else {
			if(this.numericTimeout_ !== null) {
				window.clearTimeout(this.numericTimeout_);
				this.numericTimeout_ = null;
				this.selectChannelIndex = '';
			}
			this.model.acceptEvent({
				type : 'remote',
				action : key
			});
		}
	};
	ListApp.prototype.handleNumerics = function(digit) {
		var nDigit = ListApp.numerics_.indexOf(digit);
		window.clearTimeout(this.numericTimeout_);
		this.selectChannelIndex += nDigit.toString();
		TUI.osdInstance.setContent(this.selectChannelIndex, 3);
		this.numericTimeout_ = window.setTimeout(bind(this.goToChannel, this), 3000);
	};
	ListApp.prototype.goToChannel = function(channelIndex) {
		var find = this.selectChannelIndex;
		this.selectChannelIndex = '';
		this.numericTimeout_ = null;
		var data = this.model.get();
		var i;
		for( i = 0; i < data.length; i++) {
			if(data[i].id == find) {
				this.model.selectByIndex(i);
				this.fire('try-play', this.model.getItem());
				break;
			}
		}
	};
	ListApp.prototype.defaultStartRequested = function() {
		if(!this.model.isLoaded || ( this.model.lastLoadedTS !== null && this.model.lastLoadedTS < TUI.getInstance().lastRefreshTimeStamp_)) {
			this.model.loadData({
				name : this.name,
				type : 'list'
			});
		} else {
			this.fire('start-ready');
		}
	};
	//Add default events for mosaic, can be then overwritten by children
	ListApp.prototype.generateDefaultEvents = function(list, boundFunction) {
		if(!this.appEvents)
			this.appEvents = {};
		if(!list)
			list = ListApp.remoteKeys_;
		if(!boundFunction)
			boundFunction = bind(this.defaultRemoteKeyHandler, this);
		list.forEach(bind(function(item) {
			this.appEvents[item] = {
				name : item,
				func : boundFunction,
				attached : false
			};
		}, this));
	};
	/**
	 * List the handled sort algorithms/criterias
	 *
	 * @type {Array.<string>}
	 */
	ListApp.sortAlgorithms_ = [ 'sortByIndex', 'sortByName' ];

	/**
	 * Handle user request to sort the listing, i.e. display sort mechanism option list and let the user select sorting
	 *
	 * @protected
	 */
	ListApp.prototype.handleSortRequest = function() {
		var options = [];
		ListApp.sortAlgorithms_.forEach(function( item ) {
			options.push( strings.lists.sorting[ item ] );
		});
		options.push( strings.components.dialogs.cancel );
		Dialogs.createDialog( 'optionlist', options, bind( this.handleSorting, this ), strings.lists.sorting.title );
	};

	/**
	 * Handle the user selection from the sort criteria dialog
	 *
	 * @param {number} selectedIndex The index of the option the user elected
	 */
	ListApp.prototype.handleSorting = function( selectedIndex ) {
		if ( selectedIndex >= ListApp.sortAlgorithms_.length ) return;
		this.model.sort( ListApp.sortAlgorithms_[ selectedIndex ] );
	};

	ListApp.prototype.handlePlayButton = function() {
		var objIndex = this.model.currentIndex;
		var item = this.model.getItem(objIndex);
        //avoid up links
        if ( item.id === null ) return;
		var options = [];
		var actions = [];
		options.push(strings.lists.play);
		actions.push('play');
		if (this.canResume === true) {
			options.push(strings.lists.resumePlay);
			actions.push('resume');
		}
		if(item.isBookmarked) {
			options.push(strings.lists.unbookmark);
			actions.push('unbookmark');
		} else {
			options.push(strings.lists.bookmark);
			actions.push('bookmark');
		}
		if(item.rating !== 'X') {
			if(item.isLocked) {
				options.push(strings.lists.unlock);
				actions.push('unlock');
			} else {
				options.push(strings.lists.lock);
				actions.push('lock');
			}
		}
		options.push(strings.components.dialogs.cancel);
		this.dialogInstance = {
			index : objIndex,
			object : item,
			options : options,
			actions : actions
		};
		Dialogs.createDialog('optionlist', this.dialogInstance.options, bind(this.handleDialogSelection, this), strings.components.dialogs.select);
	};
	ListApp.prototype.forceRedraw_ = false;
	ListApp.prototype.cancelData = function() {
		this.model.wipe();
		this.forceRedraw_ = true;
	};
	ListApp.prototype.handleDialogSelection = function(selectedIndex) {
		var action;
		if(this.dialogInstance) {
			this.dialogInstance.action = this.dialogInstance.actions[selectedIndex];
			switch (this.dialogInstance.action) {
				case 'lock':
				case 'unlock':
					Dialogs.createDialog('password', false, bind(this.acceptPass, this), strings.components.dialogs.lock);
					break;

				case 'bookmark':
				case 'unbookmark':
					this.acceptPass();
					break;
				case 'resume':
					this.fire('try-play', this.model.getItem(), true);
					this.dialogInstance = null;
					delete this.dialogInstance;
					break;
				case 'play':
					this.fire('try-play', this.model.getItem());
					this.dialogInstance = null;
					delete this.dialogInstance;
					break;
				default:
					this.dialogInstance = null;
					delete this.dialogInstance;
					break;
			}
		}
	};
	ListApp.prototype.acceptPass = function(val) {
		var urlconf = jpaths.getPath(this.dialogInstance.action);
		var url = {
			'run' : urlconf.run,
			'sig' : urlconf.sig,
			'type' : this.name.toUpperCase(),
			'id' : this.dialogInstance.object.id,
			'newif': 1
		};
		if(['lock', 'unlock'].indexOf(this.dialogInstance.action) !== -1) {
			url["password"] = val;
		}
		var req = request.create('calld', url);
        // Notify data structure for locking
        this.updateInProcess = true;
		response.register(req, bind(this.handleUpdate, this, this.dialogInstance.index, this.dialogInstance.action));
		req.send();
		this.dialogInstance.object = null;
		delete this.dialogInstance;
	};
	ListApp.prototype.handleUpdate = function(index, action, result) {
		var obj = this.model.getItem(index);
		var status = json.parse(result.content);
		if(status && status.status === 'OK') {
			switch (action) {
				case 'lock':
				case 'unlock':
					obj.isLocked = !obj.isLocked;
					break;
				case 'bookmark':
				case 'unbookmark':
					obj.isBookmarked = !obj.isBookmarked;
					break;
				default: break;
			}
			this.updateItem(index, obj);
		} else {
			Dialogs.createDialog('message', undefined, undefined, strings.lists.actionFailed);
		}
        // unlock data structure
        this.updateInProcess = false;
	};
	ListApp.prototype.updateItem = function( index, obj) {
		this.presentation.updateItem(index, obj);
	};
	ListApp.prototype.disposeInternal = function() {
		this.constructor.superClass_.disposeInternal.call(this);
		delete this.appEvents;
		delete this.numericTimeout_;
	};
	return ListApp;
});
