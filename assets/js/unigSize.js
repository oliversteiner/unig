(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigSize = {


    $target: $('ul.unig-gallery'),

    attach:
        function (context, settings) {
          console.log(' Drupal.behaviors.unigSize');
          var Scope = Drupal.behaviors.unigSize;

          $('.unig-image-size-small-trigger').click(function () {
            console.log('small', this);

            Scope.$target.addClass('thumbnail-small')
                .removeClass('thumbnail-normal')
                .removeClass('thumbnail-big');
          });

          $('.unig-image-size-normal-trigger').click(function () {
            console.log('normal', this);
            Scope.$target.addClass('thumbnail-normal')
                .removeClass('thumbnail-small')
                .removeClass('thumbnail-big');
          });

          $('.unig-image-size-big-trigger').click(function () {
            console.log('big', this);
            Scope.$target.addClass('thumbnail-big')
                .removeClass('thumbnail-normal')
                .removeClass('thumbnail-small');
          });
        },


  };

})(jQuery, Drupal, drupalSettings);