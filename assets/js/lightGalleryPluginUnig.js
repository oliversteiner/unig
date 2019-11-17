(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(['jquery'], function(a0) {
      return factory(a0);
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
})(this, function($) {
  (function() {
    'use strict';

    const defaults = {
      favorite: true,
    };

    let UnigPlugin = function(element) {
      // get lightGallery core plugin data
      this.core = $(element).data('lightGallery');
      this.$el = $(element);

      // extend module default settings with lightGallery core settings
      this.core.s = $.extend({}, defaults, this.core.s);


      this.init();
    };

    UnigPlugin.prototype.init = function() {
      let favorite = '';
      if (this.core.s.favorite) {
        console.log('unigPlugin Loaded');
        favorite =
          '<span class="lg-favorite lg-icon"><i class="far fa-heart"></i></span>';
        this.core.$outer.find('.lg-toolbar').append(favorite);
        this.toggleFavorite();
      }
    };

    UnigPlugin.prototype.toggleFavorite = function() {
      const _this = this;

      /*      $(document).on('fullscreenchange.lg webkitfullscreenchange.lg mozfullscreenchange.lg MSFullscreenChange.lg', function() {
              _this.core.$outer.toggleClass('lg-favorite-on');
            });*/

      this.core.$outer.find('.lg-favorite').on('click.lg', function() {
        console.log('toggle Favorite');
      });
    };

    /**
     * Destroy function must be defined.
     * lightgallery will automatically call your module destroy function
     * before destroying the gallery
     */
    UnigPlugin.prototype.destroy = function() {};

    $.fn.lightGallery.modules.unig = UnigPlugin;
  })();
});
