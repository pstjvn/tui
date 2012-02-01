define([
//	'utils/events',
	'dom/dom',
	'tpl/channelitem',
	'dom/classes',
	'utils/datetime',
	'tpl/epgrecord',
	'datetime/xdate',
	'tpl/timeline',
	'tpl/epg-details'
], function(
    //events, 
    dom, channelItemTemplate, classes, datetime, epgRecordTemplate, Xdate, timelinetemplate, detailstemplate) {

/**
 * @fileoverview Provides means to work with epg and visualize it in table tows on 
 * small screens
 */


/**
 * Epg visualizer
 * @constructor
 * @param {tui.sysmaster.Storage} data_accessor The datqa model to request data from
 */
var Epg = function(data_accessor) {
	this.channelList_ = null;
	this.epgList_ = null;
	this.dataAccessor_ = data_accessor;
	this.isVisible_ = false;
	this.currentEpgElement_ = null;
	this.currentEpgPixelOffset_ = 0;
	//
	// this.events_;
	// 
	this.constructDom_();
	
	this.dataPointer_ = 0;
	this.onscreen_ = [];
	this.beforescreen_ = [];
	this.afterscreen_ = [];
	this.activeChannelElement_ = null;
};
Epg.enableAnimation_ = true;
Epg.animationDuration_ = 300;
/**
 * Utilized class names
 * @type {string}
 */
Epg.prototype.mainContainerClass = 'tui-epg-container';
Epg.prototype.transContainerClass = 'tui-internal-epg-container';
Epg.prototype.epgDetailContainerClass = 'epg-details';
/**
 * Called directly at construction time, just visualy separate the DOM construction
 * @private
 */
Epg.prototype.constructDom_ = function() {
	this.container_ = dom.create('div',{classes: this.mainContainerClass});
	this.setupContainerInternal();
//    Not really usedful
//	this.container_.style.zIndex = 1000;
	this.transContainer_ = dom.create('div',{classes: this.transContainerClass});
	this.timelineElement_ = dom.create('div', {
		classes: 'timeline',
		html: 'test'
	});
	this.detailsContainer_ = dom.create('div',{
		classes: this.epgDetailContainerClass,
		style: "height:" + this.detailsHeight_ + 'px'
	});
	this.setupContainerInternal(this.transContainer_);
	this.transContainer_.style.position = 'relative';
	this.transContainer_.style.height = (parseInt(this.transContainer_.style.height, 10 ) - this.detailsHeight_ ) + 'px';
	this.timelineElement_.style.top = (this.detailsHeight_ - 20) + 'px';
	this.container_.appendChild( this.detailsContainer_);
	this.container_.appendChild( this.transContainer_);	
	this.container_.appendChild( this.timelineElement_);
};
/**
 * Styling for the time offset and time line 
 * @type {string}
 */
Epg.prototype.style_ = '.prog, .timeline {-webkit-transform: translate(';
Epg.prototype.style2_ = 'px, 0px); }';
/**
 * This is the initial offset of the timeline - enouight to make space for the channel header on the left
 * It should be updated whenever the style ( especially the width ) of the channel title is altered
 * @type {number}
 */
Epg.prototype.initOffset_ = 140;
/**
 * This is the height of the top box that visualizes all the channel details and current
 * selected program details
 * @type {number}
 */
Epg.prototype.detailsHeight_ = 100;
/**
 * How many hours should we show in the epg list startin with the current full hour
 * Make it smaller on lower end devices to avoid mem exhaustion
 * @type {number}
 */
Epg.prototype.maxShownPeriod_ = 1000*60*60*8;
/**
 * Indicated how many miliseconds should we go back in time starting with the current time 
 * to set the start of our timeline
 * ex: it is now 14:37, should this be set to 1h, the timeline start will be set to 14:00
 * @type {number}
 */
Epg.prototype.timelineLookbackTreshold_ = 1000*60*60;
/**
 * How many pixels on the screen should represent one minute time
 * @type {number}
 */
Epg.prototype.timelineHourDistance_ = 60*3; 
/**
 * How many pixels height is one epg/channel row on the screen, 
 * update this to match the css settings as it is used to calculate translation offsets
 * @type {number}
 */
Epg.prototype.itemHeight_ = 70;
/**
 * How many rows of data can be visualized in the container; calculated by deviding the container 
 * height by the item height, calculatedd internally, do not set!
 * @type {number}
 * @private
 */
Epg.prototype.rows_ = 0;
/**
 * Indicates if the channel elements have been created and populated, 
 * usually this should be done only one
 * @type {boolean}
 */
Epg.prototype.isVisuallyInitialized_ = false;

/** Public API follows */
/**
 * Called to init the visual respresentation, 
 * Calls the internall function
 */
Epg.prototype.show = function() {
	this.showInternal_();
};
/**
 * Checks the visual state of the EPG collection
 * @return {boolean} true if the EPG is visible, otherwise false
 */
Epg.prototype.isVisible = function() {
	return this.isVisible_;
};
/**
 * Selects a row by item index, the index should ve valid one in the tui.sysmaster.Storage instance
 * set as data accessor in the construction, no checks are performed
 * @param {number}
 */
Epg.prototype.selectRow = function(index) {
	this.selectRowInternal_(index);
};
/** END Public API */
/**
 * Compiles style as text for timeline offsetting
 * @param {number} offset How much should we move to left
 */
Epg.prototype.compileStyle_ = function(offset) {
	if (typeof offset !== 'undefined' ) this.currentEpgPixelOffset_ = offset;
	var off = this.currentEpgPixelOffset_ + this.initOffset_;
	return this.style_ + off + this.style2_;
};
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
Epg.prototype.setNextActiveEPG = function( el ) {
	if (el===null) return;
	if ( this.currentEpgElement_!==null) {
		classes.removeClasses( this.currentEpgElement_, 'active');
	}
	classes.addClasses( el, 'active');
	this.currentEpgElement_ = el;
	this.setEpgDetails_();
	this.fitEpgElementOnScreen();
};
Epg.prototype.setEpgDetails_ = function() {
	if ( this.currentEpgElement_ === null ) {
		this.detailsContainer_.innerHTML = detailstemplate.render({
			channelname: this.dataAccessor_.getItem().publishName,
			noData: true
		});	
		return;
	}
	
	var epgRecords = this.getEpgDataByObject(this.dataAccessor_.getItem());
	var epgdata = null;
	if (epgRecords) {
		epgdata = epgRecords[parseInt(dom.dataGet(this.currentEpgElement_, 'index'),10)];
		this.detailsContainer_.innerHTML = detailstemplate.render({
			channelname: this.dataAccessor_.getItem().publishName,
			startTime: datetime.getParsedTime(epgdata[1]),
			endTime:  datetime.getParsedTime(epgdata[2]),
			title: epgdata[3],
			noData: false
		});
	} else {
	    //TODO: Make something smart here	
	}
};
Epg.prototype.fitEpgElementOnScreen = function() {
	var el = this.currentEpgElement_;
	var startPos = parseInt(el.style.left , 10);
	var endPos = startPos + parseInt( el.style.width , 10 );

	var vstart = Math.abs(this.currentEpgPixelOffset_);
	var visibleWidth = (parseInt(this.container_.style.width, 10) - this.initOffset_);
	var vend = vstart + visibleWidth;
	if ( startPos < vstart )  {
		this.styleElement_.textContent = this.compileStyle_( startPos * -1);
	} else if ( endPos > vend ) {
		this.styleElement_.textContent = this.compileStyle_( (endPos - visibleWidth) * -1 );
	}

};
Epg.prototype.selectEpg = function(direction) {
	if ( direction ) {
		this.setNextActiveEPG(this.currentEpgElement_.nextElementSibling);
	} else {
		this.setNextActiveEPG( this.currentEpgElement_.previousElementSibling);
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
Epg.prototype.getEpgDataByObject = function( object_with_id ) {
	var res = this.epgList_[ object_with_id.id ];
	if ( res ) return res.body;
	return res;
};
Epg.prototype.rotateUp_ = function() {
	var epgbody, avobject, taken;
	taken = this.onscreen_.pop();
	this.afterscreen_.unshift(taken);
	taken = this.beforescreen_.pop();
	this.onscreen_.unshift(taken);
	this.dataPointer_--;
	if (this.beforescreen_.length < 1 ) {
		if ( this.dataPointer_ > 0 ) {
			taken = this.afterscreen_.pop();
			avobject = this.channelList_[ this.dataPointer_ -1];
			epgbody = this.getEpgDataByObject( avobject );
			taken.style.webkitTransition = 'none';
			Epg.populateChannelItem(taken, avobject, epgbody, this.timelineStart_, this.endTimeInterval_);
			this.beforescreen_.push(taken);
		}
	}
};
Epg.prototype.rotateDown_ = function() {
	var epgbody, avobject, taken;
	taken = this.onscreen_.shift();
	this.beforescreen_.push(taken);
	taken = this.afterscreen_.shift();
	this.onscreen_.push(taken);
	this.dataPointer_++;
	if (this.afterscreen_.length < 1) {
		if ( this.channelList_.length > this.dataPointer_ + this.rows_ ) {
			taken = this.beforescreen_.shift();	
			avobject = this.channelList_[ this.dataPointer_ + this.rows_];
			epgbody = this.getEpgDataByObject( avobject );
			taken.style.webkitTransition = 'none';
			Epg.populateChannelItem(taken, avobject, epgbody ,this.timelineStart_, this.endTimeInterval_ );
			this.afterscreen_.push(taken);
		}
	}
};
Epg.prototype.setActiveChannel_ = function( element ) {
	var p;
	if ( this.activeChannelElement_ !== null ) {
		classes.removeClasses(this.activeChannelElement_, 'active');
		p = dom.$('span.p.active', this.activeChannelElement_);
		if (p!== null) classes.removeClasses( p, 'active');
		p = null;
	}
	// find the first element and set it activeChannelElement_
	p = dom.$('span.p', element);
	if (p !== null) { 
		classes.addClasses(p, 'active');
	}
	this.currentEpgElement_ = p;
	this.setEpgDetails_();
	classes.addClasses( element, 'active');
	this.activeChannelElement_ = element;
	this.styleElement_.textContent = this.compileStyle_(0);
};
Epg.prototype.getEvents_ = function() {
	if ( this.events_ === null ) {
		this.constructEvents_();
	}
	return this.events_;
};
Epg.prototype.eventHandler_ = function( ) {
	console.log(arguments);
};
//Epg.prototype.constructEvents_ = function() {
//	var bound = bind( this.eventHandler_, this);
//	this.events_ = {
//		up: {
//			name: 'up',
//			func: bound,
//			attached: false
//		},
//		down: {
//			name: 'down',
//			func: bound,
//			attached: false
//		},
//		left: {
//			name: 'left',
//			func: bound,
//			attached: false
//		},
//		right: { 
//			name: 'right',
//			func: bound,
//			attached: false
//		},
//		ok: {
//			name: 'ok',
//			func: bound,
//			attached: false
//		}
//	};
//};
/**
 * Updates the internal state of time, current time is set to now,
 * start and end times are set accordingly,
 * start time is calculated from current time and rounding
 * end time is calculated from start time plus the time we should visualize
 * Usually called on show
 */
Epg.prototype.updateTime_ = function() {
	this.now_ = new Xdate();
	this.timelineStart_ = this.now_.getRoundedTime( Xdate.ROUNDERS.PRIOR_FULL_HOUR );
	this.endTimeInterval_ = new Xdate( this.timelineStart_.getTime() + this.maxShownPeriod_ );
};
/**
 * Re-get the channel listing from data accessor
 */
Epg.prototype.updateChannelList_ = function() {
	this.channelList_ = this.dataAccessor_.get('list');
};
/**
 * Re-get the epg listing from data accessor
 */
Epg.prototype.updateEpgList_ = function() {
	this.epgList_ = this.dataAccessor_.get('epg');
};
/**
 * Update all, called on show
 */
Epg.prototype.updateAll_ = function() {
	this.updateTime_();
	this.updateChannelList_();
	this.updateEpgList_();	
};
Epg.prototype.showInternal_ = function() {
	document.body.appendChild( this.container_ );
	this.updateAll_();
	this.styleElement_ = dom.create('style');
	dom.adopt(document.head, this.styleElement_);
	this.styleElement_.textContent = this.compileStyle_();
	this.isVisible_ = true;
	if ( !this.isVisuallyInitialized_) {
		this.visuallyInitialize_(this.timelineStart_, this.endTimeInterval_);
	}
};

Epg.prototype.visuallyInitialize_ = function(timelinestart, timelineend) {
	var i;
	this.rows_ = Math.floor( parseInt(this.transContainer_.style.height, 10) / this.itemHeight_ );

	this.elements_ = Epg.createElements(this.rows_, this.transContainer_);

	var epgbody;
	for (i = 0; i < this.elements_.length; i++) {
		if ( this.epgList_[ this.channelList_[ this.dataPointer_ + i ].id ] ) {
			epgbody = this.epgList_[ this.channelList_[ this.dataPointer_ + i ].id ].body;
		} else epgbody = undefined;
		Epg.populateChannelItem( this.elements_[i], this.channelList_[this.dataPointer_ + i], epgbody, timelinestart, timelineend);
	}
	
	for ( i = 0; i < this.rows_; i++ ) {
		this.onscreen_.push( this.elements_[i]);
	}
	for (; i< this.elements_.length; i++) {
		this.afterscreen_.push(this.elements_[i]);
	}
	this.setTranformationsForChannelsInternal();
	this.populateTimeLine();
	this.isVisuallyInitialized_ = true;
	
};
Epg.prototype.populateTimeLine = function() {
	this.timelineElement_.innerHTML = timelinetemplate.render({
		start: parseInt(this.timelineStart_.getHours(),10),
		pixelsPerHour: this.timelineHourDistance_,
		hours: this.maxShownPeriod_/1000/60/60
	});
};
Epg.prototype.setTranformationsForChannelsInternal = function() {
	var i = 0;
	for (i = 0; i < this.beforescreen_.length; i++ ) {
		Epg.setTranformationsY( this.beforescreen_[i], '-' +( this.itemHeight_ + this.detailsHeight_) );
	}
	for (i = 0; i < this.onscreen_.length; i++) {
		Epg.setTranformationsY( this.onscreen_[i], this.itemHeight_ * i );
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
	
	if (Epg.enableAnimation_ && el.style.webkitTransition == 'none') {
		setTimeout( function() {
			el.style.webkitTransition = "";
		}, Epg.animationDuration_);
	}

};
Epg.populateChannelItem = function( element, data, epgdata, timelinestart,timelineend ) {
	// Here we need to construct all the shit!
//	first, construct the title
	var titlediv = channelItemTemplate.render({
		channel: data
	});
//	now fill in the epg data in it
	var progs = Epg.populatePrograms( epgdata, timelinestart, timelineend );
	element.innerHTML = progs + titlediv;
};
Epg.findProgramThatFinishesAfterNow = function( epgdata, xdate, endxdate ) {
	var i;
	for (i = 0; i < epgdata.length; i++  ) {
		if ( xdate.isEarlierThan( epgdata[i][2]) ) {
			if (endxdate.isEarlierOrSameThan( epgdata[i][1])) {
				return -1;
			}
			return i;
		}
	}
	return -1;
};
Epg.findProgramThatEndsAfterEndTimeFrame = function( epgdata, starti, xdate ) {
	var i;
	for ( i = starti; i < epgdata.length; i++ ) {
		if ( xdate.isEarlierOrSameThan( epgdata[i][2]) ) {
			if ( i < 1 ) return i;
			return i - 1;
		}
	}
	return epgdata.length - 1;
};
Epg.populatePrograms = function( epgdata, timelinestart, timelineend ) {
	var result = '<div class="prog">';
	if ( typeof epgdata == 'undefined') return result + '</div>';
	var startIndex, endIndex;
	
	startIndex = Epg.findProgramThatFinishesAfterNow( epgdata, timelinestart, timelineend );
	if ( startIndex > -1 ) {
		endIndex = Epg.findProgramThatEndsAfterEndTimeFrame( epgdata, startIndex, timelineend);
		var firstItemStartTime = new Xdate(epgdata[startIndex][1]);
		var startOffsetAsMS;
		var useTT = false;
		if ( timelinestart.isLaterThan( firstItemStartTime ) ) {
			startOffsetAsMS = 0;
			useTT = true;
		} else if ( timelinestart.isEarlierThan( firstItemStartTime ) ) {
			startOffsetAsMS = firstItemStartTime.getTime() - timelinestart.getTime();
		} else startOffsetAsMS = 0;

		var startOffsetinMinutes = Xdate.getTimeDiffereceAsMinutes( timelinestart, timelinestart.getTime() + startOffsetAsMS );
		var endMinutes = Xdate.getTimeDiffereceAsMinutes( epgdata[startIndex][2], useTT ? timelinestart.getTime():  epgdata[startIndex][1]);
		result += epgRecordTemplate.render({
			epgRecordIndex: startIndex,
			leftOffset: Math.abs(startOffsetinMinutes * 3),
			widthByDuration : endMinutes * 3,
			progTitle: epgdata[startIndex][3]
		});

		startIndex++;
		for (; startIndex < endIndex; startIndex++ ) {
			startOffsetinMinutes = Xdate.getTimeDiffereceAsMinutes( timelinestart,
				epgdata[startIndex][1]);
			endMinutes = Xdate.getTimeDiffereceAsMinutes( epgdata[startIndex][2],
				epgdata[startIndex][1]);
			result += epgRecordTemplate.render({
				epgRecordIndex: startIndex,
				leftOffset: Math.abs(startOffsetinMinutes * 3),
				widthByDuration : endMinutes * 3,
				progTitle: epgdata[startIndex][3]
			});
		}
		startOffsetinMinutes = Xdate.getTimeDiffereceAsMinutes( timelinestart,
				epgdata[endIndex][1]);
		endMinutes = timelineend.isEarlierThan( epgdata[endIndex][2]) ? 
			Xdate.getTimeDiffereceAsMinutes( timelineend, epgdata[endIndex][1]) :
			Xdate.getTimeDiffereceAsMinutes( epgdata[endIndex][2], epgdata[endIndex][1]);

		result += epgRecordTemplate.render({
			epgRecordIndex: startIndex,
			leftOffset: Math.abs(startOffsetinMinutes * 3),
			widthByDuration : endMinutes * 3,
			progTitle: epgdata[startIndex][3]
		});
	}

	return result + '</div>';
	



	//
	// if ( startIndex > -1 ) {
	// 	endIndex = startIndex;
	// 	for ( i = startIndex; i < len; i++) {
	// 		if ( parseInt(epgdata[i][2],10) > timelineend ) {
	// 			endIndex = i;
	// 			break;
	// 		}
	// 	}
	// 		
	// //	zapochni izgrajdaneto na programta, trim na purvata namerena programa do nachalniq chas
	// 	var res = '';
	// 	var cumulativeOffset = 0;
	// 	var wbd = 0;
	// 	for (i = startIndex ; i <= endIndex; i++ ) {
	// 		wbd = ( i === startIndex ) ? +epgdata[i][2] - timelinestart.getTime() : +epgdata[i][2] - +epgdata[i][1];
	// 		wbd = Math.floor(wbd/(1000*60));
	// 

	//
	// 		res += epgRecordTemplate.render({
	// 			leftOffset: cumulativeOffset,
	// 			widthByDuration: wbd,
	// 			progTitle: epgdata[i][3]
	// 		});
	// 		cumulativeOffset+=wbd;
	// 	}	
	// }
	// result += '</div>';
	// return result;
	// 
};
Epg.calculateWidthByDuration = function( start, end ) {
	var s = Math.floor(start / (1000*60));
	var e = Math.floor(end/ (1000*60));
	return 0;
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
Epg.prototype.hide = function() {
	dom.dispose(this.container_);
	this.isVisible_ = false;
};

return Epg;
});
