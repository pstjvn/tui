/**
 * @fileoverview Device specific configuration options implementation
 * This implements only the Tornado M55 device settings, however 
 * the code is hughly reusable, providing the settings are returned in
 * the same format. Additin, removale and mutation of the configuration
 * options is fully supported out of the box. Configuration swapping ( from
 * one section to another) is also supported
 */

define([
	'utils/multiscreenjson',
	'utils/telescreen',
	'dom/dom',
	'dom/classes',
	'tpl/setup_chooser',
	'utils/miniscreenjson',
	'json/json',
	'tpl/setupminiscreen'
], function(
	App, 
	TeleMini,
	dom, 
	classes, 
	choosertpl,
	NM,
	json,
	template) {
	//loader.loadCSSFromText(css);
	/**
	* Mini screen chooser
	*/
	var Chooser = new TeleMini({
		name: 'chooser',
		template: choosertpl,
		panels: {
			keys: ['leftRight','ok']
		}
	});
	Chooser.keyHandler = function(key) {
		var node;
		if (typeof key !== 'string') {
			this.setActiveIcon(key);
		}
		switch (key) {
			case 'ok':
				node = dom.$('.active', this.dom_);
				this.master.activateScreen(parseInt(dom.dataGet(node, 'sequence'), 10));
				break;
			case 'left':
			case 'right':
				this.setActiveIcon(key);
				break;
			default: 
				break;
		}
	};
	Chooser.setActiveIcon = function(index) {
		var current = dom.$('.active', this.dom_);
		var next;
		if (typeof index === 'number') {
			next = dom.$$('.icon', this.dom_)[index];
		} else if (typeof index === 'string') {
			if (index == 'right' && current.nextElementSibling !== null) {
				next =  current.nextElementSibling;
			} else if (index == 'left' && current.previousElementSibling !== null) {
				next = current.previousElementSibling;
			}
		}
		if (next) {
			if (current !== null ) {
				classes.removeClasses(current, 'active');
			}
			classes.addClasses(next, 'active');
		}
	};
	Chooser.on('activated', function(index) {
		if (typeof index !== 'number') index = 0;
		this.setActiveIcon(index);
	});
	
	var General = new NM({
		name: 'general',
		template: template,
		panels: {
			top: false,
			bottom: true,
			keys: ['return']
		}
	});
	var IPTV = new NM({
		name: 'iptv',
		template: template,
		panels: {
			top: false,
			bottom: true,
			keys: ['return']
		}
	});
	var lan = new NM({
		name: 'lannetworking',
		template: template,
		panels: {
			top: false,
			bottom: true,
			keys: ['return']
		}
	});

	var wifi = new NM({
		name: 'wifi',
		template: template,
		panels: {
			top: false,
			bottom: true,
			keys: ['return']
		}
	});
	var voip = new NM({
		name: 'voip',
		template: template,
		panels: {
			top: false,
			bottom: true,
			keys: ['return']
		}
	});
	var Setup = new App({
		name: 'setup',
		miniscreens: [ Chooser , General, IPTV, lan, wifi, voip ],
		deps: {
			"run": 'fill_setup_json',
			'newif': 1
		}
	});
	Setup.fillContent = function(data) {
		console.log(json.parse(data.content));
		
	};
	return Setup;
});
