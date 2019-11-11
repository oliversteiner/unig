(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigSize = {
    currentSize:'medium',

    $target: $('ul.unig-gallery'),

    // buttons
    $button_small: $('.unig-button-image-size-small'),
    $button_medium: $('.unig-button-image-size-medium'),
    $button_large: $('.unig-button-image-size-large'),

    // images
    img_small: '.img-preview-small',
    img_medium: '.img-preview-medium',
    img_large: '.img-preview-large',

    attach(context, settings) {
      $('#unig-main', context)
        .once('unigSize')
        .each(() => {
          const { unigSize } = Drupal.behaviors;

          // change to small
          $('.unig-image-size-small-trigger').click(() => {
            this.currentSize ='small';
            unigSize.reset();
            unigSize.$target.addClass('unig-images-small');
            $(unigSize.img_small).show();
            unigSize.$button_small.addClass('active');
          });

          // change to medium
          $('.unig-image-size-medium-trigger').click(() => {
            this.currentSize ='medium';

            unigSize.reset();
            unigSize.$target.addClass('unig-images-medium');
            $(unigSize.img_medium).show();
            unigSize.$button_medium.addClass('active');
          });

          // change to Large
          $('.unig-image-size-large-trigger').click(() => {
            this.currentSize ='large';
            unigSize.reset();
            unigSize.$target.addClass('unig-images-large');
            $(unigSize.img_large).show();
            unigSize.$button_large.addClass('active');
          });
        });
    },

    reset() {
      this.$target.removeClass('unig-images-small');
      this.$target.removeClass('unig-images-medium');
      this.$target.removeClass('unig-images-large');

      // buttons
      this.$button_small.removeClass('active');
      this.$button_medium.removeClass('active');
      this.$button_large.removeClass('active');

      // Images
      $(this.img_small).hide();
      $(this.img_medium).hide();
      $(this.img_large).hide();
    },
  };
})(jQuery, Drupal, drupalSettings);
