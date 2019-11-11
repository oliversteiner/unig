(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigHelp = {
    attach(context) {
      $('#unig-main', context)
        .once('help')
        .each(() => {
          console.log('UniG Help');
          $('.unig-toolbar-help').show();

          //  Toggle Help
          $('.unig-help-toggle-trigger', context).click(() => {
            console.log('Toggle Help');
            $('.unig-toolbar-help').toggle();
          });

          //  Close Help
          $('.unig-help-close-trigger', context).click(() => {
            console.log('Close Help');
            $('.unig-toolbar-help').hide();
          });

          //  Open Help
          $('.unig-help-open-trigger', context).click(() => {
            console.log('Open Help');
            $('.unig-toolbar-help').show();
          });
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
