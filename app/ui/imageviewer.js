define([
    'dom/dom',
    'shims/bind'
], function( 
    dom,
    bind
) {
    /**
     * Default image viewer for TUI
     * @param {DOMNode} opt_container Optional container to fit us in
     * @constructor
     */
    var ImageViewer = function( ) {
        this.imageLoaderElement_ = dom.create( 'img' );
        this.imageLoaderElement_.addEventListener( 'load', bind( this.onLoadReady_, this ), false );
        this.imageLoaderElement_.addEventListener( 'error', bind( this.onLoadError_, this), false);
        this.currentUrl_ = '';
        this.element_ = dom.create('div', {
            classes: 'imageDivElement'
        });
    };
    ImageViewer.prototype.onLoadReady_ = function( event ) {
        event.stopPropagation();
        tui.stealEvents( bind(this.eventHandler_, this));
        this.displayImage_();
    };
    ImageViewer.prototype.eventHandler_ = function( key ){
        if ( key == 'return') {
            this.hide();
        }
    };
    ImageViewer.prototype.hide = function() {
        tui.restoreEventTree();
        dom.dispose(this.element_);
    };
    ImageViewer.prototype.onLoadError_ = function() {
        tui.createDialog( 'message', 'Image cannot be loaded');
    };
    ImageViewer.prototype.displayImage_ = function() {
        dom.adopt( this.element_, dom.create('img', { src: this.currentUrl_ }));
    };
    ImageViewer.prototype.startLoading_ = function() {
        this.imageLoaderElement_.src = this.currentUrl_;
        this.onLoadStart_();
    };
    ImageViewer.prototype.onLoadStart_ = function() {
        this.element_.innerHTML = '';
        dom.adopt( this.element_ );
    };
    // Public API
    ImageViewer.prototype.show = function( image_url ) {
        this.currentUrl_ = image_url;
        this.startLoading_();
    };
    return ImageViewer;
});