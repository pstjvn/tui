/**
 * @fileoverview In this file the developer can list modules that should be 
 * pre-loaded, i.e. modules that are supposed to work on the background.
 * 
 * Note that those modules will not be called with their Start method, so the
 * logic in them should operate without the Start method calling assumption
 * 
 * All modules should be calleable later with Start method
 */

define({
	preloadsModules: ['apps/telefony']
});
