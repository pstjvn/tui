define([
	'utils/events',
	'dom/dom',
	'tpl/channelitem',
	'dom/classes'
], function(events, dom, channelItemTemplate, classes) {


var Epg = function(data_accessor) {
	this.channelList_ = null;
	this.epgList_ = null;
	this.Events = events;
	this.dataAccessor_ = data_accessor;
	this.isVisible_ = false;
	this.events_;
	this.container_ = dom.create('div',{
		classes: 'tui-epg-container'
	});
	this.setupContainerInternal();
	this.container_.style.zIndex = 1000;
	this.transContainer_ = dom.create('div',{
		classes: 'tui-internal-epg-container'
	});
	this.detailsContainer_ = dom.create('div', {
		classes: 'epg-details',
		style: "height:" + this.detailsHeight_ + 'px'
	});
	this.setupContainerInternal(this.transContainer_);
	this.transContainer_.style.position = 'relative';
	this.transContainer_.style.height = (parseInt(this.transContainer_.style.height, 10 ) - this.detailsHeight_ ) + 'px';
	this.container_.appendChild( this.detailsContainer_);
	this.container_.appendChild( this.transContainer_);
	this.dataPointer_ = 0;
	this.currentVisualSelectionIndex_ = 0;
	this.onscreen_ = [];
	this.beforescreen_ = [];
	this.afterscreen_ = [];
	this.activeChannelElement_ = null;
};
//ms*secs*mins*hours
Epg.prototype.detailsHeight_ = 100;
Epg.prototype.maxShownPeriod_ = 1000*60*60*24;
Epg.prototype.timelineLookbackTreshold_ = 1000*60*60;
Epg.prototype.timelineHourDistance_ = 60; //px
Epg.prototype.itemHeight_ = 60;
Epg.prototype.rows_ = 0;
Epg.prototype.isVisuallyInitialized_ = false;

//API
Epg.prototype.show = function() {
	this.showInternal_();
};
Epg.prototype.isVisible = function() {
	return this.isVisible_;
};
Epg.prototype.selectRow = function(index) {
	this.selectRowInternal_(index);
};
//PRIVATE
Epg.prototype.selectRowInternal_ = function( index ) {
	var jumps;
	if ( index >= this.dataPointer_ && index <= this.dataPointer_ + this.rows_ -1 ) {
		this.setActiveChannel_(this.onscreen_[index - this.dataPointer_ ]);
	} else {
		if ( index > this.dataPointer_ + this.rows_ - 1) {
			//selectirame posledniq element v vidimata chast
			this.setActiveChannel_(this.onscreen_[this.onscreen_.length-1]);
			//namirame kolko sled posledniq element e tyrseniq
			jumps = index - ( this.dataPointer_ + this.rows_ - 1);
			this.iterateRotationTimes_( jumps, 'down');
			this.setActiveChannel_(this.onscreen_[this.onscreen_.length-1]);
		} else if ( index < this.dataPointer_ ) {
			//selectirame purviq element v vidimata zona
			this.setActiveChannel_( this.onscreen_[0]);
			//namirame kolko predi purviq kanal tr da rotirame
			jumps = this.dataPointer_ - index;
			this.iterateRotationTimes_( jumps, 'up');
			this.setActiveChannel_( this.onscreen_[0]);
		}
	} 
};
Epg.prototype.iterateRotationTimes_ = function( num, direction ) {
	var i;
	for (i = 0 ; i< num ; i++ ) {
		if ( direction === 'down') {
			this.rotateDown_();
		} else if ( direction === 'up') {
			this.rotateUp_();
		}
	}
	this.setTranformationsForChannelsInternal();
};
Epg.prototype.rotateUp_ = function() {
	var taken = this.onscreen_.pop();
	this.afterscreen_.unshift(taken);
	taken = this.beforescreen_.pop();
	this.onscreen_.unshift(taken);
	this.dataPointer_--;
	if (this.beforescreen_.length < 1 ) {
		if ( this.dataPointer_ > 0 ) {
			taken = this.afterscreen_.pop();
			Epg.populateChannelItem(taken, this.channelList_[this.dataPointer_-1]);
			this.beforescreen_.push(taken);
		}
	}
};
Epg.prototype.rotateDown_ = function() {
	var taken = this.onscreen_.shift();
	this.beforescreen_.push(taken);
	taken = this.afterscreen_.shift();
	this.onscreen_.push(taken);
	this.dataPointer_++;
	if (this.afterscreen_.length < 1) {
		if ( this.channelList_.length > this.dataPointer_ + this.rows_ ) {
			taken = this.beforescreen_.shift();	
			Epg.populateChannelItem(taken, this.channelList_[this.dataPointer_ + this.rows_] );
			this.afterscreen_.push(taken);
		}
	}
};
Epg.prototype.setActiveChannel_ = function( element ) {
	if ( this.activeChannelElement_ !== null ) classes.removeClasses(this.activeChannelElement_, 'active');
	classes.addClasses( element, 'active');
	this.activeChannelElement_ = element;
};
Epg.prototype.getEvents_ = function() {
	if ( this.events_ === null ) {
		this.constructEvents_();
	}
	return events_;
};
Epg.prototype.eventHandler_ = function( key ) {
	console.log(arguments);
};
Epg.prototype.constructEvents_ = function() {
	var bound = bind( this.eventHandler_, this);
	this.events_ = {
		up: {
			name: 'up',
			func: bound,
			attached: false
		},
		down: {
			name: 'down',
			func: bound,
			attached: false
		},
		left: {
			name: 'left',
			func: bound,
			attached: false
		},
		right: { 
			name: 'right',
			func: bound,
			attached: false
		},
		ok: {
			name: 'ok',
			func: bound,
			attached: false
		}
	};
};
Epg.prototype.updateTime_ = function() {
	this.now_ = (new Date()).getTime();
	this.endTimeInterval_ = new Date(this.now_ + this.maxShownPeriod_);
	this.timelineStart_ = new Date(this.now_ - 
		(this.now_ % this.timelineLookbackTreshold_));
};
Epg.prototype.updateChannelList_ = function() {
	this.channelList_ = this.dataAccessor_.get('list');
};
Epg.prototype.updateEpgList_ = function() {
	this.epgList_ = this.dataAccessor_.get('epg');
};
Epg.prototype.updateAll_ = function() {
	this.updateTime_();
	this.updateChannelList_();
	this.updateEpgList_();	
};
Epg.prototype.showInternal_ = function() {
	document.body.appendChild( this.container_);
	this.updateAll_();
	this.isVisible_ = true;
	if ( !this.isVisuallyInitialized_) {
		this.visuallyInitialize_();
	}
};

Epg.prototype.visuallyInitialize_ = function() {
	var i;
	this.rows_ = Math.floor( parseInt(this.transContainer_.style.height, 10) / this.itemHeight_ );
	this.elements_ = Epg.createElements(this.rows_, this.transContainer_);
	for (i = 0; i < this.elements_.length; i++) {
		Epg.populateChannelItem( this.elements_[i], this.channelList_[this.dataPointer_ + i])
	}
	for ( i = 0; i < this.rows_; i++ ) {
		this.onscreen_.push( this.elements_[i]);
	}
	for (; i< this.elements_.length; i++) {
		this.afterscreen_.push(this.elements_[i]);
	}
	this.setTranformationsForChannelsInternal();
	this.isVisuallyInitialized_ = true;
	
};
Epg.prototype.setTranformationsForChannelsInternal = function() {
	var i = 0;
	for (i = 0; i < this.beforescreen_.length; i++ ) {
		Epg.setTranformationsY( this.beforescreen_[i], '-' +( this.itemHeight_ + this.detailsHeight_) );
	}
	for (i = 0; i < this.onscreen_.length; i++) {
		Epg.setTranformationsY( this.onscreen_[i], this.itemHeight_ * i )
	}
	for ( i = 0; i < this.afterscreen_.length; i++ ) {
		Epg.setTranformationsY( this.afterscreen_[i], this.itemHeight_ * (this.rows_ + 1));
	}
};
//STATIC
Epg.setTranformationsY = function( el, position ) {
	el.style.webkitTransform =  'translate(0,' + position + 'px)';
	el.style.MozTransform = 'translateY(' + position + 'px)';
};
Epg.populateChannelItem = function( element, data ) {
	element.innerHTML = channelItemTemplate.render({
		channel: data
	});
};
Epg.setupContainer = function(element) {
	var mc = document.getElementById('maincontainer');
	element.style.width = parseInt(mc.style.width, 10) + 'px';
	element.style.height = parseInt( mc.style.height, 10) + 'px';
	element.style.position = 'absolute';
	element.style.top = 0;
	element.style.left = 0;
};
Epg.createElements = function(num, container) {
	var hm = num + 2;
	var els = [];
	var el;
	for( var i = 0; i < hm; i++) {
		el = document.createElement('div');
		el.className = 'channel';
		els.push(el);
		container.appendChild(el);
	}
	return els;
};
//OVERRIDE
Epg.prototype.setupContainerInternal = function(container) {
	Epg.setupContainer( container || this.container_);
};
Epg.prototype.getContainer_ = function() {
	if (this.container_ === null) {
		this.container_ = document.body;
	}
	return this.container_;
};

return Epg;
});
