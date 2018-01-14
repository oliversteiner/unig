(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigDownload = {
    attach: function (context, settings) {
      // onload
      console.log('Drupal.behaviors.unigDownload ');


      this.constructor(context, settings);
    },

    isToolbarOpen              : false,
    $toolbar_area              : $('.unig-toolbar-download'),
    $toolbar_area_trigger      : $('.unig-toolbar-download-toggle-trigger'),
    $toolbar_area_open_trigger : $('.unig-toolbar-download-open-trigger'),
    $toolbar_area_close_trigger: $('.unig-toolbar-download-close-trigger'),
    downloadsize               : {},


    $button_clear_list     : $('.unig-button-download-clear-list-trigger'),
    $button_add_all_to_list: $('.unig-button-download-add-all-to-list-trigger'),

    $toolbar_sd : $('.unig-file-download-table-size-sd'),
    $toolbar_hd : $('.unig-file-download-table-size-hd'),
    $toolbar_max: $('.unig-file-download-table-size-max'),

    $bulk_download_sd               : $('.unig-bulk-download-sd-trigger'),
    $bulk_download_hd               : $('.unig-bulk-download-hd-trigger'),
    $bulk_download_max              : $('.unig-bulk-download-max-trigger'),
    $bulk_download_message_container: $('.unig-bulk-download-message-container'),

    toggleToolbar:
        function () {

          if (this.isToolbarOpen) {
            this.closeToolbar();
          }
          else {
            this.openToolbar();
          }
        },


    openToolbar:
        function () {

          this.$toolbar_area.slideDown();
          this.$toolbar_area.addClass('open');
          this.$toolbar_area_trigger.addClass('active');
          this.isToolbarOpen = true;

        },


    closeToolbar:
        function () {

          this.$toolbar_area.slideUp();
          this.$toolbar_area.removeClass('open');
          this.$toolbar_area_trigger.removeClass('active');
          this.isToolbarOpen = false;


        },


    add:
        function (nid) {
          Drupal.behaviors.unigData.FilesForDownload.add(nid);
          Drupal.behaviors.unigData.FilesForDownload.save();

        },


    remove:
        function (nid) {
          Drupal.behaviors.unigData.FilesForDownload.remove(nid);
          Drupal.behaviors.unigData.FilesForDownload.save();

        },


    toggle:
        function (nid) {

          var itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();

          // if first Item in list toggle on
          if (itemsForDownload === false) {
            this.add(nid);
          }
          else {
            // search item in itemsForDownload List
            var is_in_DownloadList = Drupal.behaviors.unigData.FilesForDownload.find(nid);

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
          Drupal.behaviors.unigData.FilesForDownload.save();

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
          const $target_button_number_of = $('.unig-button .unig-dl-number-of');
          const $target_number_of = $('.unig-dl-number-of');

          // get Number
          var number_of_items = Drupal.behaviors.unigData.FilesForDownload.count();

          // Append to DOM
          $target_button_number_of.html(number_of_items);
          $target_number_of.html(number_of_items);

          if (number_of_items > 0) {
            $target_button_number_of.addClass('badge badge-marked');
          }
          else {
            $target_button_number_of.removeClass('badge badge-marked');

          }

          $('.unig-file-download-list-size-sd').html('0');


          var sd = Drupal.behaviors.unig.humanFileSize(this.downloadsize.sd);
          var hd = Drupal.behaviors.unig.humanFileSize(this.downloadsize.hd);
          var max = Drupal.behaviors.unig.humanFileSize(this.downloadsize.max);

          this.$toolbar_sd.html(sd);
          this.$toolbar_hd.html(hd);
          this.$toolbar_max.html(max);
        },

    bulkDownloadStart: function (size) {

      $('.unig-bulk-download-' + size + '-trigger').addClass('active');
      this.$bulk_download_message_container.html('Start Download ' + size + ' Paket');

      var itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();
      var data = {
        size : size,
        projectname : size,
        items: itemsForDownload
      };
      console.log(data);

      $.ajax({
        url     : Drupal.url('unig/download/'),
        type    : 'POST',
        data    : {
          'data': data
        },
        dataType: 'json',
        success : function (results) {
          console.log(results);
         if(results.zip) {
            location.href = results.zip;
          }
        }
      });


      return true;

    },

    bulkDownloadCancel: function () {

    },

    updateBulkDownloadMessage: function () {

    },


    buildTumbnails:
        function () {

          // Target
          const $area = $('.unig-dl-tumbnails');

// get Item List
          var itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();
          var itemList = Drupal.behaviors.unigData.FileList.get();
          // console.log('itemList ', itemList);

          var elem_li = '';
          if (itemsForDownload) {
            itemsForDownload.forEach(function (elem) {

              // console.log('itemsForDownload.forEach ', elem);

              // check
              var item = itemList[elem];

              // console.log('item ', item);

              if (item && item.title) {

                var label = item.title;
                var img_src = item.image.unig_small.url;

                elem_li += '<li class="unig-dl" id="unig-dl-' + elem + '" data-nid = "' + elem + '">' +
                    ' <div class="unig-dl-nid">' + elem + '</div>' +
                    ' <div class="unig-dl-image item-overlay">' +
                    '   <img src="' + img_src + '" />' +
                    ' <div class="item-overlay-canvas top">' +
                    '   <span class="item-overlay-text"><i class="fa fa-times" aria-hidden="true"></i>\n</span></div>' +
                    ' </div>' +
                    ' <div class="unig-dl-label">' + label + '</div>' +
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
            Drupal.behaviors.unigDownload.calculateDownloadsize();
            Drupal.behaviors.unigDownload.refreshGUI();
            Drupal.behaviors.unigDownload.updateInfo();

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
          var itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();

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
      this.removeAll();
      this.removeAllMarks();
      this.buildTumbnails();
      this.calculateDownloadsize();
      this.refreshGUI();
      this.updateInfo();
      this.save();
    },

    fillDownloadList: function () {
      this.addAll();
      this.addAllMarks();
      this.buildTumbnails();
      this.calculateDownloadsize();
      this.refreshGUI();
      this.updateInfo();
      this.save();
    },

    /**
     *
     *
     */
    removeAll: function () {

      Drupal.behaviors.unigData.FilesForDownload.destroy();
    },

    /**
     *
     *
     */
    removeAllMarks: function () {

      var listItem = Drupal.behaviors.unigData.FileList.get();


      if (listItem) {

        for (var key in listItem) {

          this.removeMark(key);

        }
      }
    },


    addAllMarks: function () {

      var listItem = Drupal.behaviors.unigData.FileList.get();


      if (listItem) {

        for (var key in listItem) {

          this.addMark(key);

        }
      }
    },


    addAll: function () {
      this.removeAll();
      var listItem = Drupal.behaviors.unigData.FileList.get();

      if (listItem) {

        for (var key in listItem) {

          this.add(key);

        }
      }
    },

    /**
     * calculate Downloadsize
     *
     *
     */

    calculateDownloadsize: function () {

      var itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();
      var itemList = Drupal.behaviors.unigData.FileList.get();

      //
      this.downloadsize = {
        sd : 0,
        hd : 0,
        max: 0
      };


      if (itemsForDownload) {
        itemsForDownload.forEach(function (item) {

          var Downloadsize = Drupal.behaviors.unigDownload.downloadsize;
          var file = itemList[item];

          var sd = file.image.unig_medium.filesize;
          var hd = file.image.unig_big.filesize;
          var max = file.image.original.filesize;

          Downloadsize.sd = Downloadsize.sd + sd;
          Downloadsize.hd = Downloadsize.hd + hd;
          Downloadsize.max = Downloadsize.max + max;

        })
      }


      console.log('Downloadsize', this.downloadsize);


    },

    /**
     *
     * @param context
     * @param settings
     */
    constructor: function (context, settings) {


      // promise : wait for data from server
      Drupal.behaviors.unigData.FileList.load().then(function () {

        // successCallback
        var itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.load();
        if (itemsForDownload) {

          var count = Drupal.behaviors.unigData.FilesForDownload.count();
          if (count > 0) {

            // After Success
            Drupal.behaviors.unigDownload.openToolbar();
            Drupal.behaviors.unigDownload.calculateDownloadsize();
            Drupal.behaviors.unigDownload.refreshGUI();
            Drupal.behaviors.unigDownload.updateInfo();
          }
        }

      }, function (reason) {

        // failureCallback

      });


      // Trigger

      // Mark for Download
      $('.unig-file-download-mark-trigger').click(
          function (context, settings) {

            var Scope = Drupal.behaviors.unigDownload;

            // get Node ID
            var nid = Drupal.behaviors.unig.getNodeId(context);

            // Add to Download-List
            Scope.toggle(nid);

            // Mark as Download-Item
            Scope.toggleMark(nid);

            // Update Infos
            Scope.calculateDownloadsize();

            // Build Download Area
            Scope.refreshGUI();

            // Save to localStorage
            Drupal.behaviors.unigData.FilesForDownload.save();

          }
      );

      // Add All Files to Download
      this.$button_add_all_to_list.click(function (context) {

        Drupal.behaviors.unigDownload.fillDownloadList(context);
      });


      // Clean Folder
      this.$button_clear_list.click(function (context) {

        Drupal.behaviors.unigDownload.clearDownloadList(context);
      });


      // Close Toolbar
      this.$toolbar_area_close_trigger.click(function (context) {

        Drupal.behaviors.unigDownload.closeToolbar(context);
      });

      // Open Toolbar
      this.$toolbar_area_open_trigger.click(function (context) {

        Drupal.behaviors.unigDownload.closeToolbar(context);
      });

      // Toggle Toolbar
      this.$toolbar_area_trigger.click(function (context) {

        Drupal.behaviors.unigDownload.toggleToolbar(context);
      });


      // Start Bulk Download
      this.$bulk_download_sd.click(function (context) {

        Drupal.behaviors.unigDownload.bulkDownloadStart('sd');
      });

      this.$bulk_download_hd.click(function (context) {

        Drupal.behaviors.unigDownload.bulkDownloadStart('hd');
      });

      this.$bulk_download_max.click(function (context) {

        Drupal.behaviors.unigDownload.bulkDownloadStart('max');
      });
    }
  }

})(jQuery, Drupal, drupalSettings);



