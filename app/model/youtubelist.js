/**
 * @fileoverview Provide data storage for youtube lists, implementing the 
 * Storage interface so the same UI components can use the data provider
 */

define([
	'model/listmodel',
	'oop/inherit',
	'env/exports', 
	'shims/bind',
	'loader/loader',
	'data/static-strings',
	'ui/popup'
], function( Listmodel, inherit, exports, bind, loader, strings, Popup) {
    
    /**
     * YouTube storage model
     * @implement {Storage}
     * @constructor
     * @param {ListingApp} app
     */
	var YTData = function(app) {
		Listmodel.call(this, app);
		this.currentDataURL = YTData.urls.most_popular_url;
//        Export the global loader symbol for JSONP
		exports.exportSymbol('youtube', {
			name: 'load',
			symbol:  bind(this.load, this)
		});
		this.lastDisplayedIndex = 0;
	};
	inherit(YTData, Listmodel);
    
    /**
     * The URLS to use for loading lists
     * @static
     */
	YTData.urls = {
		most_popular_url: 'http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?alt=jsonc&callback=exportedSymbols.youtube.load&v=2&max-results=16&prettyprint=true',
		toprated: 'http://gdata.youtube.com/feeds/api/standardfeeds/top_rated?alt=jsonc&callback=exportedSymbols.youtube.load&v=2&max-results=16&prettyprint=true',
		most_viewed: 'http://gdata.youtube.com/feeds/api/standardfeeds/most_viewed?alt=jsonc&callback=exportedSymbols.youtube.load&v=2&max-results=16&prettyprint=true',
		recently_featured: 'http://gdata.youtube.com/feeds/api/standardfeeds/recently_featured?alt=jsonc&callback=exportedSymbols.youtube.load&v=2&max-results=16&prettyprint=true',
		search_url: 'http://gdata.youtube.com/feeds/api/videos?alt=jsonc&callback=exportedSymbols.youtube.load&v=2&max-results=16&prettyprint=true&q=',
	};
    
    /**
     * How many videos to load at once, the higher the number the slower 
     * the rendering
     * @type {number}
     */
	YTData.prototype.itemsPerLoad = 16;
	YTData.prototype.isLoading = false;
	YTData.prototype.hasMoreResult = true;
    
	YTData.prototype.resetSource = function(identifier, querystring) {
		if (YTData.urls[identifier]) {
			if (identifier === 'search_url' && typeof  querystring !== 'string' ) {
				Popup.createDialog('input', 
                    true, 
                    bind(this.resetSource, this, identifier), 
                    strings.components.dialogs.ytube.searchquery
                );
				return; 
			}
			this.currentDataURL = YTData.urls[identifier];
			this.lastDisplayedIndex = 0;
			delete this.data.list;
			this.data.list = [];
			this.app.presentation.reset(true);
			this.loadData({
				name: this.name,
				type: 'list',
				querystring: querystring
			});
		}
	};
    
	YTData.prototype.loadData = function(setting) {
		if (typeof setting.querystring == 'string') {
			this.currentDataURL += setting.querystring
		}
		var url = this.currentDataURL;
		if (setting.type === 'append') {
			url = url + '&start-index=' + (this.lastDisplayedIndex + 1);
		}
		this.app.fire('data-load-start');
		this.isLoading = true;
		loader.loadJSONP('youtubevideos', url);
	};
    
	YTData.prototype.load = function(data) {
		this.isLoading = false;
		if ( data.data.startIndex + data.data.itemsPerPage >= data.data.totalItems)
			this.hasMoreResult = false;
		if (data.data.totalItems === 0 ) {} else {
			var items = data.data.items;
			var i, item;
			for (i = 0; i < items.length; i++) {
				item = items[i];
				if ( item.accessControl && item.accessControl.list === 'allowed'  ) {
					item.playURI = item.id;
					item.starRating = parseInt(((item.rating - 1)/4)*100);
					this.data.list.push(item);
				}
			}
		}
		this.lastDisplayedIndex = this.data.list.length;
		this.pointer = this.data.list;
		this.isLoaded = true;
		this.app.fire('data-load-end', {
			type: (data.data.startIndex === 1?'list':'append'),
			app: this.app.name
		});
	
	};
    
	YTData.prototype.disposeInternal = function(){
		YTData.superClass_.disposeInternal.call(this);
		delete this.currentDataURL;
		delete this.hasMoreResult
	};
	
	return YTData;
});
