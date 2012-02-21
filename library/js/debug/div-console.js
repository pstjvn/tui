/**
 * @fileoverview Implement div console for devices that do not support anything
 * else and we have the opportunity to dedicate the screen to deubg
 */

/**
 * Include boilerplate for node with amdefine
 * This way the code can be tested on nodejs, i.e. faster and easier than
 * on the browser
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define([
	'oop/inherit', 
	'debug/simple-console',
	'debug/log-formaters',
	'debug/log-keeper'
], function (inherit, SimpleConsole, LogFormaters, LogKeeper) {

	/**
	 * DivConsole implementation
	 * @constructor
	 */
	var DivConsole = function () {
		SimpleConsole.call(this);
		this.formatter_ = LogFormaters.html;
	};
	/** @inherit SimpleConsole */
	inherit(DivConsole, SimpleConsole);

	/**
	 * Imeplement its own stream
	 * @override
	 */
	DivConsole.prototype.initStream_ = function () {
		this.stream_ = document.createElement('div');
		this.stream_.className = 'div-console';
		this.stream_.onclick = function () {
			this.parentNode.removeChild(this);
		};
	};
	
	
	/**
	 * Inherit docs, override implementation
	 * @override
     * @param {LogRecord}
	 */
	DivConsole.prototype.putRecord = function (log_record) {
		var buffer = [];
		buffer.push('<div class="');
		switch ( log_record.getLevel() ) {
			case LogKeeper.Levels.ERROR:
				buffer.push('dbg-error');
				break;
			case LogKeeper.Levels.INFO:
				buffer.push('dbg-info');
				break;
			case LogKeeper.Levels.WARN:
				buffer.push('dbg-warn');
				break;
			case LogKeeper.Levels.FINE:
				buffer.push('dbg-fine');
				break;
			default:
				buffer.push('dbg-log');
				break;
		}
		buffer.push('">');
		buffer.push( this.formatter_(log_record) );
		buffer.push('</div>');
	
		this.stream_.insertAdjacentHTML('beforeend', buffer.join(''));
	};

	/**
	 * Inherit docs, override implementation, {see superClass_}
	 * @override
	 */
	DivConsole.prototype.enable = function () {
		var screenSize = {
			width: document.width,
			height: document.height
		};
		this.stream_.style.width = (screenSize.width - 5) + 'px';
		this.stream_.style.height = (screenSize.height - 5) + 'px';
		this.stream_.style.width = screenSize.width + 'px';
		this.stream_.style.position = 'absolute';
		this.stream_.style.top = 0;
		this.stream_.style.left = 0;
		this.stream_.style.display = 'block';
		DivConsole.superClass_.enable.call(this);
		document.body.appendChild(this.stream_);
	};

	return DivConsole;
});
