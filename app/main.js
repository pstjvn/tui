/**
* Configure the requirejs env
*/
require.config({
	baseUrl: "app",
	paths: {
		"types": "../library/js/types",
		"window": "../library/js/window",
		"utils/autoid": "../library/js/utils/autoid",
		"templates/compiler": "../library/js/templates/compiler",
		"support": "../library/js/support",
		"shims": "../library/js/shims",
		"oop": "../library/js/oop",
		"nls": "../library/js/nls",
		"net": "../library/js/net",
		"json": "../library/js/json",
		"loader": "../library/js/loader",
		"host": "../library/js/host",
		"env/exports": "../library/js/env/exports",
		"dom": "../library/js/dom",
		"debug": "../library/js/debug",
		"array": "../library/js/array",
		"text": "../library/js/text",
		"string": "../library/js/string",
		"datetime/xdate": "../library/js/datetime/xdate"
	},
	// Remove this URI bust for production env
	urlArgs: "bust=" + (new Date()).getTime()
});

//Require the response first because it provides global function that will be called from player and should be defined when calling request or player
require(['transport/response'], function (response) {
	window.transportReceiver = function(j) {
		response.recall(j);
	};
});

/**
 * Require the interface now
 * Basically we want to load the minimum set first to assure user 
 * notification for loading and then load everything needed
 * to start processing the user input and display things on screen
 */
require(['ui/throbber'], function(t) {
	// Define some options
	var options = {
		debug: true,
		nodejs: false,
		version: '0.1',
		useScale: false
	};
	// Fix the document dimenations and show loader first
	document.body.style.width = window.innerWidth + 'px';
	document.body.style.height = window.innerHeight + 'px';
	
	var loadIndicator = {
		show: function(text) {
			t.start({
				element: document.body,
				text: text || 'Loading TUI...'
			});
		},
		hide: function() {
			t.stop();
		}
	};
	loadIndicator.show();
	
	
	// After we are done with the loader, require some helpers 
	// and the main event dispatcher and start building the app
	require([
		'utils/events', 
		'dom/classes', 
		'dom/dom', 
		'ui/popup', 
		'shims/bind', 
		'ui/player',
		'transport/response',
		'appdebug/preload',
		'utils/osd',
        'transport/request',
        'ui/simplescreenselector',
        'array/array',
        // Put debug/logger on separate line to be able to strip it on build
        'debug/logger'
	], function(globalevents, classes, dom, Dialogs, bind, player, response, preloads, OSD, request, AS, array, 
	//Put Logger on separate line to be able to strip it on build
	Logger
) {
		// Let the response handler for transport layer 
		// know where to direct key presses on the remote
		response.setRemoteKeyHandler(globalevents.defaultEventAccepter);
		
		// Load images offscreen after we have loaded the deps 
		// to avoid trapping the JS in the max Concurent Reqs of the browsser
		dom.adopt(dom.create('div', {
			classes: 'tui-component tui-preloader',
			// List your images here!
			html: '<img src="app/imgs/icon_set.png">'
		}));
		
		// Now, while the images are loading, create the TUI
		// Create the main container
		dom.adopt(dom.create('div', {
			id: 'maincontainer',
			style: 'height: ' + window.innerHeight + 'px; width: ' + window.innerWidth + 'px; margin-top: 0; margin-bottom: 0'
		}));
		
		var tNow = (new Date()).getTime();
        
        /**
         * Call for system settings, ie. the settings made from the browser 
         * interface inherited from Carbon implementation for LIST/MOSAIC
         */
		var l1 = request.create('calld', {
			run: 'backend_json',
			newif: 1
		}); 
		response.register(l1, function(res) {
			if ( res.status == 'OK') {
                // Eval them in the global context as they do not include rjs 
                // wrpaper
				eval(res.content);
			}
		});
		l1.send();
		
		// Create the main Controller in global scope 
		// FIXME: Make TUI work in rjs context 
		window.tui = {
			//Always use logger_ and .logger_ to be able to strip those if needed
			logger_: new Logger('TUI Main'),
			DATA_TS: {
				CONFIG: tNow,
				LISTS: tNow
			},
			signals: {
                queue_: [],
				listingApp: ['iptv', 'vod', 'ppv', 'aod', 'radio'],
				refreshConfig: function() {
					tui.DATA_TS.CONFIG = (new Date()).getTime();
					if (tui.currentActiveApp.name === 'setup') {
						tui.currentActiveApp.reload();
					}
				},
				
				refreshLists: function() {
					tui.DATA_TS.LISTS = (new Date()).getTime();
					if (this.listingApp.indexOf(tui.currentActiveApp.name) !== -1) {
						tui.appModuleAdded(tui.currentActiveApp);
					}
				},
				
				restoreEventTree: function(fn) {
                    array.remove(this.queue_, fn);
                    if (array.isEmpty(this.queue_)) {
                        response.setRemoteKeyHandler( 
                        	globalevents.defaultEventAccepter
                        );
                        this.eventsAreFetched = false;
                    } else {
                        response.setRemoteKeyHandler( array.last(this.queue_) );
                    }
				},
                fetchEvents: function(fn) {
                    this.queue_.push(fn);
                    response.setRemoteKeyHandler(array.last(this.queue_));
                    this.eventsAreFetched = true;
                },
				eventsAreFetched: false

			},
			// Set the event handler to any function and overwrite the whole 
			// handler stack, the stack is preserved and can be restored
            stealEvents: function(newManager) {
                this.signals.fetchEvents(newManager);
			},
			
			osdInstance: new OSD(),
			// Preparation work for keyboard input from remote
			// with built-in kbd
			// This is not yet supported
			keyboardIgnoredKeys: [34, 8, 46, 37, 38, 39, 40, 13, 36],
			
			defaultKeyboardInputHandler: function(ev) {
				console.log(String.fromCharCode(ev.charCode));
			},
			
			keyboardInputHandler_: function() {},
			
			resetKeyboardInputHandler: function() {
				this.keyboardInputHandler_ = this.defaultKeyboardInputHandler;
			},
			
			setKeyboardInputHandler: function(method) {
				this.keyboardInputHandler_ = method;
			},
			
			// Export switching channels in player mode 
			fastSwitchChannels: function(up_down) {
				if (up_down === 'down')
					this.currentActiveApp.model.activateNextItem();
				else 
					this.currentActiveApp.model.activatePreviousItem();
			},
			
			// The global player instance, use global instance to allow
			// playing from any screen at any time, including remote playing 
			// start
			globalPlayer: new player(),
			
			// The default container for screen apps
			mainContainer: dom.$('#maincontainer'),
			
			// The load indicator pointer
			loadIndicator: loadIndicator,
			
			// The options defined
			options: options,
			
			// The currently active app instance
			currentActiveApp: null,
			
			// If we have an app that we are waiting to load for
			appRequested: false,
			
			appModuleAdded: function(app) {
				this.currentActiveApp = app;
				if (!window.exportedSymbols['appselector'].getState())
					app.Start();
			},
			
			// Exports the dialog creation to all modules
			// Unifies the dialog creation interface
			/**
			* @param {string} type The dialog type
			* @param {Array} options Optional list of visible options to present
			* @param {function} callback The function to execute when dialog is
				resolved
			* @param {string} title The title to use for the dialog
			* @patam {number} defaultOption The default option to select when
				multiple choices are available
			*/
			createDialog: function(type, options, callback, title, defaultOption ) {
				var dialog;
				if (type === 'optionlist') {
					dialog = new Dialogs.OptionList(type, options, callback, title, defaultOption);
				} else if (['input', 'password', 'text'].indexOf(type) !== -1  ) {
					dialog = new Dialogs.Text(type, options, callback, title);
				} else if (type === 'confirm') {
					dialog = new Dialogs.Confirm(type, true, callback, title);
				} else if (type === 'ip') {
					dialog = new Dialogs.IPBox(type, undefined, callback, title);
				} else if (type === 'message') {
					dialog = new Dialogs.MessageBox(type, title);
				}
                dialog.show();
			},
			setPanels: function(top, bottom, opt_topContent, opt_bottomContent) {
				return;
				if (top) {
					if (opt_topContent) {
						this.panels.top.innerHTML = opt_topContent;
					}
					this.panels.top.style.top = '0px';
					this.mainContainer.style.marginTop = '40px';
				} else {
					this.panels.top.style.top = '-40px';
					this.mainContainer.style.marginTop = '0px';
					this.panels.top.innerHTML = '';
				}
				if (bottom) {
					if (opt_bottomContent) {
						this.panels.infoBlock.innerHTML = opt_bottomContent;
					}
					this.panels.bottom.style.bottom = '0px';
					this.mainContainer.style.marginBottom = '40px';
				} else {
					this.panels.bottom.style.bottom = '-40px';
					this.mainContainer.style.marginBottom = '0px';
					this.panels.infoBlock.innerHTML = '';
				}
			},
			// Adds possibility to scale down the main container so another 
			// UI component can take the visual focus
			// DO NOT USE on M55, only on newer device for speed reasons
			scaleContainer: function(bool) {
				if (bool) {
					//calculate for 20%
					if (this.options.useScale) {
						console.log('SET SCALE');
						this.mainContainer.className = 'scaled';
						var x = parseInt(this.mainContainer.style.width, 10);
						var y = parseInt(this.mainContainer.style.height, 10);
						var x1 = parseInt(((x * 20) / 100), 10);
						var y1 = parseInt(((y * 20) / 100), 10);
						var moveX = parseInt(x / 2, 10) - parseInt(x1 / 2, 10);
						//var moveY = parseInt(y/2) - parseInt(y1/2);
						var res = "scale(0.2) translateX(" + moveX * 5 + "px)"; 
						//  + "translateY(-" + moveY * 5 + "px)"
						this.mainContainer.style.webkitTransform = res;
						this.mainContainer.style.MozTransform = res;
					} else {
						this.mainContainer.style.visibility = 'hidden';
					}
				} else {
					if (this.options.useScale) {
						this.mainContainer.className = '';
						this.mainContainer.style.MozTransform = 'scale(1)';
						this.mainContainer.style.webkitTransform = "scale(1)";

					} else {
						this.mainContainer.style.visibility = '';
					}
				}
			},
			
			// Sets the main container opacity, useful to focus the user attn to
			// another UI component, currently used by the app selector
			setContainerVisibility: function(bool) {
				if (bool) {
					this.mainContainer.style.opacity = 0.2;
				} else {
					this.mainContainer.style.opacity = 1;
				}
			},
			
			// Take care of the apps
			apps: {
				signals: function(signaltype, opts) {
					switch (signaltype) {
					case 'ready':
						if (tui.currentActiveApp.name === opts.name) {
							tui.loadIndicator.hide();
							tui.setContainerVisibility(false);
							tui.currentActiveApp.Show(tui.mainContainer);
						}
						break;
					case 'restore-event-stack':
						tui.signals.restoreEventTree();
						break;
					default: 
						break;
					}
				}
			},
			
			loadApp: function(appobj) {
				this.loadIndicator.show('Loading ' + appobj.name + '...');
				if (this.currentActiveApp !== null) {
					if (typeof this.currentActiveApp.Pause === 'function') {
						this.currentActiveApp.Pause();
					} else {
						this.currentActiveApp.Stop();
					}
				}
				require([appobj.module], function(appmodule) {
					tui.appModuleAdded(appmodule);
				});
			},
			
			// TODO: implement direct screen selection, same as shortcuts
			selectApp: function(apptag) {
				console.log('Go select an app')
				AS.remoteSelectScreen( apptag === 'video' ? 'iptv' : apptag === 'audio' ? 'radio': apptag );
			}
		};
		
		
		/**
		* Define globally accessable keys
		* All keys defined here will be available by default and if not 
		* overridden by the active app
		*/
		globalevents.addHandlers({
			/** 
			* Handle the player visibility/activity
			*/
			globalreturn: {
				name: 'display',
				func: function() {
					if (tui.globalPlayer.getState() !== player.STATES.STOPPED) {
						tui.stealEvents(tui.globalPlayer.keyHandler);
						if (!tui.globalPlayer.useVisualPlayer_) {
							tui.globalPlayer.setVState(player.VSTATE.OPAQUE);
						} else {
                            tui.globalPlayer.visualPlayer.focus(true);
						}
					}
				},
				attached: false
			},
			/**
			* Handle stopping of player from everywhere
			*/
			globalstop: {
				name: 'stop',
				func: function() {
					tui.globalPlayer.stop();
				},
				attached: false
			},
			/**
			* Handle direct screen choosing
			*/
			loadiptv: {
				name: 'video',
				func: tui.selectApp,
				attached: false,
			},
			loadonlineradio: {
				name: 'audio',
				func: tui.selectApp,
				attached: false
			},
			loadsetup: {
				name: 'setup',
				func: tui.selectApp,
				attached: false			
			}
		});

		/**
		 * Setup global window event for keyboard input and always 
		 * route this to tui handlers, useful for debugggin in browser env
		 */
		window.addEventListener('keypress', function(ev) {
			tui.keyboardInputHandler_(ev);
		}, false);
		window.addEventListener('keydown', function(ev) {
			var key;
			console.log(ev.keyCode);
			switch (ev.keyCode) {
				case 8:
					//backspace
					key = 'return';
					break;
				case 46:
					key = 'delete';
					break;
				case 37:
					key = 'left';
					break;
				case 38:
					key = 'up';
					break;
				case 39:
					key = 'right';
					break;
				case 40:
					key = 'down';
					break;
				case 13:
					key = 'ok';
					break;
				case 36:
					key = 'home';
					break;
				case 33:
					// page up
					key = 'chup';
					break;
				case 34: 
					// page down
					key = 'chdown';
					break;
                case 73: //info
                    key = 'info';
                    break;
				default:
					return;
			}
			window.transportReceiver({ 
		        "header": { 
		        "type": "event", 
		        "tag": "0000000000", 
		        "method": "remote", 
		        "tstamp": 1322144158.278165   
		        }, 
		        "event": { 
		            "key": key 
		        }    
		    });
		});
		
		
		if (tui.options.debug) {
			window.DEBUG = {
				popup: false
			};
		}
		
		
		//Self invoking with timeout function to update the clock every minute
		//TODO: Export it as it might need to be reset from the backend
		var updateClock = (function() {
			var clockElementRer = null;
			var timeout;
			function format(txt) {
				var mysecs = (txt % 60).toString();
				if (mysecs.length < 2) mysecs = "0" + mysecs;
				return mysecs;
			}
			return function(el) {
				if (el) clockElementRer = el;
				if (timeout) {
					clearTimeout(timeout);
				}
				var d = new Date();
				var timestring = d.getDate() + '/' + (d.getMonth() + 1).toString() + '/' + d.getFullYear() + '&nbsp;' + d.getHours() + ':' + format(d.getMinutes());
				clockElementRer.innerHTML = timestring;
				timeout = setTimeout(updateClock, 60000);
			};
		})();


		
		tui.panels = {
			top: dom.create('div', {
				classes: 'tui-component panels top-panel',
				style: 'top : -40px;'
			}),
			bottom: dom.create('div', {
				classes: 'tui-component panels bottom-panel',
				style: 'bottom: -40px'
			})
		};
		
		//Setup clock 
		tui.panels.bottom.appendChild(dom.create('div', {
			html: '<h1></h1>',
			classes: 'tui-component tui-systemclock'
		}));
		
		//Start clock
		updateClock(dom.$('.tui-systemclock h1', tui.panels.bottom));		
		
		//Setup info block in panel
		tui.panels.infoBlock = dom.create('div', {
			classes: 'tui-component tui-infoblock'
		});
		tui.systemClock = updateClock;
		
		//Attach pannels
		dom.adopt(tui.panels.bottom, tui.panels.infoBlock);
		dom.adopt(tui.panels.top);
		dom.adopt(tui.panels.bottom);
		
		/**
		* Utiliti function to preload some modules if needed,
		* avoid this as it will slow down loading and do not use it in
		* production, the code should be compiled instead
		*/
		function preloadApps() {
//			require(preloads.preloadsModules, function(varargs) {
//				console.log('Modules loaded...');
//			});
		}
		
		function loadTUI() {
			require(['ui/simplescreenselector'], function(Mappsel) {
				require(['transport/response'], function(response) {
					require([
						'app/paths/jsonpaths.js', 
						'data/applist', 
						'ui/player', 
						'tpl/infobuttons', 
						'ui/telephone',
						'debug/log-keeper',
						'debug/simple-console'
					], function( paths, apps, player, itpl, Phone, LogKeeper, SimpleConsole ) {
						if ( tui.options.debug ) {
							LogKeeper.getInstance().setLogLevel( LogKeeper.Levels.ALL );
							(new SimpleConsole()).enable();
						}
						tui.player = player;
						tui.options.paths = paths;
						tui.phone = Phone;
						preloadApps();
						tui.loadIndicator.hide();						
//						Signal to backend that we are ready to receive signals
						alert("app://dmcready");
						/**
						* Load an app screen directly after start, if you
						* want to use this option disable the showing
						* of the app selector on start, which is the default 
						* behavior
						*/
//						tui.loadApp({
//							name: 'Start',
//							apptag: 'start',
//							module: 'apps/start',
//							icon: 'imgs/start_screen_icon.png'
//						});
						/**
						* Coment this line if you want to load a default app
						* in your STB implementation
						*/
						Mappsel.show();
						/**
						* This is useful only if you use panels
						* diabled by default
						*/
//						tui.setPanels(false, true, false, itpl.render({
//							things: {
//								home: 'Home'
//							}
//						}));
					});
				});

			});
		}
		loadTUI();
	});
});

