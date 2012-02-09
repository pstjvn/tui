/**
 * @fileoverview Provides response handler for requests with additional
 * logic to handle specific packets (events)
 */

define(function (){
	var RemoteKeyHandler = null;
	var STATUS = {
		OK: 'OK',
		FAIL: 'FAIL'
	};
	var Register = {};
	var Response = function(JSON) {
		this.json = JSON; 
		this.findCallback();
	};
	Response.prototype.findCallback = function() {
		var sid = this.json["header"]["tag"];
		switch (this.json['header']['type']) {
		case 'response':
			if (typeof Register[sid] !== 'undefined') {
				if (!this.json["response"]) {
				} else {
					switch (this.json['response']['status']) {
						case STATUS.FAIL:
							break;
						default:
							break;
					}
					Register[sid][0].call(Register[sid][1], this.json["response"]);
				}
				delete Register[sid];
			}
			break;
		case 'event':
			switch (this.json['header']['method']) {
				case 'media':
					tui.globalPlayer.handleEvent(this.json);
					break;
				case 'player':
					tui.globalPlayer.handleEvent(this.json);
					break;
				case 'remote':
					if (RemoteKeyHandler !== null) {
						RemoteKeyHandler(this.json['event']['key']);
					}
					break;
                case 'msgbox':
                    tui.createDialog('message', undefined, undefined, this.json['event']['title'] + '<br>' +this.json['event']['message']);
                    break;
				case 'telephony':
					window.exportedSymbols['telephony']['setLineStatus'](this.json['event']);
					break;
				case 'cmd':
					switch (this.json['event']['action']) {
						case 'reloadconfig':
							tui.signals.refreshConfig();
							break;
						case 'refreshdata':
							tui.signals.refreshLists();
							break;
						case 'reloadinterface':
							console.log('Reload interface coming');
							window.location.reload(true);
							break;
						case 'reload_lists':
							console.log('Reload lists coming');
							break;
						default: break;
					}
					break;
				default: 
					break;
			}
			break;
		case 'reply':
			//
			// TODO: Find out what replies are
			// 
			break;
		default:
			break;
		}
		this.disposeInternal();
	};
    
	Response.prototype.disposeInternal = function() {
		this.json = null;
		delete this.json;
	};
    
	return {
		register: function(Request, callback, context) {
			Register[Request.json["header"]["tag"]] = [ callback, context ];
		},
		recall: function(JSON) {
			new Response(JSON);
		},
		setRemoteKeyHandler: function(func) {
			RemoteKeyHandler = func;
		},
        getRemoteKeyHandler: function() {
            return RemoteKeyHandler;
        }
	};
});
