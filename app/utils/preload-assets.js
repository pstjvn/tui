/**
* @fileoverview Imale preloading for your assets, you should instead use 
* the app cache , this functionality is deprecated
*/

define(['config/options', 'dom/dom'],function(ConfigOptions, dom) {
	if ( typeof ConfigOptions.PRELOAD_ASSETS === 'array' ) {
		var imgs = ConfigOptions.PRELOAD_ASSETS, img;
		var loaded = 0;
		var loLoad = imgs.length;
		var preloaderDiv = dom.create('div', {
			classes: 'tui-component tui-preloader'
		});
		var notifyOnLoad = function() {
			loaded++;
			if ( loaded === toLoad ) {
				dom.dispose(preloaderDiv);
			}
		};

		for ( var i = 0; i < imgs.length; i ++ ) {
			img = dom.create('img');
			img.onload = notifyOnLoad;
			img.src = imgs[i];
			dom.adopt(preloaderDiv,img);
		}
	}
	// Do not expose anything in the rjs context
	return null;
});
