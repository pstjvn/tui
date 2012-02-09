/**
 * @fileoverview Implement game list app
 * These type of apps can contain any list of apps that run in iframes
 */
define([
	'utils/framedapp',
	'data/static-strings',
	'model/listmodel'
], function(App, strings, ListModel){
	var a = new App({
		name: 'games',
		shouldJump: false,
        
        /**
         * Use of custom item sizes is supported
         */
		itemWidth: 160,
		itemHeight: 138,
        
        /**
         * Use of custom data models is supported also
         */
		datamodel: ListModel
	});
    
    /**
     * Use of custom hints in slide up panel is supported for each 
     * individual app/per frame
     * 
     * It will work only if the panels are globally available and enabled 
     */
	a.hints = {
		general: {
			ok: strings.games.panels.bottom.ok,
			'return': strings.games.panels.bottom['return']
		},
		Sudoku: {
			ok: strings.games.hints.Sudoku.ok,
			arrows: strings.games.hints.Sudoku.arrows
		},
		SizzleBox: {
			arrows: strings.games.hints.SizzleBox.arrows
		},
		Hangman: {
			arrows: strings.games.hints.Hangman.arrows,
			ok: strings.games.hints.Hangman.ok
		}
	};
	return a;
});
