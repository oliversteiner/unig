(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigSize = {


    $target: $('ul.unig-gallery'),

    // buttons
    $button_small : $('.unig-button-image-size-small'),
    $button_medium: $('.unig-button-image-size-medium'),
    $button_big   : $('.unig-button-image-size-big'),

    // images
    // BUG? scope dont work with .hide() and .show()
    img_medium_blur: '.img-preview-medium-blur',
    img_small      : '.img-preview-small',
    img_medium     : '.img-preview-medium',
    img_big        : '.img-preview-big',

    attach:
        function (context, settings) {
          console.log(' Drupal.behaviors.unigSize');
          var Scope = Drupal.behaviors.unigSize;

          // change to small
          $('.unig-image-size-small-trigger').click(function () {

            Scope.reset();
            Scope.$target.addClass('unig-images-small');
            $(Scope.img_small).show();
            Scope.$button_small.addClass('active');

            // hide Elements
            $('.unig-file-head').hide();
            $('.unig-file-middle-toolbox').hide();
          });

          // change to medium
          $('.unig-image-size-medium-trigger').click(function () {

            Scope.reset();
            Scope.$target.addClass('unig-images-medium');
            $(Scope.img_medium).show();
            Scope.$button_medium.addClass('active');
          });

          $('.unig-image-size-big-trigger').click(function () {

            Scope.reset();
            Scope.$target.addClass('unig-images-big');
            $(Scope.img_big).show();
            Scope.$button_big.addClass('active');

          });
        },

    reset: function () {
      console.log('reset ');


      this.$target.removeClass('unig-images-medium-blur');
      this.$target.removeClass('unig-images-small');
      this.$target.removeClass('unig-images-medium');
      this.$target.removeClass('unig-images-big');

      // buttons
      this.$button_small.removeClass('active');
      this.$button_medium.removeClass('active');
      this.$button_big.removeClass('active');

      // Images
      $(this.img_medium_blur).hide();
      $(this.img_small).hide();
      $(this.img_medium).hide();
      $(this.img_big).hide();

    }
  };

})(jQuery, Drupal, drupalSettings);