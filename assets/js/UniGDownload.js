/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigDownloads = {
    attach: function (context, settings) {

      // Debug
      console.log('downloads');

      Drupal.downloadFolder = [];
      Drupal.allFiles = [];


      // onload
      constructor(context, settings);

      loadAll();
      loadLocal();
      refreshGUI();

      /**
       *
       * @param context
       * @param settings
       */
      function constructor(context, settings) {

        // Trigger

        // Mark for Download
        $('.unig-file-download-mark-trigger').click(
            function (context, settings) {

              var nid = getNodeId(context);

              toggleDownload(nid);
              safeLocal();
              openDownloadFolder();
            }
        );


        // Clean Folder
        $('.unig-button-dl-folder-clean').click(function (context) {
          cleanDownloadFolder(context);
        });

        // Close Folder
        $('.unig-button-dl-folder-close').click(function (context) {
          closeDownloadFolder(context);
        });


      }

      function toggleDownloadFolder() {

        const $folder = $('.unig-toolbar-download-folder');

        $folder.slideToggle();
      }

      function openDownloadFolder() {

        const $folder = $('.unig-toolbar-download-folder');

        $folder.slideDown();
        $folder.removeClass('close');
        $folder.addClass('open');

      }


      function closeDownloadFolder() {

        const $folder = $('.unig-toolbar-download-folder');

        $folder.slideDown();
        $folder.removeClass('open');
        $folder.addClass('close');

      }

      function toggleDownload(nid) {


        var list = Drupal.downloadFolder;
        console.log('List ', list);
        console.log('nid ', nid);

        // Leere Liste
        if (list === null) {
          markForDownload(nid);
        }
        else {
          var search = list.indexOf(nid);
          if (search != -1) {
            // element found
            console.log('search ', search);

            unMarkForDownload(nid);
          }
          else {
            markForDownload(nid);
          }
        }

      }


      function markForDownload(nid) {
        if (nid) {

          console.log('mark', nid);
          addToDownloadFolder(nid);

          var $target = $('#unig-file-' + nid + ' .unig-file-download-mark');
          var $target_in_list = $('#unig-file-' + nid + ' .unig-file-download-list-mark');
          var $border = $('#unig-file-' + nid);

          $target.addClass('marked');
          $border.addClass('marked');
          $target_in_list.addClass('marked');

          refreshToolBar();
        }
      }

      function unMarkForDownload(nid) {
        if (nid) {

          console.log('unMark NID ', nid);
          removeFromDownloadFolder(nid);


          var $target = $('#unig-file-' + nid + ' .unig-file-download-mark');
          var $target_in_list = $('#unig-file-' + nid + ' .unig-file-download-list-mark');
          var $border = $('#unig-file-' + nid);

          $target.removeClass('marked');
          $border.removeClass('marked');
          $target_in_list.removeClass('marked');

          refreshToolBar();
        }
      }

      /**
       *
       *
       *
       * @param context
       */
      // HACK: This function is already in unig main !
      function getNodeId(context) {

        var $elem = $(context.target).parents(".unig-file-item");
        var nid = $elem.data('unig-file-nid');
        return nid;
      }

      /**
       *
       *
       *
       * @param nid
       */
      function addToDownloadFolder(nid) {

        var list = Drupal.downloadFolder;

        if (list != null) {
          var result = list.filter(function (e) {
            return String(e).trim();
          });

          console.log('result ', result);
        }else{
          list = [];
        }

        if (nid) {
          list.push(nid);
        }


        Drupal.downloadFolder = list;

      }

      function refreshToolBar(nid) {

        const $folder = $('.unig-dl-tumbnails');
        const $number_of = $('.unig-dl-number-of');


        var list = Drupal.downloadFolder;
        var files = Drupal.allFiles;

        console.log('list ', list);


        var elem_li = '';
        if (list != 0) {
          list.forEach(function (elem) {

            console.log('item ', elem);
            if (elem) {

              var item = files[elem];

              var label = item.title;
              var img_src = item.image.thumbnail;


              elem_li += '<li class="unig-dl" id="unig-dl-' + elem + '">' +

                  '<div class="unig-dl-nid">' + elem + '</div>' +

                  '<div class="unig-dl-image"><img src="' + img_src + '" /></div>' +

                  '<div class="unig-dl-label">' + label + '</div>' +

                  '</li>';
            }
          });
        }

        var prefix = '<ul class="unig-dl">';
        var suffix = '</ul>';


        var html = prefix + elem_li + suffix;
        var number_of_items = list.length;

        $number_of.html(number_of_items);

        $folder.html();
        $folder.html(html);


      }

      /**
       *
       *
       *
       * @param nid
       */
      function removeFromDownloadFolder(nid) {


        var pattern = nid;
        var index = Drupal.downloadFolder.indexOf(pattern);
        // Note: browser support for indexOf is limited; it is not supported in
        // Internet Explorer 7 and 8.


        //remove it
        if (index > -1) {
          Drupal.downloadFolder.splice(index, 1);
        }
      }

      function safeLocal() {

        var download_list = Drupal.downloadFolder;

        download_list = download_list.filter(function(entry) { return /\S/.test(entry); });

        localStorage.setItem("unig", download_list);

      }

      function loadLocal() {

        var list_string = localStorage.getItem("unig");

        if (list_string != null) {

          var list_array = list_string.split(',');

          console.log('localStorage ', list_array);

          if (Object.prototype.toString.call(list_array) === '[object Array]') {

            var list_integer = [];

            list_array = list_array.filter(function(entry) { return /\S/.test(entry); });
            list_array = list_array.filter(function(entry) { return /\S/.test(entry); });


            Drupal.downloadFolder = list_array;

          }

        }

      }

      function refreshGUI() {

        var download_list = Drupal.downloadFolder;



        if (download_list != null) {

          download_list = download_list.filter(function(entry) { return /\S/.test(entry); });

          openDownloadFolder();

          download_list.forEach(function (elem) {

            if (elem) {
              markForDownload(elem);
            }
          })
        }
      }

      function cleanDownloadFolder() {

        var download_list = Drupal.downloadFolder;

        download_list.forEach(function (elem) {

          if (elem) {
            var nid = parseInt(elem);
            unMarkForDownload(nid);

          }
        });

        // delete intern
        Drupal.downloadFolder = [];
        safeLocal();
        refreshToolBar();

      }

      /**
       *
       *
       * @param project_nid
       * @param album_nid
       */
      function loadAll() {
        console.log('load All');

        // Route : unig/unig.ajax.project
        var project_nid = $('#unig-project-nid').val();

        var data = {
          'project_nid': project_nid,
          'album_nid'  : 0
        };


        $.ajax({
          url     : Drupal.url('unig/project/json'),
          type    : 'POST',
          data    : data,
          dataType: 'json',
          success : function (results) {
            Drupal.allFiles = results;
          }
        });


      }

    }
  };

})(jQuery, Drupal, drupalSettings);



