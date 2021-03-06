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
      favorite: false,
      bookmark: false,
    };

    let UnigPlugin = function(element) {
      let currentSlide = 0;
      // get lightGallery core plugin data
      this.core = $(element).data('lightGallery');
      this.$el = $(element);

      // extend module default settings with lightGallery core settings
      this.core.s = $.extend({}, defaults, this.core.s);

      this.init();
    };

    UnigPlugin.prototype.init = function() {
      const _this = this;

      // Favorit
      let favoriteIcon = '';
      if (this.core.s.favorite) {
        favoriteIcon = '<span class="lg-favorite lg-icon"></span>';

        // Add favorite Icon
        this.core.$outer.find('.lg-toolbar').append(favoriteIcon);

        // Get Current Slide
        _this.core.$el.on('onAfterSlide.lg.tm', function(
          event,
          prevIndex,
          index,
        ) {
          setTimeout(() => {
            // save Current Index
            UnigPlugin.currentSlide = index;

            // change Favorite Icon on File Status
            const fileVars = _this.getFileVars(index);
            _this.setFavoritIcon(index, fileVars.favorite);

            // Event Listening
            _this.toggleFavoriteTrigger(index);
          }, 100);
        });
      }

      // Downmload Mark
      let bookmarkIcon = '';
      if (this.core.s.bookmark) {
        bookmarkIcon = '<span class="lg-bookmark lg-icon"></span>';

        // Add favorite Icon
        this.core.$outer.find('.lg-toolbar').append(bookmarkIcon);

        // Get Current Slide
        _this.core.$el.on('onAfterSlide.lg.tm', function(
          event,
          prevIndex,
          index,
        ) {
          setTimeout(() => {
            // save Current Index
            UnigPlugin.currentSlide = index;

            // change Favorite Icon on File Status
            const fileVars = _this.getFileVars(index);
            _this.setBookmarkIcon(index, fileVars.bookmark);

            // Event Listening
            _this.toggleBookmarkTrigger(index);
          }, 100);
        });
      }
    };

    UnigPlugin.prototype.setFavoritIcon = function(index, value) {
      const faClass = value ? 'fas' : 'far';

      this.core.$outer
        .find('.lg-favorite')
        .html('<i class="' + faClass + ' fa-heart"></i>');
    };

    UnigPlugin.prototype.setBookmarkIcon = function(index, value) {

      const faClass = value ? 'fas' : 'far';

      this.core.$outer
        .find('.lg-bookmark')
        .html('<i class="' + faClass + ' fa-bookmark"></i>');
    };

    UnigPlugin.prototype.getFileVars = function() {
      const index = UnigPlugin.currentSlide;

      let fileVars = '';
      if (this.core.s.dynamic) {
        fileVars = this.core.s.dynamicEl[index];
      }

      return fileVars;
    };

    UnigPlugin.prototype.toggleFavoriteTrigger = function(index) {
      const _this = this;
      this.core.$outer.find('.lg-favorite').on('click.lg', function() {
        const fileVars = _this.getFileVars();

        // Send API Command
        Drupal.behaviors.unigFavorite.toggleFavorite(fileVars.id).then(data => {
          if (data) {
            _this.setFavoritIcon(index, data.favorite);
          }
        });
      });
    };

    UnigPlugin.prototype.toggleBookmarkTrigger = function(index) {
      const _this = this;
      this.core.$outer.find('.lg-bookmark').once('bookmark-618521').on('click.lg', function() {
        const fileVars = _this.getFileVars();

        //  Command
        const result = Drupal.behaviors.unigDownload.toggle(fileVars.id);
        setTimeout(() => {
          _this.setBookmarkIcon(index, result);
          _this.core.s.dynamicEl[index].bookmark = result;
        }, 20);
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
