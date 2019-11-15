(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigFilter = {
    version: '1.0.0',
    isToolbarOpen: false,

    constructor(context, settings) {
      // Toolbar
      $('.unig-toolbar-filter-toggle-trigger', context).click(() => {
        this.isToolbarOpen = !this.isToolbarOpen;
        console.log('toggle filter', this.isToolbarOpen);
      });
    },

    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigFilter')
        .each(() => {
          this.constructor(context, settings);
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
