/**
 * @fileoverview Implements popup style dialogs for the STB interface
 * 
 * The dialogs are intelligent enough to know how to deal with event stack 
 * and with the HW player. You can call the dialogs from the tui.createDialog
 * or directly construct them
 * 
 * @require dom/dom
 * @require tpl/popups
 * ...
 */
define([
	'dom/dom',
	'tpl/popups',
	'oop/idisposable',
	'oop/inherit',
	'dom/classes',
	'dom/attributes',
	'ui/vkbd',
	'array/array',
	'shims/bind'
], function (dom, tpl, Disposable, inherit, classes, domattr, KBD, array, bind){
    
    /**
     * Provides basic popup, you should probably augment this object
     * if none of the provided dialogs fit your needs
     * 
     * @constructor
     * @param {string} type The dialog type, types are used mostly in wrappers,
     *  internally they bare no significance
     * @param {function} callback The callback to execute with the dialog action
     * @param {string} title The dialog title
     */
	var Popup = function(type, callback, title) {
		Disposable.call(this);
		this.type = type;
		this.callback = callback;
		this.title = title;
	};
	inherit(Popup, Disposable);
    
    /**
     * Provide number filtering for remote numbers, this way on appropriate
     * dialogs the numbers can be inserted from the remote controller numbers
     * @type {array}
     * @static
     */
	Popup.prototype.numerics_ = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    
    /**
     * Default value for vkbd use in the dialogs
     * overwrite it in your dialog to enable the built in kbd
     * @type {boolean}
     */
	Popup.prototype.useKbd = false;
    
    /**
     * Utility property, notifies the dialog to use OK/Cancel keys
     * @type {boolean}
     */
	Popup.prototype.useOkCancel = false;
    
    /**
     * Utility property, notifies the dialog to use only OK key
     * @type {boolean}
     */
	Popup.prototype.useOkOnly = false;

	Popup.prototype.ipDialog = false;
    
    /**
     * Default destroyer function, override this function as needed, but call it
     * from the children if you want the dialogs to behave in the TUI
     */
	Popup.prototype.destroyer = function() { 
        tui.signals.restoreEventTree(this.getEventHandler());
    };
	
    /**
     * Default implementation for showing the dialog, it will take care
     * of the styling (shadowing the content and constructing the DOM)
     * @param {HTMLElement} container There should the dom be injected
     */
	Popup.prototype.show = function(container) {
		this.container = container || document.body;
		this.dom_ = dom.create('div', {
            // Defined in multiselect.css
			classes: 'multi-select-wrapper',
			style: domattr.get(this.container, 'style').cssText
		});
        // HTML tree in tpl/popups
		this.dom_.innerHTML = tpl.render({
			title: this.title,
			things: this.options || [],
			type: this.type,
			addKbdContainer: this.useKbd,
			useDefaultButtons: this.useOkCancel
		});
		dom.adopt(this.container, this.dom_);
        tui.stealEvents(this.getEventHandler());
//        Make sure the player is not hiding us (1 means translucent )
//        If the player is not working this will do nothing
        tui.globalPlayer.setVState(1);
	};
    
    /**
     * Utility, returns the number from named numbers
     * @param {string} keyname A key name from the remote, should be one of the
     *  defined number {see Popup.prototype.numerics_}
     * @return {number}
     */
	Popup.prototype.getNumberFromName = function(keyname) {
        return this.numerics_.indexOf(keyname);
	};
    
    /**
     * Default destroy function, takes care of most things, override only if 
     * you need to do additional cleanup, it is still a good idea
     * to call this function on the prototype to make sure the event is cleaned
     * from the event tree, else call {code tui.signals.restoreEventTree}
     */
	Popup.prototype.destroy = function() {
		dom.dispose(this.dom_);
		this.destroyer();
	};
	
    /**
     * Default event handler function, override in your dialog
     * @param {string} key The remote key comming
     */
	Popup.prototype.eventHandler = function() {};
    
    /**
     * Returns the event handler for the instance. This is useful for
     * de-registering the listener from the event tree. If no bound listsner is
     * bound a new one is constructed
     * 
     * @return {function}
     */
	Popup.prototype.getEventHandler = function() {
        if (!this.boundEventHandler_) {
            this.boundEventHandler_ = bind(this.eventHandler, this);
        }
        return this.boundEventHandler_;
	};
    
    /** @override {code Disposable} */
	Popup.prototype.disposeInternal = function() {
		Popup.superClass_.disposeInternal.call(this);
		delete this.type;
		delete this.container;
		delete this.dom_;
		delete this.callback;
        //DO NOT dispose the bound event handler as it is used after disposal
        //it will be disposed when the object itself is de-refferenced
    };
    
	/**
    * Provides option list dialog type
    * 
	* @constructor
	* @param {String} type, Dialog type
	* @param {Array.<string>} options, List ot options to visualize
	* @param {Function} callback, Callback function to execute with the selected index
	* @param {?Number} selectedIndex, Default index to select, optional, default 
    *   to 0, the first item in the list
	*/
	var OptionSelector = function(type, options, callback, title, selectedIndex) {
		Popup.call(this, type, callback, title);
		this.options = options;
		this.selectedIndex = selectedIndex || 0;		
	};
	inherit(OptionSelector, Popup);
	
    /**
     * CSS class definitions and selectors
     * Defined in multiselect.css
     * @type {string}
     */
	OptionSelector.prototype.itemSelector = '.multi-select-item';
	OptionSelector.prototype.activeItemSelector = '.multi-select-item.active';
	OptionSelector.prototype.activeClass = 'active';
    
    /**
     * @override 
     * @type {function}
     * @param {string}
     */
	OptionSelector.prototype.eventHandler = function(key) {
		switch (key) {
			case 'up':
				this.selectItem(false);
				break;
			case 'down':
				this.selectItem(true);
				break;
			case 'ok':
				this.resolver(this.selectedIndex);
				break;
		    default: break;
		}
	};
    
    /** @override */
	OptionSelector.prototype.disposeInternal = function() {
		OptionSelector.superClass_.disposeInternal.call(this);
		delete this.options;
		delete this.selectedIndex;
	};
    
    /**
     * Custom method to walk the options list
     * @param {boolean} bool The direction in which to walk the list, true for
     *  'down', otherwise 'up'
     */
	OptionSelector.prototype.selectItem = function(bool) {
		var next;
		if (bool) {
			next = this.selectedIndex + 1;
			if (next < this.options.length) {
				this.selectedIndex = next;
			}
		} else {
			next = this.selectedIndex - 1;
			if (next >= 0 ) {
				this.selectedIndex = next;
			}
		}
		this.activateItem();
	};
    
    /**
     * Set the active item in the list of options, called internally
     */
	OptionSelector.prototype.activateItem = function() {
		var current = dom.$(this.activeItemSelector, this.dom_);
		if (current !== null) classes.removeClasses(current, this.activeClass);
		classes.addClasses( dom.$$(this.itemSelector, this.dom_)[this.selectedIndex], this.activeClass );
	};
    
    /**
     * Default resolving function, called when the user makes the selection
     * The dialog is destroyed and disposed here
     * 
     * @param {number} index The currently selected index, the callback
     *  will be called with it as its only parameter
     */
	OptionSelector.prototype.resolver = function(index) {
		this.destroy();
		this.callback(index);
		this.dispose();
	};
    
    /** @override */
	OptionSelector.prototype.show = function(container) {
		this.constructor.superClass_.show.call(this, container);
		this.activateItem();
	};
	
//	Entries
	var Input = function(type, usekbd, callback, title) {
		Popup.call(this, type, callback, title);
		this.useKbd = usekbd || this.useKbd;
	};
	inherit(Input, Popup);
	Input.prototype.disposeInternal = function() {
		Input.superClass_.disposeInternal.call(this);
		delete this.value;
		delete this.input;
		delete this.kbd;
	};
	Input.prototype.show = function(container) {
		Input.superClass_.show.call(this, container);
		this.value = '';
		this.input = dom.$('.tui-kbd-container', this.dom_);
		if (this.useKbd) {
            this.input = dom.$('.tui-kbd-container', this.dom_);
			this.kbd = KBD.getInstance();
			this.kbd.show(this.input, bind(this.kbdSubmit, this));
			this.kbd.bindToElement(dom.$('.textarea', this.dom_), (this.type === 'password')?true:false);
			tui.setKeyboardInputHandler(bind(function(ev) {
				if (tui.keyboardIgnoredKeys.indexOf(ev.keyCode) !==-1) return;
				var ch = String.fromCharCode(ev.charCode);
				this.kbd.addCharacter(ch);
			}, this));
		} else {
            this.input = dom.$('.textarea', this.dom_);
		}
	};
	Input.prototype.kbdSubmit = function(value) {
		if (this.useKbd) {
			tui.resetKeyboardInputHandler();
		}
        this.submit(value);
	};
    Input.prototype.submit = function(value) {
        if ( typeof value == 'undefined' ) value = this.value;
        this.destroy();
        this.callback(value);
        this.dispose();      
    };
    Input.prototype.updateElement = function() {
        if ( this.type === 'password') {
            this.input.textContent = new Array(this.value.length+1).join('*');
        } else {
            this.input.textContent = this.value;
        }
    };
	Input.prototype.eventHandler = function(key) {
        if ( !this.useKbd ) {
            if ( this.getNumberFromName( key ) > -1 ) {
                this.value = this.value + '' + this.getNumberFromName( key );
                this.updateElement();
            } else {
                switch (key) {
                    case 'delete': 
                        this.value = this.value.substr(0,this.value.length-1);
                        this.updateElement();
                        break;
                    case 'ok':
                        this.submit();
                        break;
                    default: 
                        break;
                        
                }
            }
        } else {
    		if (array.has(KBD.knownKeys_, key)) {
    			this.kbd.eventHandler(key);
    		} else  {
    			if (key === 'delete') { 
    				this.kbd.deleteCharacter();
    			} else if ( this.getNumberFromName( key ) > -1 ) {
                    this.kbd.addCharacter( this.getNumberFromName( key ) );
    			}
    //			TODO: Handle the submit button on text area with ff fw
    		}
        }
	};
	var ConfirmBox = function(type, useButtons, callback, title) {
		Popup.call(this, type, callback, title);
		this.useOkCancel = useButtons || false;
	};
	inherit(ConfirmBox, Popup);
	ConfirmBox.prototype.cssSelector = '.horizontal-button';
	ConfirmBox.prototype.eventHandler = function(key) {
		var node = dom.$(this.cssSelector + '.active', this.dom_);

		switch (key) {
			case 'left':
				if (node.previousElementSibling !== null) {
					classes.removeClasses(node, 'active');
					classes.addClasses(node.previousElementSibling, 'active');
				}
				break;
			case 'right': 
				if (node.nextElementSibling !== null) {
					classes.removeClasses(node, 'active');
					classes.addClasses(node.nextElementSibling, 'active');
				}
				break;
			case 'ok':
				var trigger = parseInt(dom.dataGet(node, 'trigger'), 10);
				this.destroy();
				this.callback(trigger);
				this.dispose();
				break;
		}
	};
	ConfirmBox.prototype.destroyer = OptionSelector.prototype.destroyer;
	ConfirmBox.prototype.destroy = function() {
		OptionSelector.prototype.destroy.call(this);
	};
	ConfirmBox.prototype.disposeInternal = function() {

		ConfirmBox.superClass_.disposeInternal.call(this);
		delete this.useOkCancel;
	};
	var IPBox = function(type, option, callback, title) {
		ConfirmBox.call(this, type, false, callback, title);
		this.ipDialog = true;
	};
	inherit(IPBox, ConfirmBox);
	IPBox.prototype.cssSelector = '.input-box';
	
	IPBox.prototype.disposeInternal = function() {
		IPBox.superClass_.disposeInternal.call(this);
		delete this.ipDialog;
	};
	IPBox.prototype.next_ = ['star'];
	IPBox.prototype.eventHandler = function(key) {
		var node;
		if (key == this.next_) key = 'right';
		switch (key) {
			case 'left':
			case 'right':
				IPBox.superClass_.eventHandler.call(this, key);
				node = dom.$(this.cssSelector + '.active', this.dom_);
				break;
			case 'delete':
				node = dom.$(this.cssSelector + '.active', this.dom_);
				node.innerHTML = '';
				break;
			case 'ok':
				break;
			case 'return':
				this.destroy();
				this.dispose();
                break;
			default: 
				if (this.numerics_.indexOf(key)!== -1) {
					node = dom.$(this.cssSelector + '.active', this.dom_);
					var old = node.textContent;
					if (old.length === 3) {
						this.eventHandler(this.next_);
						this.eventHandler('delete');
						this.eventHandler(key);
					} else {
						node.innerHTML = old + this.numerics_.indexOf(key);
					}
				}
		}
	};
	var MessageBox = function(type, message) {
		Popup.call(this, type, null, message);
	};
	inherit(MessageBox, Popup);
	MessageBox.prototype.eventHandler = function(key) {
		if (key == 'ok') {
			this.destroy();
			this.dispose();
		}
	};
	return {
		MessageBox: MessageBox,
		OptionList: OptionSelector,
		Text: Input,
		Confirm: ConfirmBox,
		IPBox: IPBox
	};
});
