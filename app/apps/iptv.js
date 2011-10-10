define(['types/types', 'utils/oop', 'utils/baseapp', 'dom/dom', 'model/datastorage', 'utils/events', 'ui/epginfo', 'dom/attributes', 'view/mosaic', 'debug/console', 'array/array'], function(types, oop, appeng, dom, model, events, epg, domattr, presentation, logger) {
	var APP = appeng({
		config: {
			name: 'iptv',	
			container: null
		}
	},{
		tuiLoaderSubscribe: true
	}),
		commonKeys = ['left', 'right', 'up', 'down', 'chup', 'chdown', 'ok'],
		appEvents = {};
	commonKeys.forEach(function(item) {
		appEvents[item] = {
			name: item,
			func: function(k) {
				APP.model.acceptEvent({
					type: 'remote',
					action: k
				});
			},
			attached: false
		};
	}), pcli = logger.getInstance('iptv screen');
	APP.model = model(APP);
	APP.presentation = presentation(APP);
	//Lock events for internal comunication
	APP.on('start-requested', function() {
		//pcli.log(types.getType(this.model.data.list));
		//var a = types.assert(this.model.data.list, 'undefined');
		//pcli.log(' Result of assert is ' + a );
		//pcli.log(' Result of regular typeof ' + typeof this.model.data.list);
		if (!this.model.isLoaded) {
			pcli.log('We do not have data for app ' + APP.config.name);
			APP.model.loadData({
				type: 'list'
			});
		}
		else {
			pcli.log('We have the data already');
			this.fire('start-ready');
		}
	});
	APP.on('data-load-start', function() {

	});
	APP.on('data-load-end', function(data) {
		if (data.type === 'list') {
			APP.fire('start-ready');
		} else if (data.type === 'folder') {
			this.presentation.show();
			if (typeof data.index !== 'undefined') this.presentation.activate(data.index);
		}
	});
	APP.on('try-play', function(obj) {
		pcli.log(['Requested play for obj', obj]);
	});
	APP.on('selection-changed', function(o) {
		this.model.currentIndex = o.index;
	});
	APP.on('show-complete', function() {
		events.addHandlers(appEvents);
	});
	APP.on('stop-requested', function() {
		this.model.unload();
		this.presentation.unload();
		events.removeHandlers(appEvents);
	});
	//Provide public interface (Start, Stop, Show, Pause/Hide)
	return {
		name: APP.config.name,
		Start: function() {
			APP.fire('start-requested');
		},
		Show: function(cont) {
			APP.fire('show-requested');
			pcli.log('Show called from tui in app ' + this.name);
			APP.presentation.show(cont);
		},
		Stop: function() {
			pcli.log('Stop called for application ' + this.appname);
			APP.fire('stop-requested');
		}
	};
});
