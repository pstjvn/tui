/**
 * @fileoverview Define some globals here, mostly service vars
 */
define({
	transport: {
        
        /**
         * The default receiver of global callbacks from backend
         * You need to export this simbol as it will be diredtly called
         * as function with serialized JSON objects!
         * 
         * @type {string}
         */
		DEFAULT_CALLBACK: "window.transportReceiver"
	}
});
