define( function() {
	var ObjClone = function( obj ) {
		var type = typeof obj;
		if (type == 'object' || type == 'array' && obj !== null ) {
//			if (obj.clone) {
//				return obj.clone();
//			}
			var clone = type == 'array' ? [] : {};
			for (var key in obj) {
				clone[key] = ObjClone(obj[key]);
			}
			return clone;	
		}
		return obj;
	};
	return ObjClone;
});

