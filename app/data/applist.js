/**
 * @fileoverview applist List of all working applications for the TUI environment
 * Here you should add your application if you develop a new one and you need 
 * the user to see it in the app selection. Also you need to add its icon and
 * styling ( in appselector3.css and app/imgs/icon*)
 */
define({
	/**
	* Those id are used for the shortcuts so
	* if the user defines shortcut for welcome
	* and you alter the key from welcome to something else
	* the shortcut will not work any longer
	*/
	welcome: {
		name: 'Welcome',
		apptag: 'welcome',
		module: 'apps/start',
		info: '<img style="margin-right: 10px;"src="app/imgs/warning.png" />Welcome Feature:<br> <span style="font-size: 80%">you can show branding information here or any important messages the user must see when the device is turned on.<br>The message can be text or HTML, images are also supported</span>'
	},
	// In general this should be generated on the fly by the server,
	// however we currently do not have this capability ready, 
    // so we will use static provide
	iptv: {
        
        /**
         * The name as it will be used in display (i.e. when loading the
         * load UI will display 'Loading ' + the name you specify here + '...'
         * @type {string}
         */
		name: '',
        
        /**
         * The internal app name, this should be unique and is used to match 
         * data source and activity monitoring, do not change the sysmaster 
         * provided ones if you don't know a good reason for this
         * @type {string}
         */
		apptag: 'iptv',
        
        /**
         * Specifies the source code for the app module, relative to the basedir
         * Base dir is specified in main.js, currently set to 'app/'
         * @type {string}
         */
		module: 'apps/iptv',
        // Icons here are deprecated, all icons should be specified by apptag
        // property in the css appselector3.css
		icon: 'imgs/start_screen_icon.png',
		info: 'IPTV Feature:<br> <span style="font-size: 80%">Provides live channels to watch and optionally includes EPG data for the provided channels</span>'
	},
	vod: {
		name: '',
		apptag: 'vod',
		module: 'apps/vod',
		info: 'Video on Demand Feature<br><span style="font-size: 80%">Includes video files</span>'
	},
	ppv: {
		name: '',
		apptag: 'ppv',
		module: 'apps/ppv',
		info: 'Pey Per View Feature:<br> <span style="font-size: 80%">Includes video streams that are payed content</span>'
	},
	uservideo: {
		name: '',
		apptag: 'uservideo',
		module: 'apps/uvideo',
		info: 'User Folders Feature:<br> <span style="font-size: 80%">Implements DLNA servise discovery and browsing</span>'
	},
	youtube: {
		name: '',
		apptag: 'youtube',
		module: 'apps/youtube',
		info: 'YouTube Feature:<br> <span style="font-size: 80%">Watch YouTube videos on your TV</span>'
	},
	aod: {
		name: '',
		apptag: 'aod',
		module: 'apps/aod',
		info: 'Audio On Demand Feature:<br> <span style="font-size: 80%">Audio files and music</span>'
	},
	radio: {
		name: '',
		apptag: 'radio',
		module: 'apps/radio',
		info: 'Online Radio:<br> <span style="font-size: 80%">List of online radio stations you can listent to on your TV set</span>'
	},
    
    /**
     * This module is not supported any more, 
     * Call receiving module will be introduced later
     * @deprecated
     */
//	phone: {
//		name: 'phone',
//		apptag: 'phone',
//		module: 'apps/telefony'
//	},
	games: {
		name: '',
		apptag: 'games',
		module: 'apps/games',
		info: 'Games Feature:<br> <span style="font-size: 80%">Provides list of entertaining games to play on the TV</span>'
	},
	weather: {
		name: '',
		apptag: 'weather',
		module: 'apps/weather',
		info: "Weather forecast"
	},
	setup: {
		name: '',
		apptag: 'setup',
		module: 'apps/setup',
		info: 'Setup Feature:<br> <span style="font-size: 80%">Configurable device options</span>'
	}
});
