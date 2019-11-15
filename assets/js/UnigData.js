/**
 * Created by ost on 14.05.17.
 */

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigData = {
    project: {},
    files: [],

    attach(context, settings) {
      $('#unig-main', context)
        .once('unigData')
        .each(() => {
          if (!drupalSettings.unigDataOnce) {
            drupalSettings.unigDataOnce = true;

            this.load();
          }
        });
    },

    remove(id) {
      // Remove item from List
      this.files = this.files.filter(item => item.id !== id);
      Drupal.behaviors.unigProject.updateBrowser();
    },

    load() {
      this.project = drupalSettings.unig.project.project;
      this.files = drupalSettings.unig.project.files;

    },

    clear() {
      this.files = [];
    },

    get() {
      return this.files;
    },


    getFiles() {
        return this.files;
    },

    getProject() {
      return this.files;
    },

    count() {
      return this.files.length;
    },
  };


})(jQuery, Drupal, drupalSettings);
