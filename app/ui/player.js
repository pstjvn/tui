/**
 * Implements general purpose global player that integrates the HW player
 * found on the Tornado devices in the UI
 */

define([
	'transport/request',
	'shims/bind',
	'data/static-strings',
	'utils/events',
	'array/array',
	'tpl/audio-player',
	'dom/dom',
	'oop/mix',
    'utils/datetime',
    'debug/logger',
    'ui/popup',
    'utils/osd',
    'env/exports'
], function(request, bind, strings, events, array, tpl,  dom, mix, 
datetime, Logger, Dialogs, Osd, exports) {
    
    /**
     * Define your theme here if you do not want to use the backend provided one
     */
	var Theme = {
		"fontname" :  "Tahoma",
        "fontsize" :  15,
        "timefmt" : "us"
	};

	//
	// TODO: finish implementation for recording
	// 
	/**
	* Global player object to handle all playback in DSP
	* @constructor
	*/
	var Player = function() {
		this.state = Player.STATES.STOPPED;
		this.keyHandler = bind(this.handleKeys, this);
		this.timeout_ = null;
		this.history_ = null;
		this.current_ = null;
		this.playlist_ = null;
		this.shufflePlayList_ = false;
		this.visualPlayer = this.createPlayer();
		this.vstate_ = Player.VSTATE.OPAQUE;
	};
	Player.prototype.logger_ = new Logger('UIPlayer');
	Player.prototype.recording_ = false;
	Player.prototype.setRecording = function( bool ) {
		this.recording_ = bool;
	};
	/**
	 * Status if we should use the visual player, usually with audio files.
	 * @type {boolean}
	 * @private
	 */
	Player.prototype.useVisualPlayer_ = false;
	/**
	 * The parental password used on the particular device
	 * @type {string}
	 * @private
	 */
	Player.prototype.parentalPassword = '';
	/**
	* Internal player statuses, translated from DSP signals
	* @define
	* @static
	* @private
	*/
	Player.STATES = {
		STOPPED: 0,
		PLAYING: 1,
		PAUSED: 2
	};
	/**
	 * Indicates the player visibility, this is only for video player
	 *
	 * @enum {number}
	 * @private
	 */
	Player.VSTATE = {
		OPAQUE: 0,
		TRANSLUSENT: 1
	};
	/**
	* The strings returned by transport layer as player status
	* @define
	* @static
	*/
	Player.dspStates = {
		stopped: Player.STATES.STOPPED,
		started: Player.STATES.PLAYING,
		finished: Player.STATES.STOPPED,
		nodata: Player.STATES.STOPPED,
		paused: Player.STATES.PAUSED,
		unpaused: Player.STATES.PLAYING,
		buffering: Player.STATES.PLAYING,
		playing: Player.STATES.PLAYING,
		error: Player.STATES.STOPPED
	};
	Player.prototype.vstateName_ = 'display';
	Player.prototype.createPlayer = function() {
		var that = {};
		that.dom = dom.getInnerNodes(tpl.render({ }));
        that.trackname_ = '';
		that.trackName = dom.$('.audio-title', that.dom);
		that.timeIndicator = dom.$('.audio-time', that.dom);
		that.progressBar = dom.$('.audio-fill-bar', that.dom);
		that.statusIndicator = dom.$('.audio-icons div', that.dom);
        that.focus = function(bool) {
            if ( bool ) {
                this.dom.style.opacity = 1;
            } else {
                this.dom.style.opacity = 0.5;
            }
        };
		that.update = function( name, elapsedTime, duration ) {
            
            var progress = 0,
                timeString = '',
                elapsedTime = parseInt( elapsedTime, 10),
                duration = parseInt( duration, 10),
                updateEls = [this.timeIndicator],
                updateName = false;
                
            if ( !isNaN( elapsedTime ) ) {
                timeString += datetime.parseTimeFromSeconds(elapsedTime);
                if (!isNaN( duration ) && duration > 0 ) {
                    timeString += ' - ';
                    timeString += datetime.parseTimeFromSeconds( duration );
                    progress = parseInt( (elapsedTime / duration) * 100 , 10);
                    timeString += ' (' + progress + '%)';
                }
            } else {
                timeString = '0 / ' + (isNaN( duration ) || duration===0) ? '0': duration;
            }
            this.timeIndicator.textContent = timeString;
            if ( name !== undefined && name !== this.trackname_ ) {
                this.trackname_ = name;
                this.trackName.textContent = this.trackname_;
                updateName = true;
            }
            if ( updateName ) {
                updateEls.push(this.trackName);
            }
			this.progressBar.style.left = ( -100 + progress ) + '%';
		};
		that.clean = function() {
			this.update( '', 0, 0);
		};
		that.setState = function(iconclass) {
			this.statusIndicator.className = iconclass;
		};
		return that;

	};
	Player.prototype.getVState = function() {
		return this.vstate_;
	};
	Player.prototype.setVState = function(state) {
		var req = request.create('display', { 'page': ( state === Player.VSTATE.OPAQUE ) ? 'media' : 'ui' });
		req.send();
	};
	Player.prototype.setOSDState = function(state) {
		var item = this.current_[0];
		switch (state) {
			case 'started':
			case 'playing':
				if (this.useVisualPlayer_) {
					this.visualPlayer.setState('play');
				} else {
					Osd.getInstance().setContent(strings.player.states.playing + item.title, 5, 'play');
				}
				break;
			case 'buffering':
				Osd.getInstance().setContent(strings.player.states.buffering + item.title, 5, 'buffering');
				break;
			case 'paused':
				if (this.useVisualPlayer_) {
					this.visualPlayer.setState('pause');
				} else {
					Osd.getInstance().setContent(strings.player.states.paused, 5, 'pause');
				}
				break;
			default: break;
		}
	};
	/**
	* Sets the current status of the player, act on change
	* @private 
	* @param {Player.dspStates.*} state A state representation from DSP 
	*/
	Player.prototype.setState = function(state) {
		var old_state = this.state;
		if ( Player.AUDIO_TYPES.indexOf( this.current_[0]['type']) === -1   ) {
			this.setOSDState(state);
		}
		this.state = Player.dspStates[state];
        if (this.state === Player.STATES.STOPPED ) 
        	exportedSymbols.tui.instance.restoreEventTree(this.keyHandler);
            //exportedSymbols.tui.instance.restoreEventTree(this.keyHandler);
		if (old_state !== this.state) {
			if (this.state === Player.STATES.STOPPED) {
				this.disableVisual();
			} else if (this.state === Player.STATES.PLAYING) {
				exportedSymbols.tui.instance.stealEvents(this.keyHandler);
//				exportedSymbols.tui.instance.stealEvents(this.keyHandler);
				if ( Player.AUDIO_TYPES.indexOf( this.current_[0]['type']) !== -1 ) {

					this.enableVisual(this.current_[0]['publishName']);
					this.visualPlayer.setState('play');
				}
			}
		}
	};

	Player.fastSwitchKeys = ['zero', 'one','two','three','four','five','six','seven','eight','nine'];
	/**
	* Handler for the remote events when they are routed to the played (i.e. state is playing/paused)
	* @param {!String} key The remote key issued in remote/kbd
	*/
	Player.prototype.handleKeys = function(key) {
		if (Player.fastSwitchKeys.indexOf(key)!==-1) {
			events.defaultEventAccepter(key);
		}
		// This use of tui instance is NOT correct as the current app
		// Might NOT have model... 
		switch (key) {
			case 'up':
			case 'down':
				if ( exportedSymbols.tui.instance.currentAppHasModelWithChannels()) {			
					if (key === 'up') {
						exportedSymbols.tui.instance.currentActiveApp.model.activatePreviousItem();
					} else {
						exportedSymbols.tui.instance.currentActiveApp.model.activateNextItem();
					}
					if (this.timeout_ !== null) {
						clearTimeout(this.timeout_);
					}
					var newItemToPlay = exportedSymbols.tui.instance.currentActiveApp.model.getItem();
					this.timeout_ = window.setTimeout(function() { 
						exportedSymbols.tui.instance.currentActiveApp.fire('try-play', newItemToPlay);
					}, 500);
				}
				break;
			case 'stop':
				this.stop();
				break;
			case 'play':
				this.pause();
				break;
			case 'display':
				if (this.state !== Player.STATES.STOPPED) {
					exportedSymbols.tui.instance.restoreEventTree(this.keyHandler);
					if (!this.useVisualPlayer_) {
						this.setVState( Player.VSTATE.TRANSLUSENT ) ;
					} else {
                        this.visualPlayer.focus(false);
					}
				}
				break;
			case 'recall':
				this.alterChannels();
				break;
			case 'power': 
				break;
			case 'rec':
				this.record();
				break;
			default:
				return;
		}
	};
	Player.prototype.defaultRecordingPath = '/mnt/usb/';
	Player.prototype.pathSeparator = '/';
	Player.prototype.record = function(AVObject) {
		if (!AVObject) {
			object = this.current_[0];
		} else {
			object = AVObject;
		}
		if (object.personalRecordingOptions && object.personalRecordingOptions.canRecord) {
			var now = new Date();
			var path = this.defaultRecordingPath + object.publishName;
			path += this.pathSeparator;
			path += now.getFullYear();
			path += this.pathSeparator;
			path += (now.getMonth() + 1);
			path += this.pathSeparator;
			path += now.getDate();
			path += this.pathSeparator;
			path += (now.getHours() + ':' + now.getMinutes());
		} else {
			return;
		}
	};
	Player.AUDIO_TYPES = ['radio', 'music', 'useraudio'];
	Player.VIDEO_TYPES = ['iptv', 'ppv', 'vod', 'uservideo'];
	Player.IMAGE_TYPES = ['userpicture'];
	Player.prototype.alterChannels = function() {
		this.logger_.ok(this.history_);
		if (this.history_ && this.history_.length === 2) {
			this.stop();
			this.play.apply(this, this.history_);
		}
	};
	/**
	* Returns the current state, should be compared to Player.STATES
	* @return {Player.STATES.!}
	*/
	Player.prototype.getState = function() {
		return this.state;
	};
	Player.prototype.playAll = function(dataSource, shuffle) {
		this.playlist_ = dataSource;
		this.shufflePlayList_ = shuffle;
	};
	Player.responseRegistry = null;
	Player.setResponseRegistry  = function( responseRegistry ) {
		Player.responseRegistry = responseRegistry;
	};
	/**
	* Try to play object from listings
	* @param {Object} obj A channel/Video/Audio object with playURI property
    * @param {boolean} resume Should we try to resume
	* @param {?String} password The password the user has enetered when queried about the parental lock pass
	*/
	Player.prototype.play = function(obj, resume, password, should_pay) {
		this.logger_.fine('Try to play uri:',
		obj.playURI,
		'pass',
		password,
		'shoul resume',
		resume);
		
		var newreq;
		if (obj.isLocked) {
			//Prevent event stealing, set state manually so that when the event comes it 
			//does not restore the event handler but leave it to the lock screen
			if (this.state !== Player.STATES.STOPPED) {
				this.state = Player.STATES.STOPPED;
				this.stop();
			}
			if (this.parentalPassword === '') {
				newreq = request.create('calld', {
					run: 'get_cfgval_json',
					section: 'streaming',
					'var': 'lockpass'
				});
				Player.responseRegistry.register(newreq, bind(this.setParentalPass, this));
				newreq.send();
			}
			if (typeof password !== 'string') {
				Dialogs.createDialog('password', false, bind(this.play, this, obj, resume), strings.components.dialogs.lock);
				return;
			}
			else if ( password !== this.parentalPassword ) {
				Dialogs.createDialog('message', undefined, undefined, strings.components.dialogs.wrongPassword);
				return;
			}
		}
        if ( typeof obj.cost !== 'undefined' && obj.cost > 0 ) {
            if (typeof should_pay === 'undefined' ) {
                if (this.state !== Player.STATES.STOPPED) {
    				this.state = Player.STATES.STOPPED;
    				this.stop();
    			}
                Dialogs.createDialog( 'confirm', null, bind( this.play, this, obj, resume, password),
                    strings.components.dialogs.confirmPay + obj.cost + obj.currency + '<br>'+obj.publishName
                );
                return;
            } else {
                if ( should_pay !== 1 )
                    return;
	        }
        }
        
		var play_command = (obj.player ? 'play_youtube':'play');
		var isAudio = false;
        
        
		this.addToHistory( [obj, password] );
        this.notifyOSD( obj );
		if (array.has(Player.AUDIO_TYPES, obj.type)) {
			this.enableVisual(obj.publishName);
			isAudio = true;
		} else if ( array.has(Player.VIDEO_TYPES, obj.type )) {
			this.disableVisual();
		}

		newreq = request.create(play_command, {"url": obj.playURI, 'resume': resume, 'audio': isAudio});
		Player.responseRegistry.register(newreq, bind(this.requestResultHandle, this,  
		exportedSymbols.tui.instance , obj.title, 'play') );
		newreq.send();
	};
	Player.prototype.notifyOSD = function( obj ) {
		mix( obj, Theme);
		this.logger_.fine('Notify osd', obj);
		var req = request.create('mediainfo', obj);
		req.send( obj );
	};
	/**
	 * Call when we want to show visual player, usually when we start playing audio
	 * @param {string} title Optional title for the playing track
	 */
	Player.prototype.enableVisual = function(title) {
		this.logger_.fine('Enable visual mode of player')
		this.useVisualPlayer_ = true;
		dom.adopt(this.visualPlayer.dom);
        this.visualPlayer.focus(true);
		this.visualPlayer.update( title );
	};
	/**
	 * Called when we stop playback, clean the mess after the previous track
	 */
	Player.prototype.disableVisual = function() {
		this.useVisualPlayer_ = false;
		dom.dispose(this.visualPlayer.dom);
		this.visualPlayer.clean();
	};
	Player.prototype.addToHistory = function(newSet) {
		this.history_ = this.current_;
		this.current_ = newSet;
	};
	/**
	* Set the parent lock password to the one provided by the backend
	* @private
	* @param {Object} obj Object containting the content returned and the status
	*/
	Player.prototype.setParentalPass = function(obj) {
		if (obj.content) {
			this.parentalPassword = obj.content;
		}
	};
	/**
	* Check status and if it is different from internal stopped, attempt stop signal on transport layer
	*/
	Player.prototype.stop = function(callback) {
//		if (this.state !== Player.STATES.STOPPED) {
			var newreq = request.create('stop', {});
			newreq.send();
//		}
	};
	/**
	* Handle pause / unpause
	*/
	Player.prototype.pause = function() {
		var newreq = request.create('pause',{ });
		newreq.send();

	};
	/**
	* Handle for the request result (i.e. transport layer debug, no useful application yet)
	* @param {JSONObject} data The data returned by transport layer response
	*/
	Player.prototype.requestResultHandle = function( tui, title, icon) {
		Osd.getInstance().setContent(strings.player.states.starting + title, 10, icon);
	};
	/**
	* Handles the events coming from transport layer communication, called via tui.globalPlayer.handleEvent, no need for context
	* @param {JSONObject} JSONObj The event object comming from transport layer ({event>state}-the player state)
	*/
	Player.prototype.handleEvent = function(JSONObj) {
		switch (JSONObj['header']['method']) {
		case 'media':
			this.setState(JSONObj.event.state);
			break;
		case 'player':
			this.handlePlaybackInfo(JSONObj['event']);
			break;
		default: break;
		}
	};
	Player.prototype.handlePlaybackInfo = function(event) {
//		var audio = event['has_audio'] || false;
//		var video = event['has_video'] || false;
		if (this.useVisualPlayer_) {
			this.visualPlayer.update( undefined, event['current_position'], event['duration']);
		}
		
	};
	// Notify osd for theme
//    var r = request.create('set_osdcolors', {
//    	"textcolor" : "#FFFFFF",
//        "bgcolor" : "#00000000",
//        "hlcolor" : "#9f00004c",
//        "barcolor" : "#9f00004c",
//        "bordercolor" : "#004c00",
//        "seekbarcolor" : "#ffff00",
//        "titlecolor" : "#ffff00",
//        "opacity" : 0.85
//    });
//    r.send();
	Player.instance_ = null;
	Player.getInstance = function() {
		if (Player.instance_ === null) Player.instance_ = new Player();
		return Player.instance_;
	}

	return Player;
});
