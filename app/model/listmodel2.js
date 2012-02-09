/**
 * @fileoverview Provide the list module with wrapper for the new transport 
 * used at backend
 */
define([
	'model/listmodel',
	'oop/inherit',
	'json/json',
	'transport/request',
	'transport/response',
	'shims/bind'
], function(LM, inherit, json, request, response, bind) {
    
    /**
     * Override of the constructor to make it instance of this module
     * @override
     */
	var ListModel = function(app) {
		LM.call(this, app);
	};
	inherit(ListModel, LM);
    
    /**
     * @override 
     */
	ListModel.prototype.loadData = function(o) {
		var url = o.url || tui.options.paths.getPath(o.name, o.type);
		var req = request.create('calld', url);
		response.register(req, bind(this.load, this, o));
		req.send();
		this.app.fire('data-load-start');
	};
    
    /**
     * @override
     */
	ListModel.prototype.load = function(o, res) {
		var content;
		if (res.status.toLowerCase() === 'ok' && typeof res.content === 'string') {
			content = json.parse(res.content);
		}
		ListModel.superClass_.load.call(this, content, o);
	};
	return ListModel;
});
