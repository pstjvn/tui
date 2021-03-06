/**
 * @fileoverview Wrapper around the smjs object exported on Tornado devices,
 * it will provide 1:1 interface for browser as the one we have in STBs
 * @require window/window
 * @require net/socket
 * @require appdebug/config
 */
define(['net/socket', 'appdebug/config'], function(socket, debugconfig) {
//	Use this to specify the global transport entry point, used only in emulated environment
	var defaultTransport_ = function() {
		if ( typeof window.transportReceiver === 'function') {
			window.transportReceiver.apply(null, Array.prototype.slice.call(arguments, 0));
		}
	};
	if (typeof window.smjs != 'undefined') {
		document.querySelector('html').className='m55';
		return window.smjs;
	} else {
		document.querySelector('html').className='browser';
		window.smjs = {
			socket: null,
			set_json_handler: function(string) {
				this.socket.send('{ "header" : { "transport":"socket", "mode":"async", "method":"set_global_callback", "type":"request", "tag":"0000" }, "request": { "name": "'+ string +'" } }');
	
			},
			emulated: true,
			// Dummy function
			initapi: function(){}
		};
		window.smjs.socket = socket.create(debugconfig.socket, 'stb-json-protocol', defaultTransport_);
		window.smjs.jsoncmd = function(JSONString) {
			if (this.socket !== null) {
				this.socket.send(JSONString);
			} else {
				throw Error('No socket has been created');
			}
		};
		return window.smjs;
	}
});
