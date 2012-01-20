define([
	'utils/events',
	'dom/dom',
	'tpl/channelitem',
	'dom/classes',
	'utils/datetime',
	'tpl/epgrecord',
	'datetime/xdate'
], function(events, dom, channelItemTemplate, classes, datetime, epgRecordTemplate, Xdate) {


var Epg = function(data_accessor) {
	this.channelList_ = null;
	this.epgList_ = null;
	this.dataAccessor_ = data_accessor;
	this.isVisible_ = false;
	this.events_;
	this.constructDom_();

	this.dataPointer_ = 0;
	this.onscreen_ = [];
	this.beforescreen_ = [];
	this.afterscreen_ = [];
	this.activeChannelElement_ = null;
};

Epg.prototype.constructDom_ = function() {
	this.container_ = dom.create('div',{classes: 'tui-epg-container'});
	this.setupContainerInternal();
	this.container_.style.zIndex = 1000;
	this.transContainer_ = dom.create('div',{classes:'tui-internal-epg-container'});
	this.detailsContainer_ = dom.create('div',{
		classes:'epg-details',
		style: "height:" + this.detailsHeight_ + 'px'	
	});
	this.setupContainerInternal(this.transContainer_);
	this.transContainer_.style.position = 'relative';
	this.transContainer_.style.height = (parseInt(this.transContainer_.style.height, 10 ) - this.detailsHeight_ ) + 'px';
	this.container_.appendChild( this.detailsContainer_);
	this.container_.appendChild( this.transContainer_);	
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
			Epg.populateChannelItem(taken, this.channelList_[this.dataPointer_-1], this.epgList_[ this.channelList_[ this.dataPointer_ + i ].id ]);
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
			Epg.populateChannelItem(taken, this.channelList_[this.dataPointer_ + this.rows_], this.epgList_[ this.channelList_[ this.dataPointer_ + i ].id ] );
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
	this.now_ = new Xdate();
	this.endTimeInterval_ = new Xdate( this.now_.getTime() + this.maxShownPeriod_ );
	this.timelineStart_ = this.now_.getRoundedTime( Xdate.ROUNDERS.PRIOR_FULL_HOUR );
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
	document.body.appendChild( this.container_ );
	this.updateAll_();
	this.isVisible_ = true;
	if ( !this.isVisuallyInitialized_) {
		this.visuallyInitialize_(this.timelineStart_);
	}
};

Epg.prototype.visuallyInitialize_ = function(timelinestart) {
	var i;
	this.rows_ = Math.floor( parseInt(this.transContainer_.style.height, 10) / this.itemHeight_ );
	this.elements_ = Epg.createElements(this.rows_, this.transContainer_);

	var epgbody;
	for (i = 0; i < this.elements_.length; i++) {
		if ( this.epgList_[ this.channelList_[ this.dataPointer_ + i ].id ] ) {
			epgbody = this.epgList_[ this.channelList_[ this.dataPointer_ + i ].id ].body;
		} else epgbody = undefined;

		Epg.populateChannelItem( this.elements_[i], this.channelList_[this.dataPointer_ + i], epgbody, timelinestart);
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
Epg.findCurrentProgramIndex = function( epgList ) {
	var len = epgList.length, i, now = datetime.getCurrentTime();
	//EPG info should be ordered by time, ascending!
	for (i = 0; i < len; i++) {
		if( epgList[i][2] > now ) {
			return i;
		}
	}
	return -1;
};
Epg.setTranformationsY = function( el, position ) {
	el.style.webkitTransform =  'translate(0,' + position + 'px)';
	el.style.MozTransform = 'translateY(' + position + 'px)';
};
Epg.populateChannelItem = function( element, data, epgdata, timelinestart ) {
	console.log(arguments);
	// Here we need to construct all the shit!
//	first, construct the title
	var titlediv = channelItemTemplate.render({
		channel: data
	});
//	now fill in the epg data in it
	var progs = Epg.populatePrograms( epgdata, timelinestart );
	console.log('What we have rendered: ', progs)
	element.innerHTML = progs + titlediv;
};
Epg.findProgramThatFinishesAfterNow = function( epgdata, xdate ) {
	var i;
	for (i = 0; i < epgdata.length; i++  ) {
		if ( xdate.isEarlierThan( epgdata[i][2]) ) {
			return i;
		}
	}
	return -1;
}
Epg.populatePrograms = function( epgdata, timelinestart ) {
	var result = '<div class="prog" style="-webkit-transform: translate(100px, 0px);">';
	console.log('EPG DATA ARRIVED AT COMPILE :', epgdata)
	if ( typeof epgdata == 'undefined') return result + '</div>';
	console.log('GOGO WITH EPG', timelinestart)
	//find first prog
	var startIndex = Epg.findProgramThatFinishesAfterNow( epgdata, timelinestart );
	var endIndex = -1;
	var timelineend = timelinestart.getTime() + (1000*60*60*24);
	var len = epgdata.length, i;
	console.log('FOUND START INDEX', startIndex)
	return result + '</div>';
//	for ( i = 0; i < len; i++ )	{
//		console.log('Start time: ',parseInt(epgdata[i][2],10),timelinestart.getTime())
//		if (parseInt(epgdata[i][2],10) > timelinestart.getTime() ) {
//			startIndex = i;
//			break;
//		}
//	}
	
	// Ako namerim start index znachi ima pone enda programa,
	// zapochvame ot neq i tyrsim kude e posledniq kanal za izobrazqvane

	if ( startIndex > -1 ) {
		endIndex = startIndex;
		for ( i = startIndex; i < len; i++) {
			if ( parseInt(epgdata[i][2],10) > timelineend ) {
				endIndex = i;
				break;
			}
		}
			
	//	zapochni izgrajdaneto na programta, trim na purvata namerena programa do nachalniq chas
		var res = '';
		var cumulativeOffset = 0;
		var wbd = 0;
		for (i = startIndex ; i <= endIndex; i++ ) {
			wbd = ( i === startIndex ) ? +epgdata[i][2] - timelinestart.getTime() : +epgdata[i][2] - +epgdata[i][1];
			wbd = Math.floor(wbd/(1000*60));

			res += epgRecordTemplate.render({
				leftOffset: cumulativeOffset,
				widthByDuration: wbd,
				progTitle: epgdata[i][3]
			});
			cumulativeOffset+=wbd;
		}	
	}
	result += '</div>';
	return result;
};
Epg.calculateWidthByDuration = function( start, end ) {
	var s = Math.floor(start / (1000*60));
	var e = Math.floor(end/ (1000*60));
	return 
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
		el.className = 'epgrow';
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
