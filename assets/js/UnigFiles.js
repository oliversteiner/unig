(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigFiles = {
    number_files: 0,
    number_files_in_download_list: 0,
    number_files_visible: 0,

    attach(context, settings) {
      $('#unig-main', context)
        .once('unigFiles')
        .each(() => {
          console.log(' Drupal.behaviors.unigFiles');
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
