define(function() {
	return function(obj, mix) {
		var k;
		for (k in mix) {
			if (mix.hasOwnProperty(k)) {
				if (obj.hasOwnProperty(k)) {
					obj[k + '_overridden'] = obj[k];
				}
				obj[k] = mix[k];
			}
		}
		return k;
	};
})
