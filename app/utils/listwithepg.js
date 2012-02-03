define([
	'oop/inherit',
	'oop/idisposable',
	'utils/listingapp',
//	'utils/epg',
	'ui/epgvisual',
	'shims/bind',
	'tpl/infobuttons',
	'oop/clone',
    'utils/datetime',
    'dom/dom', 'datetime/xdate'
], function(inherit, Disposable, ListApp, Epg,bind, infobuttonstpl, cloner, datetime, dom, Xdate){
	var App = function(opts){
		ListApp.call(this, opts);
		this.epgInstance = new Epg(this.model, ListApp.remoteKeys_);
		this.hints = opts.hints || null;
		this.appEvents['info'] = {
			name: 'info',
			func: bind(function() {
				if (this.epgInstance.isVisible()) {
					this.epgInstance.hide();
					this.presentation.container_.style.display = 'block';
				} else {
					this.presentation.container_.style.display = 'none';
					this.epgInstance.show();
					this.epgInstance.selectRow( this.model.currentIndex );
				}
			},this),
			attached: false
		};
		this.appEvents.play = {
			name : 'play',
			func : bind(this.handlePlayButton, this),
			attached : false
		};
		//Override the OK event to handle EPG also
//		this.appEvents['ok'] = {
//			name: 'ok',
//			func: bind(function() {
//				if (this.epgInstance.isAttachedToDom()) {
//					this.epgInstance.enterListing(true);
//					this.epgInstance.attachEvents(true);
//				} else {
//					this.model.acceptEvent({
//						action: 'ok'
//					});
//				}
//			},this), 
//			attached: false
//		};
//		this.on('show-complete', this.showHints);
//
		this.on('epg-selection', this.onEpgSelection);
	};
	inherit(App, ListApp);
	App.prototype.handlePlayButton = function() {
		if (this.epgInstance.isVisible()) {
			return;
		} else {
			App.superClass_.handlePlayButton.call(this);
		}
	};
	App.prototype.onEpgSelection = function( bool ) {
		console.log('Epg direction',bool);
		if ( this.epgInstance.isVisible()) {
			this.epgInstance.selectEpg(bool);
		}
	};
	App.prototype.showHints = function() {
		if (this.hints) {
			tui.setPanels(false, true, undefined, infobuttonstpl.render({
				things: this.hints
			}));
		}
	};
	App.prototype.onSelectionChanged = function(obj) {
		this.constructor.superClass_.onSelectionChanged.call(this, obj);
		if (this.epgInstance.isVisible()) {
			this.epgInstance.selectRow(obj.index);
		}
	};
    
	/**
     * @deprecated
     */
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
	App.prototype.scheduleSwitch = function() {
        console.log('Takovata',arguments);
	};
	App.prototype.epgFrameSeparator_ = ' - ';
	App.prototype.onPlayRequest = function(obj,  resume ) {
		var clone = cloner( obj );
		var epgdata = this.model.get('epg')[ clone.id ].body;
		var epg = [], i;
        console.log('URAAAAAAAAAAA');
        if ( this.epgInstance.isVisible()) {
            if ( this.epgInstance.currentEpgElement_ !== null ) {
                var index = parseInt(dom.dataGet(this.epgInstance.currentEpgElement_, 'index'),10);
                var startTime = epgdata[ index ][1];
                if ( (Xdate.now()).isEarlierThan( startTime ) ) {
                    tui.createDialog('confirm',undefined, bind(this.scheduleSwitch), 'Shedule program switch');
                    return;
                } 
            } 
        }
        if ( epgdata.length > 0 ) {
            for (i = 0; i < epgdata.length; i++) {
                epg.push({
                    Prog: datetime.getParsedTime(epgdata[i][1]) + 
                        this.epgFrameSeparator_ + 
                        datetime.getParsedTime(epgdata[i][2]) + 
                        ' ' + epgdata[i][3]
                });
            }
        }
        clone.epg = epg;
        clone.title = clone.id + '. ' + clone.publishName;
        tui.globalPlayer.play(clone, resume);          


	};
	App.prototype.updateItem = function( index, obj ) {
		App.superClass_.updateItem.call( this, index, obj );
		if (this.epgInstance.isVisible()) {
			
		}
	};
	App.prototype.onStopRequested = function() {
		if (this.epgInstance.isVisible()) {
			this.epgInstance.hide();
			this.presentation.container_.style.display = 'block';
		}
		App.superClass_.onStopRequested.call(this);
	};
	return App;
	
});
