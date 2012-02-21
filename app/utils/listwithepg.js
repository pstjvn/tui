define([
	'oop/inherit',
	'utils/listingapp',
	'ui/epgvisual',
	'shims/bind',
	'tpl/infobuttons',
	'oop/clone',
    'utils/datetime',
    'dom/dom', 
    'datetime/xdate',
    'transport/request', 
    'transport/response',
    'json/json',
    'data/static-strings'
], function(inherit, ListApp, Epg, bind, infobuttonstpl, cloner, datetime, dom, Xdate,
request, response, json, strings){
	var App = function(opts){
		ListApp.call(this, opts);
		this.epgInstance = new Epg(this.model, ListApp.remoteKeys_);
		this.hints = opts.hints || null;
		this.appEvents.info = {
			name: 'info',
			func: bind(function() {
				console.log('And index is ;',this.model.currentIndex)
				if (this.epgInstance.isVisible()) {
					this.epgInstance.hide();
					this.presentation.unhide();
					this.presentation.activate( this.model.currentIndex );
				} else {
					this.epgInstance.show();
					this.epgInstance.selectRow( this.model.currentIndex );
					this.presentation.unload();
				}
			},this),
			attached: false
		};
		this.appEvents.play = {
			name : 'play',
			func : bind(this.handlePlayButton, this),
			attached : false
		};
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
	App.prototype.scheduleSwitch = function(chanid, epgrecord, should) {
        console.log('Takovata',arguments);
        if ( should === 1) {
            var req = request.create('calld', {
                'run' : 'sched_save_json',
			    'sig' : 'save_tv_scheduler',
                'chan' : chanid,
                'stime' : epgrecord[1],
                'etime' : epgrecord[2],
                'newif' : 1,
                'action' : 1
            });
            response.register(req, bind(this.handleScheduleSave, this));
            req.send();
        }
        
    };
    App.prototype.handleScheduleSave = function(res) {
        console.log( 'Handle save schedule ', arguments );
        if ( res.status === 'OK' ) {
            var cont = json.parse(res.content);
            if ( cont.status !== 'OK' ) {
                tui.createDialog( 'message', undefined, undefined, strings.screens.iptv.errors.cannotSchedule );
            } else {
                tui.createDialog( 'message', undefined, undefined, strings.screens.iptv.errors.scheduled );
            }
        } else {
            tui.createDialog( 'message', undefined, undefined, strings.screens.iptv.errors.cannotSchedule );
        }
    };
	App.prototype.epgFrameSeparator_ = ' - ';
	App.prototype.onPlayRequest = function(obj,  resume ) {
		var clone = cloner( obj ), epgdata = null;
        var epgraw = this.model.get('epg')[clone.id];
        if ( epgraw ) epgdata = epgraw.body;
		var epg = [], i;
        if ( this.epgInstance.isVisible()) {
            if ( this.epgInstance.currentEpgElement_ !== null && epgdata !== null ) {
                var index = parseInt(dom.dataGet(this.epgInstance.currentEpgElement_, 'index'),10);
                var startTime = epgdata[ index ][1];
                if ( (Xdate.now()).isEarlierThan( startTime ) ) {
                    tui.createDialog('confirm',undefined, bind(this.scheduleSwitch, this, clone.id, epgdata[index]), 'Shedule program switch');
                    return;
                } 
            }
        }
        if ( epgdata !== null && epgdata.length > 0 ) {
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
//			TODO: implement update channel record in EPG view
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
