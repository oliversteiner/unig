(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigFilter = {
    version: '1.0.0',
    isToolbarOpen: false,

    getId(event) {
      const $elem = $(event.target).parents('.unig-filter-item');
      return $elem.data('id');
    },

    update() {
      console.log('Unig Filter Update');

      // Remove Tag
      $('.unig-filter-item-remove-trigger')
        .once('unigFilter')
        .click(event => {
          const id = this.getId(event);
          this.remove(id);
        });
    },

    remove(id) {
      console.log('Remove Tag with ID', id);
      this.update();
    },

    addVisible() {
      console.log('Add images to download list');
    },

    clearFilter() {
      console.log('Clear Filter');
    },

    constructor(context, settings) {
      console.log('unigFilter');

      // Toolbar
      $('.unig-toolbar-filter-toggle-trigger', context).click(() => {
        this.isToolbarOpen = !this.isToolbarOpen;
        console.log('toggle filter', this.isToolbarOpen);
      });

      // add-visible-to-download-list
      $('.unig-add-visible-to-download-list-trigger', context).click(() => {
        this.addVisible();
      });

      // clear-filter
      $('.unig-clear-filter-trigger', context).click(() => {
        this.clearFilter();
      });
    },

    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigFilter')
        .each(() => {
          this.constructor(context, settings);
          this.update();
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
