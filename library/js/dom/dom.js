/**
 * @module dom Provides means to work with the DOM more conveniently
 * @requires string, types, static, domattributes
 */
define(['dom/string',
	    'types/types',
	    'dom/attributes'
	    ], function(stringmodule, types, attr) {
	var nextid = 1;
	var can_store_data = (document.body.dataset ? true : false);

	function uniqueID(id) {
		if (types.assert(id, 'string') && document.querySelector('#' + id) === null) {
			return id;
		} else {
			nextid = nextid + 1;
			return 'autoID_' + nextid;
		}
	}
	return {
		/**
		 * Empties the node of all HTMLElement
		 * @param {HTMLElement} node The node to empty
		 */
		empty: function(node) {
			node.innerHTML = '';
		},
		/**
		 * @method getInnerNodes returns a DOM tree from html string
		 * @param {String} The html string to parse
		 * @return {HTMLElement} The top dom node of the partial internally rendered to dom tree
		 */
		getInnerNodes: function(html) {
			var a = this.create('div', {
				html: html
			});
			var b = a.firstElementChild.cloneNode(true);
			a = null;
			return b;
		},
		/**
		 * @method $ wraps querySelector
		 * @param {String} The selector to query
		 * @param {HTMLElement} The element to query, optional
		 */
		$: function(sel, el) {
			el = el || document;
			return el.querySelector(sel);
			//Use slick instead to be portable.. this is pointless so many things are brocken in IE - better use jq or mt
			//return slick.find(el, sel);
		},
		/**
		 * @method $ wraps querySelectorAll
		 * @param {String} The selector to query
		 * @param {HTMLElement} The element to query, optional
		 */
		$$: function(sel, el) {
			el = el || document;
			return el.querySelectorAll(sel);
			//Use slick instead to be portable.. this is pointless so many things are brocken in IE - better use jq or mt
			//return slick.search(el, sel);
		},
		/**
		 * @method create Creates a new DOM element with tag name and properties
		 * @param {String} tag, The tag of the new element
		 * @param {Object} opts, Options to apply on the new element
		 */
		create: function(tag, opts) {
			var a, k;
			if (types.assert(tag, 'string')) {
				a = document.createElement(tag);
				if (a === null) {
					throw {
						name: 'DOMError',
						message: "Cannot create element"
					};
				}
				if (types.assert(opts, 'object')) {
					for (k in opts) {
						if (opts.hasOwnProperty(k)) {
							attr.set(a, k, opts[k]);
						}
					}
				}
				return a;
			}
			return null;
		},
		/**
		 * @method adopt Adopts a new element under the current one
		 * @param {HTMLElement} element, The element that will adopt the child
		 * @param {HTMLElement} what, The element to be adopted
		 */
		adopt: function(element, what) {
			if (arguments.length === 1) {
				return document.body.appendChild(element);
			}
			return element.appendChild(what);
		},
		/**
		 * @method dispose Removes an element from the DOM tree
		 * @param {HTMLElement} element, The element to get rid of
		 */
		dispose: function(element) {
			if ( element && element.parentNode) {
				return element.parentNode.removeChild(element);
			}
		},
		/**
		 * @method dataSet Sets data for element in cross browser manner 
		 * @param {HTMLElement} Element to store data to
		 * @param {String} Name of the stored property
		 * @param {String} Value of the stored property
		 */
		dataSet: (function() {
			if (can_store_data) {
				return function(element, key, val) {
					element.dataset[key] = val;
				};
			} else {
				return function(element, key, val) {
					element.setAttribute('data-' + stringmodule.selectorCase(key), val);
				};
			}
		}()),
		/**
		 * @method dataGet Gets data for element in cross browser manner 
		 * @param {HTMLElement} Element to get data from
		 * @param {String} Name of the stored property
		 */
		dataGet: (function() {
			if (can_store_data) {
				return function(element, key) {
					return element.dataset[key];
				};
			} else {
				return function(element, key) {
					return element.getAttribute('data-' + stringmodule.selectorCase(key));
				};
			}
		}()),
		/**
		 * @method dataRemove Removes a key from data stored for element 
		 * @param {HTMLElement} Element to operate on
		 * @param {String} Name of the stored property
		 */
		dataRemove: (function() {
			if (can_store_data) {
				return function(element, key) {
					delete element.dataset[key];
				};
			} else {
				return function(element, key) {
					element.removeAttribute('data-' + stringmodule.selectorCase(key));
				};
			}
		}()),
		/**
		 * @method dataHad Checks if the element has data stored for key 
		 * @param {HTMLElement} Element to operate on
		 * @param {String} Name of the stored property/key
		 */
		dataHas: function(element, key) {
			if (element.dataset) {
				return key in element.dataset;
			} else if (element.hasAttribute) {
				return element.hasAttribute('data-' + stringmodule.selectorCase(key));
			} else {
				return !!(element.getAttribute('data-' + stringmodule.selectorCase(key)));
			}
		},
		/**
		 * @method getUniqueId Always returns unique ID for use with autogenerated elements
		 * @param {String} optional, ID to check for uniquness, will return it if it is not in the document, else will return new unique ID
		 */
		getUniqueId: function(id) {
			return uniqueID(id);
		}
	};
});
