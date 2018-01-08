(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigLazyLoad = {


    attach:
        function (context, settings) {
          console.log(' Drupal.behaviors.unigLazyLoad');
        },

    FileList: {},

    loadImages: function () {

      this.buildImgContainer();
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
        var mode = 'normal';
        this.addImage(id, src, mode);
      }
      this.loadImagesMedium();
    },


    /**
     *
     */
    loadImagesMedium: function () {
      console.log(' -> Lazyload Images Normal');

      for (var id in this.FileList) {

        var File = this.FileList[id];
        var src = File.image.unig_medium;
        var mode = 'normal';
        this.addImage(id, src, mode);
      }

      this.loadImagesHigh();
    },


    /**
     *
     */
    loadImagesHigh: function () {
      console.log(' -> Lazyload Images High');

      for (var id in this.FileList) {

        var File = this.FileList[id];
        var src = File.image.unig_medium;
        var mode = 'high';
        this.addImage(id, src, mode);
      }
    },


    /**
     *
     */
    buildImgContainer: function () {

      var $target_image_container = $('.unig-lazyload-container');

      // elem
      var DOM_container_small = document.createElement("div");
      var DOM_container_normal = document.createElement("div");
      var DOM_container_big = document.createElement("div");

      // css class
      DOM_container_small.setAttribute('class', 'img-preview-small');
      DOM_container_normal.setAttribute('class', 'img-preview-normal');
      DOM_container_big.setAttribute('class', 'img-preview-big');

      // add
      $target_image_container.appendChild(DOM_container_small)
          .appendChild(DOM_container_normal)
          .appendChild(DOM_container_big);
    },

    addImage: function (id, src, mode) {
      console.log(id);
      console.log(src);

      var $target_image_container = $('#unig-file-' + id + ' .img-preview-' + mode);

      // elem
      var DOM_img = document.createElement("img");
      DOM_img.src = src;

      $target_image_container.html(DOM_img);
    }

  }

})(jQuery, Drupal, drupalSettings);