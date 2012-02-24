/**
* @fileoverview Simplistic imp0lementation for the AppSelector
*/

define([ 
	'tpl/appselector2',
	'data/applist', 
	'dom/dom', 
	'dom/classes', 
	'utils/events', 
	'utils/sizes', 
	'env/exports', 
	'array/array', 
	'json/json', 
	'shims/bind',
	'debug/logger'
],function(tpl,applist, dom, classes, Mevents, sizes, exports, array, json,
bind, Logger) {
	
	function obj2array(obj) {
		var a = [], k;
		for (k in obj) {
			if (obj.hasOwnProperty(k)) {
				a.push(obj[k]);
			}
		} 
		return a;
	}

	var AppSelector = function() {
		this.shortCuts_ = {};
		this.currentScreen = null;
		this.controllerInstance_ = null;
		this.itemSize = 90;
		this.internalAppList = obj2array( applist );
		this.currentScreen = null;
		this.setupDom();
		this.boundShourtCutExecution = bind(this.executeShortCut, this);
		this.moduleEvent = {
		// Handle numeric input for shortcuts
			one: {
				name: 'one',
				func: this.boundShourtCutExecution,
				attached: false
			},
			two: {
				name: 'two',
				func: this.boundShourtCutExecution,
				attached: false
			},
			three: {
				name: 'three',
				func: this.boundShourtCutExecution,
				attached: false
			},
			four: {
				name: 'four',
				func: this.boundShourtCutExecution,
				attached: false
			},
			five: {
				name: 'five',
				func: this.boundShourtCutExecution,
				attached: false
			},
			six: {
				name: 'six',
				func: this.boundShourtCutExecution,
				attached: false
			},
			seven: {
				name: 'seven',
				func: this.boundShourtCutExecution,
				attached: false
			},
			eight: {
				name: 'eight',
				func: this.boundShourtCutExecution,
				attached: false
			},
			nine: {
				name: 'nine',
				func: this.boundShourtCutExecution,
				attached: false
			},
			zero: {
				name: 'zero',
				func: this.boundShourtCutExecution,
				attached: false
			},
			//Handle other navigation
			up: {
				name: 'up',
				func: bind(function(key){
					this.triggerScreen(false);
				}, this),
				attached: false
			},
			down: {
				name: 'down',
				func: bind(function(key){
					this.triggerScreen(true);
				}, this),
				attached: false
			},
			hide: {
				name: 'return',
				func: bind(this.hideDOMm, this),
				attached: false
			},
			loadApp: {
				name: 'ok',
				func: bind(this.selectApp, this),
				attached: false
			},
			addShortCut: {
				name: 'pound',
				func: bind(this.addShortcutNow, this),
				attached: false
			}
		};			
	};
	AppSelector.prototype.logger_ = new Logger('AppSelector');
	AppSelector.prototype.addShortcutNow = function() {
		if (AppSelector.boundSaveShirtCut === null ) {
			AppSelector.boundSaveShirtCut = bind( this.saveShortCut, this );
		}
		this.controllerInstance_.stealEvents( AppSelector.boundSaveShirtCut );
	};
	
	AppSelector.boundSaveShirtCut = null;
	
	AppSelector.prototype.saveShortCut = function( key ) {
		this.logger_.info('Received shortcut to save now')
		if ( array.has( Mevents.getNumberEvent(), key ) ) {
			this.shortCuts_[key] = dom.dataGet( this.currenScreen, 'appname' );
			window.localStorage.setItem( 'shortcuts',
					json.serialize( this.shortCuts_ ));
		}
		this.logger_.info('Try to restore events tree');
		this.controllerInstance_.restoreEventTree( AppSelector.boundSaveShirtCut );		
	};
	
	AppSelector.prototype.executeShortCut = function( key ) {
		if ( this.shortCuts_[key] && applist[this.shortCuts_[key]]) {
			this.updateSelectedAppInUI( applist[ this.shortCuts_[ key ] ] );
			this.selectApp( applist[ this.shortCuts_[ key ] ] );
		}
	};
	
	AppSelector.prototype.show = function() {
		this.showAppSel();
	};
	
	AppSelector.prototype.setControllerInstance = function( c ) {
		this.controllerInstance_ = c
	};
	
	AppSelector.prototype.setupDom = function() {
		this.padding = sizes.pixelate(sizes.getSizesForAppselector(90).padding);	
		this.DOM = dom.getInnerNodes(tpl.render({
			apps: this.internalAppList
		}));		
		this.DOM.style.height = sizes.pixelate(sizes.getSizesForWindow().height);
		var fillers = dom.$$('.filler', this.DOM);
		for (var i1 = 0; i1 < fillers.length; i1++ ) {
			fillers[i1].style.height = this.padding;
		}
		dom.$('.screen-selector-pointer', this.DOM).style.top = sizes.depixelate(this.padding) - 12 + 'px';
		this.currenScreen = dom.$('.approtator-item', this.DOM);
		this.baloon = dom.create('p', {
			classes: 'text-baloon'
		});
	};
	
	AppSelector.prototype.relocateTo = function( seq ) {
		this.DOM.scrollTop = (this.itemSize * seq);		
	};
	AppSelector.prototype.triggerScreen = function(bool){
		var dir = (bool)?'nextElementSibling':'previousElementSibling';
		if ( this.currenScreen[dir] !== null &&
					classes.hasClass(this.currenScreen[dir],
					'approtator-item')) {
			this.currenScreen =  this.currenScreen[dir];
			this.updateBaloonInfo( applist[ dom.dataGet( this.currenScreen, 'appname')].info );
			this.relocateTo(dom.dataGet(this.currenScreen, 'sequence'));
		}
	};
	
	AppSelector.prototype.updateBaloonInfo = function( text ) {
		if ( text && text.length > 0 ) {
			this.baloon.innerHTML = text;
			dom.adopt(this.baloon);
		} else {
			dom.dispose(this.baloon);
		}		
	};
	
	AppSelector.prototype.updateSelectedAppInUI= function( module ) {
		var i = 0, k, index;
		for ( k in applist ) {
			if ( applist[k] === module ) {
				index = i;
				break;
			}
			i++;
		}
		var all = dom.$$('.approtator-item', this.DOM);
		this.currenScreen = all[ index ];
	};
	AppSelector.prototype.selectApp = function( module ) {
		if ( typeof module === 'string') {
			// we received key directly, find the cirrently visible
			// active screen and use it
			module = applist[dom.dataGet(this.currenScreen, 'appname')];
		}
		
		var a1 = dom.$('.obscure');
		if (a1 !== null) classes.removeClasses(a1, 'obscure');			
		this.hideDOM();
		this.controllerInstance_.loadApp( module );		
	};
	
	AppSelector.prototype.hideDOM = function() {
		Mevents.removeHandlers(this.moduleEvent);
		this.SelectorState =  false;
		dom.dispose(this.DOM);
		this.updateBaloonInfo();		
	};
	AppSelector.prototype.isActive = function() {
		return this.SelectorState;
	};
	AppSelector.prototype.showAppSel = function() {
		if ( this.controllerInstance_ === null ) {
			throw Error('Global controller is not defined');
		}
		this.controllerInstance_.looseFocusForAppSelector();
		this.SelectorState = true;
		Mevents.addHandlers(this.moduleEvent);
		dom.adopt(document.body, this.DOM);
		this.relocateTo(dom.dataGet(this.currenScreen, 'sequence'));
		this.updateBaloonInfo( applist[ dom.dataGet( this.currenScreen, 'appname' ) ].info );
	};
	AppSelector.prototype.SelectorState = false;

	
	var instance = new AppSelector();
	// Setup global home key
	Mevents.addHandlers( {
		appselector: {
			name: 'home',
			func: bind(instance.showAppSel, instance),
			attached: false
		}
	});
	return instance;
//	var shortcuts;
//	if ( window.localStorage.hasOwnProperty('shortcuts') ) {
//		shortcuts = json.parse(window.localStorage.getItem('shortcuts'));
//	} else {
//		shortcuts = {};
//	}

//	var currenScreen, itemSize = 90, internalAppList = obj2array(applist), 
//		padding = sizes.pixelate(sizes.getSizesForAppselector(90).padding), 
//		DOM = dom.getInnerNodes(tpl.render({
//			apps: internalAppList
//		}));
	
//	DOM.style.height = sizes.pixelate(sizes.getSizesForWindow().height);
//	var SelectorState = false;
//	var fillers = dom.$$('.filler', DOM);
//	for (var i1 = 0; i1 < fillers.length; i1++ ) {
//		fillers[i1].style.height = padding;
//	}
//	dom.$('.screen-selector-pointer', DOM).style.top = sizes.depixelate(padding) - 12 + 'px';
//	currenScreen = dom.$('.approtator-item', DOM);
//	

//	function obj2array(obj) {
//		var a = [], k;
//		for (k in obj) {
//			if (obj.hasOwnProperty(k)) {
//				a.push(obj[k]);
//			}
//		} 
//		return a;
//	}
//	
//	function relocateTo(seq) {
//		DOM.scrollTop =  (itemSize * seq);
//	}
//	function triggerScreen(bool){
//		var dir = (bool)?'nextElementSibling':'previousElementSibling';
//		if ( currenScreen[dir] !== null && classes.hasClass(currenScreen[dir], 'approtator-item')) {
//			currenScreen =  currenScreen[dir];
//			updateBaloonInfo( applist[ dom.dataGet( currenScreen, 'appname')].info );
//			relocateTo(dom.dataGet(currenScreen, 'sequence'));
//		}
//	}
	
//	function updateSelectedAppInUI( module ) {
//		var i = 0, k, index;
//		for ( k in applist ) {
//			if ( applist[k] === module ) {
//				index = i;
//				break;
//			}
//			i++;
//		}
//		var all = dom.$$('.approtator-item', DOM);
//		currenScreen = all[ index ];
//	}
//	
//	function selectApp( module ) {
//		if ( typeof module === 'string') {
//			// we received key directly, find the cirrently visible
//			// active screen and use it
//			module = applist[dom.dataGet(currenScreen, 'appname')];
//		}
//		
//		var a1 = dom.$('.obscure');
//		if (a1 !== null) classes.removeClasses(a1, 'obscure');			
//		hideDOM();
//		ControllerInstance.loadApp( module );		
//	}
	
//	function getState() {
//		return SelectorState;
//	}
//	
//	function saveShortCut( key ) {
//		if (array.has( Mevents.getNumberEvent(), key )) {
//			shortcuts[key] = dom.dataGet( currenScreen, 'appname' );
//			window.localStorage.setItem( 'shortcuts',
//				json.serialize( shortcuts )
//			);
//		}
//		ControllerInstance.signals.restoreEventTree( saveShortCut );
//	}



	

	
	

//	Exports
//	return {
//		setControllerInstance: function( instance ) {
//			ControllerInstance = instance;
//		},
		/**
		* @method remoteSelectScreen Exposes the app selection function to the global object to allow screen switch to occur on server side incentive
		* @param {String} apptag. The apptag as per applist for the desired screen
		* return {undefined}
		*/
////		TODO: Test the global screen switcher
//		remoteSelectScreen: function(apptag) {
//			for (var i = 0; i < internalAppList.length; i++ ) {
//				if (internalAppList[i].apptag === apptag) {
//					ControllerInstance.setContainerVisibility(true);
//					ControllerInstance.setPanels(false, false);
//					currenScreen = dom.$$('.approtator-item', DOM)[i];
//					selectApp();
//					return;
//				}
//			}
//		},
//		/**
//		* @method show Exposes the onScreen initialization function for the global object should this one be needed
//		* @return {undefined}
//		*/
////		show: showAppSel,
////		isActive: function() {
////			return SelectorState;
////		}
//	};
});
