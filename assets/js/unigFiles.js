(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigFiles = {

    number_files: 0,
    number_files_in_download_list: 0,
    number_files_visible: 0,



    attach:
        function (context, settings) {
          console.log(' Drupal.behaviors.unigFiles');
        },







  };

})(jQuery, Drupal, drupalSettings);