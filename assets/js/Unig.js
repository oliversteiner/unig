/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

    'use strict';

    Drupal.behaviors.unigBehavior = {
        attach: function (context, settings) {

            // Debug
            console.log('unigBehavior');

            // onload
            constructor(context, settings);

        }
    };

    /**
     *
     * @param context
     * @param settings
     */
    function constructor(context, settings) {


      if ( $('[type="date"]').prop('type') != 'date' ) {
        $('[type="date"]').datepicker();
      }

    }


})(jQuery, Drupal, drupalSettings);


(function ($) {
    Drupal.behaviors.themeExample = {
        attach: function (context, settings) { // jQuery once ensures that code does not run after an AJAX or other function that calls Drupal.attachBehaviors().
            $('body').once('themeExample').each(function () {        // We have console.log() here to make it easy to see that this code is functioning. You should never use console.log() on production code!
                if (typeof console.log === 'function') {
                    console.log('My Setting: ' + settings.sampleLibrary.mySetting);
                }
            });
            if (typeof console.log === 'function') {
                console.log('This will run every time Drupal.attachBehaviors is run.');
            }
            $('body').once('themeExampleModifyDOM').each(function () {        // Add an element to the body.
                $('body').append('<div class="example">Hello World</div>');        // Tell Drupal that we modified the DOM.
                Drupal.attachBehaviors();
            });
        }
    };
})(jQuery);
