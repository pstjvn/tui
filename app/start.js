

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

// Fix the document dimenations and show loader first
document.body.style.width = window.innerWidth + 'px';
document.body.style.height = window.innerHeight + 'px';

require([
	'ui/load-indicator',
	'config/options',
	'dom/dom',
	'transport/response',
	'transport/request',
	'tui/tui',
	'utils/events',
	'ui/player',
	'debug/log-keeper',	
	'debug/simple-console',	
	'ui/simplescreenselector'
	
	// From here on the preloading is forced
	// Do preload some useful files
	// DO NOT preload app files as server side 
	// settings will be ignored as the apps are loaded immediately
	, 'apps/youtube',
	'apps/weather',
	'ui/epgvisual',
	'tpl/infobuttons',
	'utils/listwithepg',
	'utils/framedapp',
	'utils/multiscreenjson',
	'utils/miniscreenjson',
	'utils/scrollable',
	'tpl/setupminiscreen',
	'tpl/setup_chooser',
	'apps/iptv',
	'apps/aod',
	'apps/games',
	'apps/ppv',
	'apps/radio',
	'apps/setup',
	'apps/uvideo',
	'apps/vod',
	'apps/weather',
	'apps/youtube'
], function(LoadIndicator, ConfigOptions, dom, Response, Request, TUI, RemoteEvents, Player,
LogKeeper, SimpleConsole, AppSelector) {
	// Show loading indication to user first thing
	LoadIndicator.show();
	//Create the main container and put it on the page
	dom.adopt(dom.create('div', {
		id: 'maincontainer',
		style: 'height: ' + window.innerHeight + 'px; width: ' + window.innerWidth + 'px; margin-top: 0; margin-bottom: 0'
	}));
	// Export global JSON communication channel
	window.transportReceiver = function(j) {
		Response.recall(j);
	};
	
	var getServerConfig = Request.create('calld', {
		run: 'backend_json',
		newif: 1
	});
	Response.register(getServerConfig, function(res) {
		if ( res.status == 'OK') {
            // Eval them in the global context as they do not include rjs 
            // wrpaper
			eval(res.content);
		}
	});
	getServerConfig.send();
	/**
	 * Setup global window event for keyboard input and always 
	 * route this to tui handlers, useful for debugggin in browser env
	 */
	window.addEventListener('keypress', function(ev) {
		tui.keyboardInputHandler_(ev);
	}, false);
	window.addEventListener('keydown', function(ev) {
		var key;
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
	
	var tui = TUI.getInstance();
	var __startBrowser = function(key) {
		if ( key == 'display') {
			(Request.create('display', { 'page': 'ui' })).send();
			exportedSymbols.tui.instance.restoreEventTree(__startBrowser);
		}
	};
	RemoteEvents.addHandlers({
		/** 
		* Handle the player visibility/activity
		*/
		globalreturn: {
			name: 'display',
			func: function() {
				var plr = tui.getGlobalPlayer();
				if ( plr.getState() !== Player.STATES.STOPPED ) {
					tui.stealEvents( plr.keyHandler );
					if ( ! plr.useVisualPlayer_ ) {
						plr.setVState( Player.VSTATE.OPAQUE );
					} else {
                        plr.visualPlayer.focus( true );
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
				tui.getGlobalPlayer().stop();
			},
			attached: false
		},
		/**
		* Handle direct screen choosing
		*/
		loadiptv: {
			name: 'video',
			func: tui.selectApp,
			attached: false
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
		},
		loadWebBrowser: {
			name: 'web',
			func: function() {
				(Request.create('display', { 'page': 'browser' })).send();
				exportedSymbols.tui.instance.stealEvents(__startBrowser);
			},
			attached: false
		}
	});
	
	AppSelector.saveShortCut_( 'setup', 'setup' );
	AppSelector.saveShortCut_( 'video', 'iptv' );
	AppSelector.saveShortCut_( 'audio', 'radio' );
	
	Response.setRemoteKeyHandler(RemoteEvents.defaultEventAccepter);
	if (ConfigOptions.DEBUG) {
		LogKeeper.getInstance().setLogLevel( LogKeeper.Levels.ALL );
		(new SimpleConsole()).enable();
	}
	
	tui.init();
	
	alert("app://dmcready");
});
