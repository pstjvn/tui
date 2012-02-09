/**
 * @fileoverview applist List of all working applications for the TUI environment
 * Here you should add your application if you develop a new one and you need 
 * the user to see it in the app selection. Also you need to add its icon and
 * styling ( in appselector3.css and app/imgs/icon*)
 */
define({
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
		icon: 'imgs/start_screen_icon.png'
	},
	vod: {
		name: '',
		apptag: 'vod',
		module: 'apps/vod'
	},
	ppv: {
		name: '',
		apptag: 'ppv',
		module: 'apps/ppv'
	},
	uservideo: {
		name: '',
		apptag: 'uservideo',
		module: 'apps/uvideo'
	},
	youtube: {
		name: '',
		apptag: 'youtube',
		module: 'apps/youtube'
	},
	aod: {
		name: '',
		apptag: 'aod',
		module: 'apps/aod'
	},
	radio: {
		name: '',
		apptag: 'radio',
		module: 'apps/radio'
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
		module: 'apps/games'
	},
	weather: {
		name: '',
		apptag: 'weather',
		module: 'apps/weather'
	},
	setup: {
		name: '',
		apptag: 'setup',
		module: 'apps/setup'
	}
});
