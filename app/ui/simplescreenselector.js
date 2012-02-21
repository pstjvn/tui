/**
* @module ui/simplescreenselector Simplified screen selector to work on older devices with less processing power, completely covers the functionality and can replace the original app selector, only it does not utilizes any transforamtion nor animations
* @requires 'tpl/appselector2','data/applist', 'dom/dom', 'dom/classes', 'utils/events', 'debug/console', 'utils/sizes'
*/

define(
	[ 'tpl/appselector2','data/applist', 'dom/dom', 'dom/classes', 'utils/events', 'utils/sizes', 'env/exports', 'array/array', 'json/json'],
function(tpl,applist, dom, classes, Mevents, sizes, exports, array, json) {

	var shortcuts;
	if ( window.localStorage.hasOwnProperty('shortcuts') ) {
		shortcuts = json.parse(window.localStorage.getItem('shortcuts'));
	} else {
		shortcuts = {};
	}

	var currenScreen, itemSize = 90, internalAppList = obj2array(applist), 
		padding = sizes.pixelate(sizes.getSizesForAppselector(90).padding), 
		DOM = dom.getInnerNodes(tpl.render({
			apps: internalAppList
		}));
	
	DOM.style.height = sizes.pixelate(sizes.getSizesForWindow().height);
	var SelectorState = false;
	var fillers = dom.$$('.filler', DOM);
	for (var i1 = 0; i1 < fillers.length; i1++ ) {
		fillers[i1].style.height = padding;
	}
	dom.$('.screen-selector-pointer', DOM).style.top = sizes.depixelate(padding) - 12 + 'px';
	currenScreen = dom.$('.approtator-item', DOM);
	

	function obj2array(obj) {
		var a = [], k;
		for (k in obj) {
			if (obj.hasOwnProperty(k)) {
				a.push(obj[k]);
			}
		} 
		return a;
	}
	
	function relocateTo(seq) {
		DOM.scrollTop =  (itemSize * seq);
	}
	function triggerScreen(bool){
		var dir = (bool)?'nextElementSibling':'previousElementSibling';
		if ( currenScreen[dir] !== null && classes.hasClass(currenScreen[dir], 'approtator-item')) {
			currenScreen =  currenScreen[dir];
			relocateTo(dom.dataGet(currenScreen, 'sequence'));
		}
	}
	
	function updateSelectedAppInUI( module ) {
		var i = 0, k, index;
		for ( k in applist ) {
			if ( applist[k] === module ) {
				index = i;
				break;
			}
			i++;
		}
		var all = dom.$$('.approtator-item', DOM);
		currenScreen = all[ index ];
	}
	
	function selectApp( module ) {
		if ( typeof module === 'string') {
			// we received key directly, find the cirrently visible
			// active screen and use it
			module = applist[dom.dataGet(currenScreen, 'appname')];
		}
		
		var a1 = dom.$('.obscure');
		if (a1 !== null) classes.removeClasses(a1, 'obscure');			
		hideDOM();
		tui.loadApp( module );		
	}
	
	function getState() {
		return SelectorState;
	}
	
	function saveShortCut( key ) {
		if (array.has( Mevents.getNumberEvent(), key )) {
			shortcuts[key] = dom.dataGet( currenScreen, 'appname' );
			window.localStorage.setItem( 'shortcuts',
				json.serialize( shortcuts )
			);
		}
		tui.signals.restoreEventTree( saveShortCut );
	}
	
	function addShortcutNow() {
		//steal events from global ev handler and expect number
		// if anything else comes restore global events
		// if number comes set shortcut and restore events
		tui.stealEvents( saveShortCut );
	}
	
	exports.exportSymbol('appselector', {
		name: 'getState',
		symbol: getState
	});
	
	function executeShortCut( key ) {
		if ( shortcuts[key] && applist[shortcuts[key]]) {
			updateSelectedAppInUI( applist[ shortcuts[ key ] ] );
			selectApp( applist[ shortcuts[ key ] ] );
		}
	}
	
	var moduleEvent = {
	// Handle numeric input for shortcuts
		one: {
			name: 'one',
			func: executeShortCut,
			attached: false
		},
		two: {
			name: 'two',
			func: executeShortCut,
			attached: false
		},
		three: {
			name: 'three',
			func: executeShortCut,
			attached: false
		},
		four: {
			name: 'four',
			func: executeShortCut,
			attached: false
		},
		five: {
			name: 'five',
			func: executeShortCut,
			attached: false
		},
		six: {
			name: 'six',
			func: executeShortCut,
			attached: false
		},
		seven: {
			name: 'seven',
			func: executeShortCut,
			attached: false
		},
		eight: {
			name: 'eight',
			func: executeShortCut,
			attached: false
		},
		nine: {
			name: 'nine',
			func: executeShortCut,
			attached: false
		},
		zero: {
			name: 'zero',
			func: executeShortCut,
			attached: false
		},
		//Handle other navigation
		up: {
			name: 'up',
			func: function(key){
				triggerScreen(false);
			},
			attached: false
		},
		down: {
			name: 'down',
			func: function(key){
				triggerScreen(true);
			},
			attached: false
		},
		hide: {
			name: 'info',
			func: hideDOM,
			attached: false
		},
		loadApp: {
			name: 'ok',
			func: selectApp,
			attached: false
		},
		addShortCut: {
			name: 'pound',
			func: addShortcutNow,
			attached: false
		}
//		loadiptv: {
//			name: 'video',
//			func: function() {
//				if (typeof applist['iptv'] === 'object') {
//					tui.loadApp(applist['iptv']);
//				}
//			},
//			attached: false,
//		},
//		loadonlineradio: {
//			name: 'setup',
//			func: function() {
//				if (typeof applist['radio'] === 'object') {
//					tui.loadApp(applist['radio']);
//				}
//			},
//			attached: false
//		},
//		loadsetup: {
//			name: 'setup',
//			func: function() {
//				if (typeof applist['setup'] === 'object') {
//					tui.loadApp(applist['setup']);
//				}
//			},
//			attached: false			
//		}
	};
	function showAppSel() {
			tui.setContainerVisibility(true);
			tui.setPanels(false, false);
			SelectorState = true;
			Mevents.addHandlers(moduleEvent);
			dom.adopt(document.body, DOM);
			relocateTo(dom.dataGet(currenScreen, 'sequence'));
			var a = dom.$('#maincontainer');
			if (a !== null) classes.addClasses(a, 'obscure');
	}
//	Create global selector binding (Home button) and subscribe it to the event handler, it should be always present
	var selectorBindings = {
		appselector: {
			name: 'home',
			func: showAppSel,
			attached: false
		}
	};
	Mevents.addHandlers(selectorBindings);
//	Hide the DOM from the screen, exposed in the context to allow calling from anywhere in the module
	function hideDOM() {
		Mevents.removeHandlers(moduleEvent);
		SelectorState =  false
		dom.dispose(DOM);
	}
//	Exports
	return {
		/**
		* @method remoteSelectScreen Exposes the app selection function to the global object to allow screen switch to occur on server side incentive
		* @param {String} apptag. The apptag as per applist for the desired screen
		* return {undefined}
		*/
//		TODO: Test the global screen switcher
		remoteSelectScreen: function(apptag) {
			for (var i = 0; i < internalAppList.length; i++ ) {
				if (internalAppList[i].apptag === apptag) {
					tui.setContainerVisibility(true);
					tui.setPanels(false, false);
					currenScreen = dom.$$('.approtator-item', DOM)[i];
					selectApp();
					return;
				}
			}
		},
		/**
		* @method show Exposes the onScreen initialization function for the global object should this one be needed
		* @return {undefined}
		*/
		show: showAppSel
	};
});
