define(function() {
	var Pool = function( elementToClone, initnumber ) {
		this.elementPrototype_ = elementToClone;
		this.elements_ = [];
		this.elementsCount_ = 0; //total number of elements created by the pool
		this.createNewElements_(initnumber || this.elementsThreshold_);
	};

	Pool.prototype.initElementsNumber_ = 10;
	Pool.prototype.elementsThreshold_ = 2;

	Pool.prototype.createNewElements_ = function( how_many ) {
		var count = Math.ceil( how_many / this.elementsThreshold_ );
		var i, el;
		for ( i = 0; i< count; i++ ) {
			el = this.elementPrototype_.cloneNode(true);
			this.elements_.push(el);
		}
	};

	Pool.prototype.getElement = function() {
		if ( this.elements_.length < this.elementsThreshold_ ) {
			this.createNewElements_(this.elementsThreshold_);
		}
		return this.elements_.shift();
	};

	Pool.prototype.returnElement = function( el ) {
		el.innerHTML = '';
		this.elements_.push( el );
	};
	return Pool;
});


