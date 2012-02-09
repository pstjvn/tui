/**
 * @fileoverview Provides means to send more than 
 * one request on the JSON communication layer and wait for 
 * all of them to complete befile calling the callback
 */

define([
	'transport/response',
	'shims/bind'
], function(response, bind){
    
    /**
     * @constructor
     * @param {function} callback The callback function to call when all request
     *  return
     * @param {Request} var_args_requests Requests to group handle, one or more
     */
	var Group = function( callback, var_args_requests ) {
		this.requestList = Array.prototype.slice.call(arguments, 1);
		this.callback = callback;
		this.resultList = [];
		this.counter = 0;
		this.startRequests_();
	};
    
	Group.prototype.startRequests_ = function() {
		var i;
		for (i = 0; i < this.requestList.length; i++) {
			response.register(this.requestList[i], bind(this.getResponse, this, i));
			this.requestList[i].send();
		}
	};
    
	Group.prototype.getResponse = function( resultNumber, result ) {
		this.counter++;
		this.resultList[resultNumber] = result;
		if (this.counter >= this.requestList.length) {
			this.callback(this.resultList);
			this.disposeInternal();
		}
	};
    
	Group.prototype.disposeInternal = function() {
			delete this.requestList;
			delete this.responseList;
			delete this.callback;
			delete this.counter;
	};
    
	return Group;
});
