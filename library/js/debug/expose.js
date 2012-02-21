/**
 * @fileoverview Provide formatters for the *Console objects
 */

/**
 * Include boilerplate for node with amdefine
 * This way the code can be tested on nodejs, i.e. faster and easier than
 * on the browser
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

/**
 * Provides 'expose' functionality when printing log of objects
 * @param {*} obj The object to expose as text
 * @return {string}
 */
define(function() {
	return function(obj) {
		if (typeof obj == 'undefined') {
			return 'undefined';
		}
		if (obj === null) {
			return 'NULL';
		}
		var str = [];

		for (var x in obj) {
			var s = x + ' = ';
			try {
				s += obj[x];
			} catch (e) {
				s += '*** ' + e + ' ***';
			}
			str.push(s);
		}
		return str.join('\n');
	};
});