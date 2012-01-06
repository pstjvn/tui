/**
 * @module applist List of all working applications for the TUI environment
 */
define({
	// In general this should be generated on the fly by the server,
	// however we currently do not have this capability ready, so we will use static provide
	iptv: {
		name: '',
		apptag: 'iptv',
		module: 'apps/iptv',
		icon: 'imgs/start_screen_icon.png'
	},
	vod: {
		name: '',
		apptag: 'vod',
		module: 'apps/vod',
		icon: 'imgs/start_screen_icon.png'
	},
	ppv: {
		name: '',
		apptag: 'ppv',
		module: 'apps/ppv',
		icon: 'imgs/ppv_screen_icon.png'
	},
	aod: {
		name: '',
		apptag: 'aod',
		module: 'apps/aod',
		icon: 'imgs/ppv_screen_icon.png'
	},
	youtube: {
		name: '',
		apptag: 'youtube',
		module: 'apps/youtube'
	},
	uservideo: {
		name: '',
		apptag: 'uservideo',
		module: 'apps/uvideo',
	},
	setup: {
		name: '',
		apptag: 'setup',
		module: 'apps/setup',
	},
//	phone: {
//		name: 'phone',
//		apptag: 'phone',
//		module: 'apps/telefony'
//	},
	radio: {
		name: '',
		apptag: 'radio',
		module: 'apps/radio',
		icon: 'imgs/radio_screen_icon.png'
	},
	games: {
		name: '',
		apptag: 'games',
		module: 'apps/games',
		icon: 'imgs/radio_screen_icon.png'
	},
	weather: {
		name: '',
		apptag: 'weather',
		module: 'apps/weather'
	}
});
