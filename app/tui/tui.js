define([
	'debug/logger',
	'utils/datetime',
	'utils/osd',
	'dom/dom',
	'dom/classes',
	'ui/load-indicator',
	'data/static-strings',
	'ui/simplescreenselector',
	'config/options',
	'paths/jsonpaths',
	'shims/bind',
	'array/array',
	'transport/response',
	'utils/events',
	'ui/player',
	'env/exports'
], function(Logger, dt, Osd, dom, classes, LoadIndicator, strings, AppSelector,
ConfigOptions, Paths, bind, array, Response, RemoteEvents, Player, exports) {

	var tui = function(options) {
		this.lastRefreshTimeStamp_ = dt.getCurrentTime();
		this.mainContainer = dom.$('#maincontainer');
		this.options = options;
		this.currentActiveApp = null;
		this.appRequested = false;
		this.paths_ = Paths;
		this._queue_ = [];
	};
	
	
	tui.listingApp = ['iptv', 'vod', 'ppv', 'aod', 'radio', 'uservideo'];
	tui.prototype.getPaths = function() {
		return this.paths_;
	};
	tui.prototype.getGlobalPlayer = function() {
		return Player.getInstance();
	};
	tui.prototype.restoreEventTree = function( fn ) {
		this.logger_.warn('Removing an event');
		array.remove(this._queue_, fn);
		if (array.isEmpty(this._queue_)) {
			this.logger_.warn('Event que clean, restore defaults');
            Response.setRemoteKeyHandler( RemoteEvents.defaultEventAccepter);
            this.eventsAreFetched = false;
        } else {
            Response.setRemoteKeyHandler( array.last(this._queue_) );
        }
	};
	tui.prototype.eventsAreFetched = false;
	tui.prototype.init = function() {
		LoadIndicator.hide();
		AppSelector.setControllerInstance( this );
		AppSelector.show();
	};
	tui.prototype.logger_ = new Logger('TUI');
	tui.keyboardIgnoredKeys = [34, 8, 46, 37, 38, 39, 40, 13, 36];
	tui.osdInstance = Osd.getInstance();

	/** 
	* handle keyboard for cases when the user has remote with kbd (the new models)
	*/
	tui.defaultKeyboardInputHandler = function(ev) {
		this.logger_.ok(String.fromCharCode(ev.charCode));
	};
	tui.prototype.keyboardInputHandler_ = function() {};
	tui.prototype.resetKeyboardInputHandler = function() {
		this.keyboardInputHandler_ = tui.defaultKeyboardInputHandler;
	};
	tui.prototype.setKeyboardInputHandler = function( method ) {
		this.keyboardInputHandler_ = method;
	};
	tui.prototype.currentAppHasModelWithChannels = function() {
		if ( this.currentActiveApp ) {
			if ( this.currentActiveApp.model ) {
				if (this.currentActiveApp.model.activateNextItem || 
					this.currentActiveApp.model.activatePreviousItem )
					return true;
			}
		}
		return false;
	};
	tui.prototype.fastSwitchChannels = function(up_down) {
		if ( this.currentAppHasModelWithChannels()) {
			if (up_down === 'down')
				this.currentActiveApp.model.activateNextItem();
			else 
				this.currentActiveApp.model.activatePreviousItem();		
		}
	};
	tui.prototype.appModuleAdded = function(app) {
		this.currentActiveApp = app;
		if ( !AppSelector.isActive() ) {
			app.Start();
		}
	};
	tui.prototype.panelsAreEnabled = function() {
		if ( this.options && this.options.PANELS_ENABLED ) return true;
		return false;
	};
	tui.prototype.useContainerScale = function() {
		if ( this.options && this.options.USE_SCALE ) return true;
		return false;
	};
	tui.prototype.setPanels = function(top, bottom, opt_topContent, opt_bottomContent) {
		if ( this.panelsAreEnabled() ) {
			if (top) {
				if (opt_topContent) {
					tui.panels.top.innerHTML = opt_topContent;
				}
				tui.panels.top.style.top = '0px';
				this.mainContainer.style.marginTop = '40px';
			} else {
				tui.panels.top.style.top = '-40px';
				this.mainContainer.style.marginTop = '0px';
				tui.panels.top.innerHTML = '';
			}
			if (bottom) {
				if (opt_bottomContent) {
					tui.panels.infoBlock.innerHTML = opt_bottomContent;
				}
				tui.panels.bottom.style.bottom = '0px';
				this.mainContainer.style.marginBottom = '40px';
			} else {
				tui.panels.bottom.style.bottom = '-40px';
				this.mainContainer.style.marginBottom = '0px';
				tui.panels.infoBlock.innerHTML = '';
			}
		}
	};
	tui.prototype.scaleContainer = function( bool )  {
		var container = this.mainContainer;
		if (bool) {
			//calculate for 20%
			if (this.useContainerScale()) {
				container.className = 'scaled';
				var x = parseInt(this.mainContainer.style.width, 10);
				var y = parseInt(this.mainContainer.style.height, 10);
				var x1 = parseInt(((x * 20) / 100), 10);
				var y1 = parseInt(((y * 20) / 100), 10);
				var moveX = parseInt(x / 2, 10) - parseInt(x1 / 2, 10);
				//var moveY = parseInt(y/2) - parseInt(y1/2);
				var res = "scale(0.2) translateX(" + moveX * 5 + "px)"; 
				//  + "translateY(-" + moveY * 5 + "px)"
				container.style.webkitTransform = res;
				container.style.MozTransform = res;
			} else {
				container.style.visibility = 'hidden';
			}
		} else {
			if (this.useContainerScale()) {
				container.className = '';
				container.style.MozTransform = 'scale(1)';
				container.style.webkitTransform = "scale(1)";

			} else {
				container.style.visibility = '';
			}
		}		
	};
	tui.prototype.loadApp = function( appobj ) {
		LoadIndicator.show(strings.common.load_indication + appobj.name + '...');
		if (this.currentActiveApp !== null) {
			if (typeof this.currentActiveApp.Pause === 'function') {
				this.currentActiveApp.Pause();
			} else {
				this.currentActiveApp.Stop();
			}
		}
		require([appobj.module], bind(function(appmodule) {
			this.appModuleAdded(appmodule.init());
		}, this));		
	};
	tui.prototype.getContainer = function() {
		return this.mainContainer;
	};
	
	tui.prototype.setContainerVisibility = function(bool) {
		if (bool) {
			this.mainContainer.style.opacity = 0.2;
		} else {
			this.mainContainer.style.opacity = 1;
		}		
	};
	
	tui.prototype.stealEvents = function( fn ) {
    	if (!array.has(this._queue_, fn)) {
            this._queue_.push(fn);
            Response.setRemoteKeyHandler(array.last(this._queue_));
            this.logger_.warn('Events are now stolen');
            this.eventsAreFetched = true;               		
    	}		
	};
	
	tui.prototype.showApp = function( ) {
		LoadIndicator.hide();
		this.setContainerVisibility( false );
		this.currentActiveApp.Show(this.getContainer());
	};
	tui.prototype.looseFocusForAppSelector = function() {
		this.setContainerVisibility( true );
		this.setPanels( false, false );
		classes.addClasses( this.getContainer(), 'obscure' );
	};
    tui.prototype.refreshLists = function() {
        this.logger_.warn('refreshing the list');
        this.lastRefreshTimeStamp_ = dt.getCurrentTime();
        if ( array.has( tui.listingApp, this.currentActiveApp.name ) ) {
			this.currentActiveApp.cancelData();
            this.appModuleAdded( this.currentActiveApp );
        }
    };
	tui.prototype.handleAppSignals = function(type, opts) {
		switch ( type ) {
			case 'ready':
				if (this.currentActiveApp.name === opts.name) {
					this.showApp();
				}
				break;
			case 'restore-event-stack':
			//FIXME; Use internal signals
				this.restoreEventTree();
				break;
			default: break;
		}	
	};

	
	if ( ConfigOptions.PANELS_ENABLED) {
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
	}
	tui.instance_ = null;
	
	tui.getInstance = function() {
		if (tui.instance_===null) {
			tui.instance_ = new tui(ConfigOptions);
			exports.exportSymbol('tui', {
				name: 'instance',
				symbol: tui.instance_
			});
		}
		return tui.instance_;
	};
	
	tui.prototype.selectApp = function(key) {
		var apptag = ( key === 'video') ? 'iptv' : (key === 'audio') ? 'radio': key;
		AppSelector.remoteSelectScreen( apptag );
	};
		
	return tui;
});
