/**
 * @fileoverview Provider for NetFlix listing type. It utilizes the webkit 
 * transitions and transformation capabilities to minimize the dom access
 * Optional animation is supported via CSS and is programitically enabled/
 * disabled
 *
 * The listing implements the 'presentation' interface (i.e. can replace the 
 * other listings)
 */

define([
	'dom/dom',
	'dom/classes',
	'tpl/nflist'
], function(dom, classes, template) {
	/**
	 * Implements 'presentation' 
	 * 
	 * @param {ListingApp} app The app that will utilize the listings
	 * @param {Storage} data_accessor The storage to use for data loading/access
	 * @param {number} item_height The height desired for each item, should
	 * 		match the height in the styling
	 */
	
	var NFList = function( app, data_accessor, item_height ) {
		this.app = app;
		this.dataAccessor_ = data_accessor;
		if ( typeof item_height == 'number' ) this.itemHeight_ = item_height;
		this.dataPointer_ = 0;
		this.elements_ = [];
		this.onscreen_ = [];
		this.beforescreen_ = [];
		this.afterscreen_ = [];
		this.activeChannelElement_ = null;	
		if (NFList.enableAnimation_) {
			dom.adopt(document.head, NFList.animationStyleElement);
		}
	};

	NFList.prototype.contentBox_;
	NFList.prototype.isDomConstructed_ = false;
	NFList.prototype.isVisible_ = false;
	NFList.prototype.mainContainerCssClass = 'tui-nflist-container';
	NFList.prototype.transitionContainerCssClass = 'tui-vertical-transition-container';
	NFList.prototype.listItemCssClass = 'tui-nflist-item';
	NFList.prototype.listItemActiveCssClass = 'active';
	NFList.prototype.itemHeight_ = 70;
	NFList.prototype.rows_ = 0;
	NFList.prototype.horizontalPadding = 0;
	NFList.prototype.verticalPadding = 0;
	/** Static properties and function */
	NFList.enableAnimation_ = false;
	NFList.animationDuration_ = 300;
	NFList.composeAnimationStyle = function() {
		var res = '.' + NFList.prototype.listItemCssClass + '{ -webkit-transition: -webkit-transform ';
		res += NFList.animationDuration_;
		res += 'ms; }'
		return res;
	}
	NFList.animationStyleElement = (function() {
		return dom.create('style', {
			text: NFList.composeAnimationStyle()
		});
	})();

	/** END static */
	NFList.prototype.enterDom = function(opt_cont_box, force) {
		this.app.fire('show-start');
		if ( opt_cont_box !== undefined ) {
			if ( opt_cont_box !== this.contentBox_ ) {
				this.contentBox_ = opt_cont_box;
				this.constructDom( true );
			}
		} else if ( !this.contentBox_ ) {
			this.contentBox_ = document.body;
			this.constructDom( true );
		} else {
			this.setItemsContent();
		}
		this.isVisible_ = true;
		dom.adopt(this.contentBox_, this.container_);
		this.app.fire('show-complete');
	};
	NFList.prototype.constructDom = function( force ) {
		if ( this.isDomConstructed_ && force !== true ) return;
		this.container_ = dom.create('div', {
			classes: this.mainContainerCssClass
		});
		this.transContainer_ = dom.create('div', {
			classes: this.transitionContainerCssClass
		});
		dom.adopt( this.container_, this.transContainer_ );
		console.log(this.container_.innerHTML)
		this.transWidth_ = parseInt(this.contentBox_.style.width, 10);
		this.transHeight_ = parseInt(this.contentBox_.style.height, 10);
		this.container_.style.width = this.transWidth_ +'px';
		this.container_.style.height = this.transHeight_ + 'px';
		this.transContainer_.style.width = (this.transWidth_ - this.horizontalPadding ) + 'px';
		this.transContainer_.style.height = (this.transHeight_ - this.verticalPadding ) + 'px';
		this.transContainer_.style.top = (this.verticalPadding / 2) + 'px';
		this.transContainer_.style.left = (this.horizontalPadding/2) + 'px';
		this.createTransElements_();
		this.isDomConstructed_ = true;
	};
	NFList.prototype.getDataList = function() {
		return this.dataAccessor_.get();
	};
	NFList.prototype.setItemsContent = function() {
		var data = this.getDataList();
		for ( i = 0; i < this.elements_.length; i++ ) {
			this.populateItem( this.elements_[i], data[this.dataPointer_ + i]);
		}		
	}
	NFList.prototype.createTransElements_ = function() {
		var i;
		this.rows_ = Math.floor( parseInt(this.transHeight_, 10) / this.itemHeight_ );
//		TODO: make sure we assimilate the elements when changing the container
		if ( this.elements_.length === 0) {
			this.elements_ = NFList.createElements(this.rows_ + 2, this.transContainer_, this.listItemCssClass );
		}
		this.setItemsContent();
		for ( i = 0; i < this.rows_; i++ ) {
			this.onscreen_.push( this.elements_[i]);
		}
		for (; i< this.elements_.length; i++) {
			this.afterscreen_.push(this.elements_[i]);
		}
		this.setVerticalTransformations();
		this.isVisuallyInitialized_ = true;
	};
	NFList.prototype.getTemplate = function() {
		//Override this for something more intelligent
		return template;
	};
	NFList.prototype.populateItem = function( element, chanRecord ) {
		if ( typeof chanRecord !== 'undefined') {
			classes.removeClasses(element, 'empty');
			element.innerHTML = this.getTemplate().render({channel: chanRecord});
		} else {
			classes.addClasses(element, 'empty');
			element.innerHTML = '';
		}

	};
	NFList.prototype.setVerticalTransformations = function() {
		var i = 0;
		for (i = 0; i < this.beforescreen_.length; i++ ) {
			NFList.setTranformationsY( this.beforescreen_[i], '-' +( this.itemHeight_) );
		}
		for (i = 0; i < this.onscreen_.length; i++) {
			NFList.setTranformationsY( this.onscreen_[i], this.itemHeight_ * i );
		}
		for ( i = 0; i < this.afterscreen_.length; i++ ) {
			NFList.setTranformationsY( this.afterscreen_[i], this.itemHeight_ * (this.rows_ + 1));
		}
	};
	NFList.setTranformationsY = function( el, position ) {
		el.style.webkitTransform =  'translate(0,' + position + 'px)';
		el.style.MozTransform = 'translateY(' + position + 'px)';
		if (NFList.enableAnimation_ && el.style.webkitTransition == 'none') {
			setTimeout( function() {
				el.style.webkitTransition = "";
			}, NFList.animationDuration_);
		}
	};
	NFList.createElements = function(num, container, classname) {
		var hm = num + 2;
		var els = [];
		var el;
		for( var i = 0; i < hm; i++) {
			el = dom.create('div', {
				classes: classname
			});
			els.push(el);
			dom.adopt(container, el);
		}
		return els;
	};
	NFList.prototype.isVisible = function() {
		return this.isVisible_;
	};
	NFList.prototype.selectRow = function(index) {
		var jumps;
		if ( index >= this.dataPointer_ && index <= this.dataPointer_ + this.rows_ -1 ) {
			this.setActiveChannel(this.onscreen_[index - this.dataPointer_ ]);
		} else {
			if ( index > this.dataPointer_ + this.rows_ - 1) {
				//selectirame posledniq element v vidimata chast
				this.setActiveChannel(this.onscreen_[this.onscreen_.length-1]);
				//namirame kolko sled posledniq element e tyrseniq
				jumps = index - ( this.dataPointer_ + this.rows_ - 1);
				this.iterateRotationTimes_( jumps, 'down');
				this.setActiveChannel(this.onscreen_[this.onscreen_.length-1]);
			} else if ( index < this.dataPointer_ ) {
				//selectirame purviq element v vidimata zona
				this.setActiveChannel( this.onscreen_[0]);
				//namirame kolko predi purviq kanal tr da rotirame
				jumps = this.dataPointer_ - index;
				this.iterateRotationTimes_( jumps, 'up');
				this.setActiveChannel( this.onscreen_[0]);
			}
		}
		this.app.fire('selection-changed', { index: index });
	};

	NFList.prototype.iterateRotationTimes_ = function( num, direction ) {
		var i;
		for (i = 0 ; i< num ; i++ ) {
			if ( direction === 'down') {
				this.rotateDown_();
			} else if ( direction === 'up') {
				this.rotateUp_();
			}
		}
		this.setVerticalTransformations();
	};
	NFList.prototype.rotateUp_ = function() {
		var avobject,
			taken = this.onscreen_.pop(),
			data = this.getDataList();
		
		this.afterscreen_.unshift(taken);
		taken = this.beforescreen_.pop();
		this.onscreen_.unshift(taken);
		this.dataPointer_--;
		if (this.beforescreen_.length < 1 ) {
			if ( this.dataPointer_ > 0 ) {
				taken = this.afterscreen_.pop();
				avobject = data[ this.dataPointer_ -1];
				taken.style.webkitTransition = 'none';
				this.populateItem(taken, avobject);
				this.beforescreen_.push(taken);
			}
		}
	};
	NFList.prototype.rotateDown_ = function() {
		var avobject,
			data = this.getDataList(),
			taken = this.onscreen_.shift();
		
		this.beforescreen_.push(taken);
		taken = this.afterscreen_.shift();
		this.onscreen_.push(taken);
		this.dataPointer_++;
		if (this.afterscreen_.length < 1) {
			if ( data.length > (this.dataPointer_ + this.rows_) ) {
				taken = this.beforescreen_.shift();	
				avobject = data[ this.dataPointer_ + this.rows_];
				taken.style.webkitTransition = 'none'
				this.populateItem(taken, avobject);
				this.afterscreen_.push(taken);
			}
		}
	};
	NFList.prototype.setActiveChannel = function( element ) {
		if ( this.activeChannelElement_ !== null ) classes.removeClasses(this.activeChannelElement_, this.listItemActiveCssClass);
		classes.addClasses( element, this.listItemActiveCssClass);
		this.activeChannelElement_ = element;
	};
	NFList.prototype.indexIsPresentation = function(n) {
		if ( n >= this.dataPointer_ || n < this.dataPointer_ + this.rows_ ) {
			return true;
		}
		var after = this.afterscreen_.length;
		var before = this.beforescreen_.length;
		if ( n < this.dataPointer_ + this.rows_ - 1 + after ) return true;
		if ( n > this.dataPointer_ - before ) return true;
		return false;
	};
	
	/** public api*/
	NFList.prototype.getStep = function() {return 1};
	NFList.prototype.getHStep = function() {
		return this.rows_;
	};
	NFList.prototype.reset = function(){};
	NFList.prototype.activate = function() { this.selectRow.apply( this, arguments)};
	NFList.prototype.unload = function(){
		dom.dispose(this.container_);
		this.isVisible_ = false;
	};
	NFList.prototype.show = function() { this.enterDom.apply(this, arguments)};
	NFList.prototype.updateItem = function(index, channel){
		if ( this.indexIsVisible(index) ) {
			this.setItemsContent();
		}
	};
	/** end public api */
	
	return NFList;
});
