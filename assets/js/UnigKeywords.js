(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigKeywords = {
    attach: function (context, settings) {
      // onload
      console.log('Drupal.behaviors.unigKeywords ');


      this.constructor(context, settings);
    },

    isToolbarOpen: false,
    $toolbar_area: $('.unig-toolbar-keywords'),
    $toolbar_area_trigger: $('.unig-toolbar-keywords-toggle-trigger'),
    $toolbar_area_close_trigger: $('.unig-toolbar-keywords-close-trigger'),
    $toolbar_area_open_trigger: $('.unig-toolbar-keywords-open-trigger'),

    $search_trigger: $('.unig-toolbar-head-search'),
    $tags_container: $('.unig-toolbar-keywords-tags-container'),

    $check_all_keywords_trigger: $('unig-button-keywords-check-all'),
    $uncheck_all_keywords_trigger: $('unig-button-keywords-uncheck-all'),

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
          Drupal.behaviors.unig.keywordsStorage.add(nid);
          Drupal.behaviors.unig.keywordsStorage.save();
        },

    remove:
        function (nid) {
          Drupal.behaviors.unig.keywordsStorage.remove(nid);
          Drupal.behaviors.unig.keywordsStorage.save();
        },

    toggle:
        function (nid) {

          var keywordsStorage = Drupal.behaviors.unig.keywordsStorage.get();

          // if first Item in list toggle on
          if (keywordsStorage === false) {
            this.add(nid);
          }
          else {
            // search item in keywordsStorage List
            var is_in_DownloadList = Drupal.behaviors.unig.keywordsStorage.find(nid);

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
          Drupal.behaviors.unig.keywordsStorage.save();

        },

    addMark:
        function (nid) {
          if (nid) {

            var $target = $('#unig-file-' + nid + ' .unig-keyword-mark');
            var $target_in_list = $('#unig-file-' + nid + ' .unig-keyword-list-mark');
            var $border = $('#unig-file-' + nid);

            $target.addClass('marked');
            $border.addClass('marked');
            $target_in_list.addClass('marked');

          }
        },

    removeMark:
        function (nid) {
          if (nid) {

            var $target = $('#unig-file-' + nid + ' .unig-keyword-mark');
            var $target_in_list = $('#unig-file-' + nid + ' .unig-keyword-list-mark');
            var $border = $('#unig-file-' + nid);

            $target.removeClass('marked');
            $border.removeClass('marked');
            $target_in_list.removeClass('marked');

          }
        },

    toggleMark:
        function (nid) {

          var $target = $('#unig-keyword-tag-' + nid);

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
          const $target_number_of = $('.unig-keywords-number-of');

          // get Number
          var number_of_items = Drupal.behaviors.unig.keywordsStorage.count();

          // Append to DOM
          $target_number_of.html(number_of_items);

          if (number_of_items > 0) {
            $target_number_of.addClass('badge badge-marked');
          }
          else {
            $target_number_of.removeClass('badge badge-marked');

          }
        },

    updateInfoAllKeywords:
        function () {

          // target
          const $target_number_of = $('.unig-all-keywords-number-of');

          // get Number
          var number_of_items = Drupal.behaviors.unig.keywordsList.count();

          // Append to DOM
          $target_number_of.html(number_of_items);

          if (number_of_items > 0) {
            $target_number_of.addClass('badge badge-marked');
          }
          else {
            $target_number_of.removeClass('badge badge-marked');

          }
        },


    buildTags:
        function () {

          // Target

// get Item List
          var itemList = Drupal.behaviors.unig.keywordsList.get();
          console.log('itemList ', itemList);

          var elem_li = '';
          if (itemList) {
            itemList.forEach(function (item) {

              // console.log('keywordsStorage.forEach ', elem);

              // check
              var additional_class = '';

              console.log('item ', item);
              const id = item.id;
              const label = item.name;

              elem_li = '<li class="unig-keyword-tag ' + additional_class + '" id="unig-keyword-tag-' + id + '" data-tid = "' + id + '">' +
                  '<div class="unig-keyword-tag-nid">' + id + '</div>' +
                  '<div class="unig-dl-label">' + label + '</div>' +
                  '</li>';

            });
          }

          var prefix = '<ul class="unig-keywords-tags">';
          var suffix = '</ul>';

          // Build DOM
          var html = prefix + elem_li + suffix;

          // Add to dom
          this.$tags_container.html(html);

          // Add Handler
          $('ul.unig-keywords-tags').on('click', 'li', function () {
            var nid = $(this).data('nid');
            Drupal.behaviors.unigKeywords.toggle(nid);
            Drupal.behaviors.unigKeywords.toggleMark(nid);
            Drupal.behaviors.unigKeywords.refreshGUI();
            Drupal.behaviors.unigKeywords.save();

          });
        },


    /**
     *
     *
     *
     */
    refreshGUI:
        function () {

          this.isToolbarOpen = true;


          // Get Download Item List
          var keywordsStorage = Drupal.behaviors.unig.keywordsStorage.get();

          if (keywordsStorage) {
            keywordsStorage.forEach(function (elem) {
              if (elem) {
                Drupal.behaviors.unigKeywords.addMark(elem);
              }
            })
          }

          this.buildTags();
          this.updateInfo();
        },

    clearDownloadList: function () {
      Drupal.behaviors.unig.keywordsStorage.destroy();
      this.removeMarkAll();
      this.buildTags();
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
      Drupal.behaviors.unig.keywordsList.load().then(function (value) {

        Drupal.behaviors.unigKeywords.buildTags();
        // successCallback
        var keywordsStorage = Drupal.behaviors.unig.keywordsStorage.load();
        if (keywordsStorage) {

          var count = Drupal.behaviors.unig.keywordsStorage.count();
          if (count > 0) {
            Drupal.behaviors.unigKeywords.openToolbar();
            Drupal.behaviors.unigKeywords.refreshGUI();
          }
        }

      }, function (reason) {

        // failureCallback

      });


      // Close Toolbar
      this.$toolbar_area_close_trigger.click(function (context) {

        Drupal.behaviors.unigKeywords.closeToolbar(context);
      });

      // Open Toolbar
      this.$toolbar_area_open_trigger.click(function (context) {

        Drupal.behaviors.unigKeywords.closeToolbar(context);
      });

      // Toggle Toolbar
      this.$toolbar_area_trigger.click(function (context) {
        console.log('click');
        Drupal.behaviors.unigKeywords.toggleToolbar(context);
      });
    }
  }

})(jQuery, Drupal, drupalSettings);



