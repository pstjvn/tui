define([
	'transport/request',
	'transport/response',
	'shims/bind',
	'data/static-strings',
	'utils/events',
	'array/array',
	'tpl/audio-player',
	'text!css/audio-player.css',
	'loader/loader',
	'dom/dom',
	'oop/mix',
    'utils/datetime'
], function(request, response, bind, strings, events, array, tpl, css, loader, dom, mix, datetime) {
	//loader.loadCSSFromText( css );
//	var Theme = {
//		"fontname" : window.BACKEND_CONFIG.THEME.fontname || "Tahoma",
//        "fontsize" : window.BACKEND_CONFIG.THEME.fontsize || 15,
//        "timefmt" : window.BACKEND_CONFIG.THEME.timefmt || "us"
//	};
	var Theme = {
		"fontname" :  "Tahoma",
        "fontsize" :  15,
        "timefmt" : "us"
	}

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
	* @private
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
	//
	// Player.prototype.requestVState = function(state) {
	// 	var page;
	// 	switch (state) {
	// 		case Player.VISIBILITY.VISIBLE:
	// 			page = 'media';
	// 			break;
	// 		case Player.VISIBILITY.TRANSLUSENT: 
	// 			
	// };
	// 
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
                if (!isNaN( duration ) ) {
                    timeString += ' - ';
                    timeString += datetime.parseTimeFromSeconds( duration );
                    progress = parseInt( (elapsedTime / duration) * 100 , 10);
                    timeString += ' (' + progress + '%)';
                }
            } else {
                timeString = '0 / ' + (isNaN( duration )) ? '0': duration;
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
		var item = this.current_[0], id = '';
		if (item.id.length < 5)
            if ( !isNaN( parseInt( item.id ) ) ) {
                id = '[' + item.id + '] ';
            } else id = '';
		switch (state) {
			case 'started':
			case 'playing':
				if (this.useVisualPlayer_) {
					this.visualPlayer.setState('play');
				} else {
					tui.osdInstance.setContent(strings.player.states.playing + id + item.publishName, 5, 'play');
				}
				break;
			case 'buffering':
				tui.osdInstance.setContent(strings.player.states.buffering + id +  item.publishName, 5, 'buffering');
				break;
			case 'paused':
				if (this.useVisualPlayer_) {
					this.visualPlayer.setState('pause');
				} else {
					tui.osdInstance.setContent(strings.player.states.paused, 5, 'pause');
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
		if ( Player.AUDIO_TYPES.indexOf( this.current_[0]['type']) === -1   ) 
			this.setOSDState(state);
		this.state = Player.dspStates[state];
		if (old_state !== this.state) {
			if (this.state === Player.STATES.STOPPED) {
				tui.signals.restoreEventTree();
				this.disableVisual();
			} else if (this.state === Player.STATES.PLAYING) {
				tui.stealEvents(this.keyHandler);
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
		switch (key) {
			case 'up':
			case 'down':
				if (key === 'up') {
					tui.currentActiveApp.model.activatePreviousItem();
				} else {
					tui.currentActiveApp.model.activateNextItem();
				}
				if (this.timeout_ !== null) {
					window.clearTimeout(this.timeout_);
				}
				this.timeout_ = window.setTimeout(function() { 
					tui.currentActiveApp.fire('try-play', tui.currentActiveApp.model.getItem());
				}, 500);
				break;
			case 'stop':
				this.stop();
				break;
			case 'play':
				this.pause();
				break;
			case 'display':
				if (this.state !== Player.STATES.STOPPED) {
					tui.signals.restoreEventTree();
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
//				console.log('This is the player now accepting all events');
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
			console.log('Configured path', path);
		//
		// var newreq = request.create('record',{
		// 	'status':'start',
		// 	'path': path
		// });
		// 
		} else {
			return;
		}
	};
	Player.AUDIO_TYPES = ['radio', 'music', 'useraudio'];
	Player.VIDEO_TYPES = ['iptv', 'ppv', 'vod', 'uservideo'];
	Player.IMAGE_TYPES = ['userpicture'];
	Player.prototype.alterChannels = function() {
		console.log(JSON.stringify(this.history_));
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
	/**
	* Try to play object from listings
	* @param {Object} obj A channel/Video/Audio object with playURI property
	* @param {?String} password The password the user has enetered when queried about the parental lock pass
	*/
	Player.prototype.play = function(obj, resume, password) {
		console.log('Try to play uri: '+ obj.playURI + ' , pass:' + password + ', resume:' + resume);
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
				response.register(newreq, bind(this.setParentalPass, this));
				newreq.send();
			}
			if (typeof password !== 'string') {
				tui.createDialog('password', false, bind(this.play, this, obj, resume), strings.components.dialogs.lock);
				return;
			}
			else if ( password !== this.parentalPassword ) {
				tui.createDialog('message', undefined, undefined, strings.components.dialogs.wrongPassword);
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
		response.register(newreq, bind(this.requestResultHandle, this, obj.sortIndex,  obj.publishName, 'play') );
		newreq.send();
	};
	Player.prototype.notifyOSD = function( obj ) {
		mix( obj, Theme);
		var req = request.create('mediainfo', obj);
		req.send( obj );
	};
	/**
	 * Call when we want to show visual player, usually when we start playing audio
	 * @param {string} title Optional title for the playing track
	 */
	Player.prototype.enableVisual = function(title) {
		console.log('Visual mode enabled');
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
            if (callback ) 
                response.register(newreq, callback);
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
	Player.prototype.requestResultHandle = function( index, title, icon) {
		tui.osdInstance.setContent(strings.player.states.starting + ( (!isNaN( parseInt (index,10 ))) ? '[' + index + '] ' : '') + title, 10, icon);
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
		var audio = event['has_audio'] || false;
		var video = event['has_video'] || false;
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
	return Player;
});
