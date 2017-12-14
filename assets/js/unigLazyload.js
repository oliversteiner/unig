(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigLazyLoad = {


    attach:
        function (context, settings) {
          console.log(' Drupal.behaviors.unigLazyLoad');
        },

    FileList: {},

    loadImages: function () {

      // Get Filelist
      this.FileList = Drupal.behaviors.unigData.FileList.get();

      this.loadImagesLow();
    },

    /**
     *
     */
    loadImagesLow: function () {
      console.log(' -> Lazyload Images Low');


      for (var id in this.FileList) {

        var File = this.FileList[id];
        var src = File.image.unig_preview_low;

        this.build_and_add_Image(id, src);
      }

      this.loadImagesMedium();
    },


    /**
     *
     */
    loadImagesMedium: function () {
      console.log(' -> Lazyload Images High');

      for (var id in this.FileList) {

        var File = this.FileList[id];
        var src = File.image.unig_medium;

        this.build_and_add_Image(id, src);
      }

    //  this.loadImagesHigh();
    },


    /**
     *
     */
    loadImagesHigh: function () {
      console.log(' -> Lazyload Images High');

      for (var id in this.FileList) {

        var File = this.FileList[id];
        var src = File.image.unig_hd;

        this.build_and_add_Image(id, src);
      }
    },


    /**
     *
     */
    build_and_add_Image: function (id, src) {
      console.log(id);
      console.log(src);

      var $target = $('#unig-file-' + id);
      var $target_image_container = $('#unig-file-' + id + ' .unig-lazyload-container');

      var DOM_img = document.createElement("img");
      DOM_img.src = src;

      $target_image_container.html(DOM_img);
    }

  }

})(jQuery, Drupal, drupalSettings);