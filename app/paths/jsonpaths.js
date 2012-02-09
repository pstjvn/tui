/**
 * @fileoverview Provides generalized data paths accessor for most sysmaster 
 * serivices
 */
define({
	general: ['lock', 'unlock', 'bookmark', 'unbookmark'],
	urls : {
		lock: {
			list: {
				"run": "add_json_lock",
				"sig": "lock"
			}
		},
		unlock: {
			 list: {
				"run": "add_json_lock",
				"sig": "unlock"
			}
		},
		bookmark: {
			list: {
				"run": "add_json_favorites",
				"sig": "bookmark"
			}
		},
		unbookmark: {
			list: {
				"run": "add_json_favorites",
				"sig": "unbookmark"
			}
		},
		vod: {
			list:  'vod_json_list'
		},
		iptv: {
			list: "iptv_json_list",
			epg: "epg_json_list"
		},
		radio: {
			list: "radio_json_list"
		},
		ppv: {
			list: "ppv_json_list"
		},
		aod: {
			list: "aod_json_list"
		},
		games: {
			skipParametrize: true,
			list: "app/apps/games/list.js"
		},
		uservideo: {
			list: "uvideo_json_list"
		},
		weather: {
			units: {
				run: 'get_cfgval_json',
				section: 'system',
				'var': 'temperature'
			},
			city:{
				run: 'get_cfgval_json',
				section: 'system',
				'var': 'weather_code'
			} 
		}
	},
    
    /**
     * Getter for the load paths
     * @param {string} name The apptag string identifying the pp
     * @param {string} type Additionally type of the data (for apps with
     *  more than one data type)
     * @return {Object} Path representation
     */
	getPath: function (name, type) {
		var result;
		if (typeof type === 'undefined') {
			type = 'list';
		}
		// Handle normal URLS that still need to be loaded with xhr
		if (this.urls[name].skipParametrize) {
			return this.urls[name][type];
		}
		if (typeof this.urls[name][type] === 'string') {
			result = {
				run : this.urls[name][type],
				newif: 1
			};
		} else {
			result = {};
			for (var k in this.urls[name][type]) {
				result[k] = this.urls[name][type][k];
			}
		}
		return  result;
	}
});
