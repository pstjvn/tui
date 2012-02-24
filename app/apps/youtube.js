/**
 * @fileoverview Provides YouTube listing for Tornado devices as loadable app
 */

define([
	'utils/listingapp',
	'model/youtubelist',
	'tpl/youtube-partial',
	'dom/dom',
	'shims/bind',
	'data/static-strings',
	'debug/logger',
	'ui/popup'
], function(App, YTData, ytpartial, dom, bind, strings, Logger, Popups){
    
    /**
     * Listing app that uses youtube as list source, can be used
     * as an example on how to bind other (different from sysmaster's) data
     * sources in the interface
     */
	var YouTube = new App({
		name: 'youtube',
		datamodel: YTData,
		listType: 'youtube'
	});
    
    YouTube.logger_ = new Logger('YouTube');
    /**
     * Implement data loading steps.
     * Youtube returns too much information for each video, so requesting big 
     * slices of the full video list hangs the device while it parses the 
     * data, thus we use the YT API to request parts of the data
     */
	YouTube.on('selection-changed', function() {
		if (this.model.currentIndex > this.model.data.list.length - (this.presentation.getStep() * 2) ) {
			if (this.model.hasMoreResult) {
				this.model.loadData({
					name: this.name,
					type: 'append'
				});
			}
		}
	});
    
    /**
     * Static list of options to show in the option menu for the screen 
     * @enum {Array}
     * @static
     */
	YouTube.selectionDialogOptions = {
		options:[
			strings.components.dialogs.ytube.mostPopular,
			strings.components.dialogs.ytube.topRated,
			strings.components.dialogs.ytube.mostViewed,
			strings.components.dialogs.ytube.recent,
			strings.components.dialogs.ytube.search
		],
		actions: ['most_popular_url','toprated','most_viewed','recently_featured','search_url']
	};
    
    /**
     * Implements rendering of additional resulst to the view
     * Augments the presentation layer (i.e. listingapp) with 
     * static method
     */
	YouTube.presentation.addNewResults = function() {
		var domString = ytpartial.render({
			alterClass: this.template.alterClass,
			things: this.app.model.get(),
			startIndex: this.app.model.lastDisplayedIndex - this.app.model.itemsPerLoad
		});
		var putin = dom.$('.list-container', this.container);
		putin.insertAdjacentHTML('beforeend', domString);
	};
    
    
	YouTube.on('data-load-end', function(data) {
		if (data.type === 'append') {
			this.presentation.addNewResults();
		}
	});
    
    /**
     * Bind the 'play' button to the menu
     */
	YouTube.appEvents.play = {
		name: 'play',
		func: bind(function() {
			Popups.createDialog('optionlist', 
                this.selectionDialogOptions.options, 
                bind(this.handleDialogSelection, this), 
                strings.components.dialogs.ytube.select
            );
		}, YouTube),
		attached: false
	};
    
    /**
     * Handle menu selection, i.e. choose source for list
     * @param {number} sIndex The index is the selected item index 
     */
	YouTube.handleDialogSelection = function(sIndex) {
		YouTube.logger_.info('selection is ', this.selectionDialogOptions.actions[sIndex]);
		this.model.resetSource(this.selectionDialogOptions.actions[sIndex]);
	};
	
	return YouTube;
});
