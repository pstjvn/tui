define([
	'oop/inherit',
	'oop/idisposable',
	'utils/listingapp',
	'utils/epg',
	'shims/bind',
	'tpl/infobuttons',
	'oop/clone',
    'utils/datetime'
], function(inherit, Disposable, ListApp, Epg,bind, infobuttonstpl, cloner, datetime){
	var App = function(opts){
		ListApp.call(this, opts);
		this.epgInstance = new Epg(this.model, ListApp.remoteKeys_);
		this.hints = opts.hints || null;
		this.appEvents['info'] = {
			name: 'info',
			func: bind(function() {
				if (this.epgInstance.isAttachedToDom()) {
					this.epgInstance.exitDom();
				} else {
					this.epgInstance.load();
					this.epgInstance.enterDom();					
				}
			},this),
			attached: false
		};
		//Override the OK event to handle EPG also
		this.appEvents['ok'] = {
			name: 'ok',
			func: bind(function() {
				if (this.epgInstance.isAttachedToDom()) {
					this.epgInstance.enterListing(true);
					this.epgInstance.attachEvents(true);
				} else {
					this.model.acceptEvent({
						action: 'ok'
					});
				}
			},this), 
			attached: false
		};
		this.on('show-complete', this.showHints);
	};
	inherit(App, ListApp);
	App.prototype.showHints = function() {
		if (this.hints) {
			tui.setPanels(false, true, undefined, infobuttonstpl.render({
				things: this.hints
			}));
		}
	};
	App.prototype.onSelectionChanged = function(obj) {
		this.constructor.superClass_.onSelectionChanged.call(this, obj);
		if (this.epgInstance.attachedToDom_) {
			this.epgInstance.load(obj.index);
		}
	};
	
	App.prototype.getEPGByID = function( obj ) {
		if ( obj && obj.id ) {
			var epg = this.model.getEPGForItemByID( obj.id );
			var currIndex = Epg.findCurrentProgramIndex( epg );
			if ( currIndex < 0 ) return [];
			return epg.slice( currIndex, epg.length);

		} else {
			return App.superClass_.getEPGByID.call( this );
		}
	};
	
	App.prototype.defaultStartRequested = function() {
		this.constructor.superClass_.defaultStartRequested.call(this);
		if (this.model.data.epg === null) {
			this.model.loadData({
				name: this.name,
				type: 'epg'
			});
		}
	};
	
	App.prototype.epgFrameSeparator_ = ' - ';
	App.prototype.onPlayRequest = function(obj,  resume ) {
		var clone = cloner( obj );
		var epgdata = this.getEPGByID( clone );
		var epg = [], i;
		if ( epgdata.length > 0 ) {
			for ( i = 0; i < epgdata.length; i++ ) {
				epg.push({
					Prog: datetime.getParsedTime( epgdata[i][1]) + this.epgFrameSeparator_  + 
					datetime.getParsedTime( epgdata[i][2] ) + ' ' +  epgdata[i][3]
				});
			}
		}
		clone.epg = epg;
        clone.title = clone.id + '. ' + clone.publishName;
		tui.globalPlayer.play(clone, resume);
	};
	
	App.prototype.onStopRequested = function() {
		if (this.epgInstance.isAttachedToDom()) {
			this.epgInstance.exitDom();
		}
		App.superClass_.onStopRequested.call(this);
	};
	return App;
	
});
