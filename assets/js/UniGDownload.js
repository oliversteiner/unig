/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigDownload = {
    attach: function (context, settings) {
      // onload
      console.log('Drupal.behaviors.unigDownload ');


      this.constructor(context, settings);
    },

    isFolderActive: false,
    isFolderMax   : false,

    toggleToolbar:
        function () {
          const $target = $('.unig-toolbar-download');

          if ($target.hasClass('open')) {
            this.closeToolbar();
          }
          else {
            this.openToolbar();
          }
        },


    openToolbar:
        function () {

          const $area = $('.unig-toolbar-download');
          const $trigger = $('.unig-toolbar-download-toggle-trigger');

          $area.slideDown();
          $area.addClass('open');
          $trigger.addClass('active')
        },


    closeToolbar:
        function () {

          const $area = $('.unig-toolbar-download');
          const $trigger = $('.unig-toolbar-download-toggle-trigger');

          $area.slideUp();
          $area.removeClass('open');
          $trigger.removeClass('active')

        },


    add:
        function (nid) {
          Drupal.behaviors.unig.itemsForDownload.add(nid);
          Drupal.behaviors.unig.itemsForDownload.save();

        },


    remove:
        function (nid) {
          Drupal.behaviors.unig.itemsForDownload.remove(nid);
          Drupal.behaviors.unig.itemsForDownload.save();

        },


    toggle:
        function (nid) {

          var itemsForDownload = Drupal.behaviors.unig.itemsForDownload.get();

          // if first Item in list toggle on
          if (itemsForDownload === false) {
            this.add(nid);
          }
          else {
            // search item in itemsForDownload List
            var is_in_DownloadList = Drupal.behaviors.unig.itemsForDownload.find(nid);

            if (is_in_DownloadList) {

              // if item in list. toggle off
              this.remove(nid);
            }
            else {
              // if item  not in list. toggle on
              this.add(nid);
            }
          }

        },

    save:
        function () {
          Drupal.behaviors.unig.itemsForDownload.save();

        },

    addMark:
        function (nid) {
          if (nid) {

            var $target = $('#unig-file-' + nid + ' .unig-file-download-mark');
            var $target_in_list = $('#unig-file-' + nid + ' .unig-file-download-list-mark');
            var $border = $('#unig-file-' + nid);

            $target.addClass('marked');
            $border.addClass('marked');
            $target_in_list.addClass('marked');

          }
        },

    removeMark:
        function (nid) {
          if (nid) {

            var $target = $('#unig-file-' + nid + ' .unig-file-download-mark');
            var $target_in_list = $('#unig-file-' + nid + ' .unig-file-download-list-mark');
            var $border = $('#unig-file-' + nid);

            $target.removeClass('marked');
            $border.removeClass('marked');
            $target_in_list.removeClass('marked');

          }
        },

    toggleMark:
        function (nid) {

          var $target = $('#unig-file-' + nid + ' .unig-file-download-mark');

          if ($target.hasClass('marked')) {
            // if item in list. toggle off
            this.removeMark(nid);
          }
          else {
            // if item  not in list. toggle on
            this.addMark(nid);
          }

        },

    updateInfo:
        function () {

          // target
          const $target_number_of = $('.unig-dl-number-of');

          // get Number
          var number_of_items = Drupal.behaviors.unig.itemsForDownload.count();

          // Append to DOM
          $target_number_of.html(number_of_items);

          if (number_of_items > 0) {
            $target_number_of.addClass('badge badge-marked');
          }
          else {
            $target_number_of.removeClass('badge badge-marked');

          }
        },


    buildTumbnails:
        function () {

          // Target
          const $area = $('.unig-dl-tumbnails');

// get Item List
          var itemsForDownload = Drupal.behaviors.unig.itemsForDownload.get();
          var itemList = Drupal.behaviors.unig.itemList.get();
          // console.log('itemList ', itemList);

          var elem_li = '';
          if (itemsForDownload) {
            itemsForDownload.forEach(function (elem) {

              // console.log('itemsForDownload.forEach ', elem);

              // check
              var item = itemList[elem];

              // console.log('item ', item);

              if (item.title) {

                var label = item.title;
                var img_src = item.image.thumbnail;

                elem_li += '<li class="unig-dl" id="unig-dl-' + elem + '" data-nid = "' + elem + '">' +

                    '<div class="unig-dl-nid">' + elem + '</div>' +
                    '<div class="unig-dl-image item-overlay">' +
                    '<img src="' + img_src + '" />' +
                    '<div class="item-overlay-canvas top"><span class="item-overlay-text"><i class="fa fa-times" aria-hidden="true"></i>\n</span></div>' +
                    '</div>' +
                    '<div class="unig-dl-label">' + label + '</div>' +
                    '</li>';
              }
            });
          }

          var prefix = '<ul class="unig-dl">';
          var suffix = '</ul>';

          // Build DOM
          var html = prefix + elem_li + suffix;

          // Add tumbnail to dom
          $area.html(html);

          // Add Handler
          $('ul.unig-dl').on('click', 'li', function () {
            var nid = $(this).data('nid');
            Drupal.behaviors.unigDownload.remove(nid);
            Drupal.behaviors.unigDownload.removeMark(nid);
            Drupal.behaviors.unigDownload.refreshGUI();
            Drupal.behaviors.unigDownload.save();

          });
        },


    /**
     *
     *
     *
     */
    refreshGUI:
        function () {

          if (this.isFolderMax == true) {
            this.openToolbar();
          }
          this.isFolderActive = true;


          // Get Download Item List
          var itemsForDownload = Drupal.behaviors.unig.itemsForDownload.get();

          if (itemsForDownload) {
            itemsForDownload.forEach(function (elem) {
              if (elem) {
                Drupal.behaviors.unigDownload.addMark(elem);
              }
            })
          }

          this.buildTumbnails();
          this.updateInfo();
        },

    clearDownloadList: function () {
      Drupal.behaviors.unig.itemsForDownload.destroy();
      this.removeMarkAll();
      this.buildTumbnails();
      this.updateInfo();
      this.save();
    },

    /**
     *
     *
     */
    removeMarkAll: function () {

      var listItem = Drupal.behaviors.unig.itemList.get();

      // console.log('listItem ', listItem);

      if (listItem) {

        for (var key in listItem) {

          this.removeMark(key);

        }
      }
    },


    /**
     *
     * @param context
     * @param settings
     */
    constructor: function (context, settings) {


      // promise : wait for data from server
      Drupal.behaviors.unig.itemList.load().then(function (value) {

        // successCallback
        var itemsForDownload = Drupal.behaviors.unig.itemsForDownload.load();
        if (itemsForDownload) {

          var count = Drupal.behaviors.unig.itemsForDownload.count();
          if (count > 0) {
            Drupal.behaviors.unigDownload.openToolbar();
            Drupal.behaviors.unigDownload.refreshGUI();
          }
        }

      }, function (reason) {

        // failureCallback

      });


      // Trigger

      // Mark for Download
      $('.unig-file-download-mark-trigger').click(
          function (context, settings) {

            // get Node ID
            var nid = Drupal.behaviors.unig.getNodeId(context);

            // Mark as Download-Item
            Drupal.behaviors.unigDownload.toggle(nid);

            // Mark as Download-Item
            Drupal.behaviors.unigDownload.toggleMark(nid);

            // Build Download Area
            Drupal.behaviors.unigDownload.refreshGUI();

            // Save to localStorage
            Drupal.behaviors.unig.itemsForDownload.save();

          }
      );

      $('.unig-toolbar-download-toggle-trigger').click(
          function (context, settings) {
            Drupal.behaviors.unigDownload.toggleToolbar();

          }
      );

      // Clean Folder
      $('.unig-button-download-clear-list-trigger').click(function (context) {
        Drupal.behaviors.unigDownload.clearDownloadList(context);

        // Build Download Area
        Drupal.behaviors.unigDownload.refreshGUI();

        // Save to localStorage
        Drupal.behaviors.unig.itemsForDownload.save();
      });


      // Close Folder
      $('.unig-button-toolbar-download-close-trigger').click(function (context) {

        Drupal.behaviors.unigDownload.closeToolbar(context);
      });

      // Close Folder
      $('.unig-button-toolbar-download-trigger').click(function (context) {

        Drupal.behaviors.unigDownload.openToolbar(context);
      });
    }
  }

})(jQuery, Drupal, drupalSettings);



