(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigLazyLoad = {

    FileList: {},
    numberOfFiles: 0,

    attach:
        function (context, settings) {
          console.log(' Drupal.behaviors.unigLazyLoad');
        },



    /**
     *
     */
    loadImages: function () {

      // Get Filelist
      this.FileList = Drupal.behaviors.unigData.FileList.get();
      this.numberOfFiles = Drupal.behaviors.unigData.FileList.count();

      this.buildImgContainer();
      this.loadImagesBlur();

    },

    /**
     *
     */
    loadImagesBlur: function () {

      var i = 0;
      for (var id in this.FileList) {

        // targets
        var DOM_target = document.getElementById('img-preview-' + id + '-medium-blur');
        var DOM_target_placeholder = document.getElementById('unig-lazyload-placeholder-' + id);

        // elem image
        var img_id = 'img-' + id + '-medium-blur';
        var src = this.FileList[id].image['unig_medium_blur'].url;
        var NODE_img = document.createElement("img");
        NODE_img.setAttribute('src', src);
        NODE_img.setAttribute('alt', 'blured preview image');
        NODE_img.setAttribute('id', img_id);

        // add to DOM
        DOM_target.append(NODE_img);

        // if image loaded, remove preview and add blured version
        DOM_target_placeholder.setAttribute('style', 'display:none');
        DOM_target.setAttribute('style', 'display:block');


        // check if all or the 10th image is loaded, then start loading
        // "medium" Images
        if (i >= this.numberOfFiles - 1) {
          document.getElementById(img_id).onload = function () {

            Drupal.behaviors.unigLazyLoad.loadImagesMedium();
          }
        }

        i++;
      }

    },

    /**
     *
     */
    loadImagesSmall: function () {
      var i = 0;

      for (var id in this.FileList) {

        var mode = 'small';
        this.addImage(id, mode);
        i++;
      }

// check if last img is loaded an then load next files
      var img_id = 'img-' + id + '-' + mode;
      if (i >= this.numberOfFiles - 1) {
        document.getElementById(img_id).onload = function () {
          Drupal.behaviors.unigLazyLoad.loadImagesBig();
        }
      }

    },

    /**
     *
     */
    loadImagesMedium: function () {

      var i = 0;
      for (var id in this.FileList) {

        var mode = 'medium';
        this.addImage(id, mode);
        i++;
      }

      // check if last img is loaded an then load next files
      var img_id = 'img-' + id + '-' + mode;
      if (i >= this.numberOfFiles - 1) {
        document.getElementById(img_id).onload = function () {
          Drupal.behaviors.unigLazyLoad.loadImagesSmall();
        }
      }

    },


    /**
     *
     */
    loadImagesBig: function () {

      for (var id in this.FileList) {

        var mode = 'big';
        this.addImage(id, mode);
      }
    },

    /**
     *
     */
    addImage: function (id, mode) {

      // target
      var mode_css = mode.replace("_", "-");
      var selector = ('#unig-file-' + id + ' .img-preview-' + mode_css);
      var ELEM_target = $(selector);

      // elem
      var name = 'unig_' + mode;
      var src = this.FileList[id].image[name].url;
      var img_id = 'img-' + id + '-' + mode;

      var NODE_img = document.createElement("img");
      NODE_img.setAttribute('src', src);
      NODE_img.setAttribute('alt', mode_css);
      NODE_img.setAttribute('id', img_id);

      ELEM_target.append(NODE_img);

      if (mode === 'medium') {
        var selector_blur = ('#unig-file-' + id + ' .img-preview-medium-blur');
        $(selector_blur).hide();
        ELEM_target.show();


      }
    },


    /**
     *
     */
    buildImgContainer: function () {

      var elems_target_image_container = document.querySelectorAll('div.unig-lazyload-container');

      var image_ids = [];
      var index = 0;
      for (var id in this.FileList) {
        image_ids[index] = id;
        index++;
      }



      for (var i = 0; i < elems_target_image_container.length; ++i) {

        // elem
        var DOM_container_medium_blur = document.createElement("div");
        var DOM_container_small = document.createElement("div");
        var DOM_container_medium = document.createElement("div");
        var DOM_container_big = document.createElement("div");

        // css class
        DOM_container_medium_blur.setAttribute('class', 'img-preview-medium-blur');
        DOM_container_small.setAttribute('class', 'img-preview-small');
        DOM_container_medium.setAttribute('class', 'img-preview-medium');
        DOM_container_big.setAttribute('class', 'img-preview-big');

        // ID
        var id = image_ids[i];

        DOM_container_medium_blur.setAttribute('id', 'img-preview-' + id + '-medium-blur');
        DOM_container_small.setAttribute('id', 'img-preview-' + id + '-small');
        DOM_container_medium.setAttribute('id', 'img-preview-' + id + '-medium ');
        DOM_container_big.setAttribute('id', 'img-preview-' + id + '-big');

        // hide element
        DOM_container_small.setAttribute('style', 'display:none');
        DOM_container_medium.setAttribute('style', 'display:none');
        DOM_container_big.setAttribute('style', 'display:none');

        // add new Content
        elems_target_image_container[i].appendChild(DOM_container_medium);
        elems_target_image_container[i].appendChild(DOM_container_medium_blur);
        elems_target_image_container[i].appendChild(DOM_container_small);
        elems_target_image_container[i].appendChild(DOM_container_big);

      }


    }
  }

})(jQuery, Drupal, drupalSettings);