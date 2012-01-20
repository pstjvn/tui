var EpgRow = function( epgdata, vstart_time, vend_time ) {
	this.dataList_ = epgdata;
	this.visualStartTime_ = vstart_time;
	this.visualEndTime_  = vend_time;
	this.findCurrentProgram_();
	
};

EpgRow.prototype.findFirstProgram_ = function() {
	var now = new Date();
	var nowAsNumber = now.getTime();
	var i;
	for ( i = 0; i < this.dataList_.length; i++) {
		if ( parseInt(this.dataList_[i][3], 10) > nowAsNumber ) {
			
		}
	}
}
