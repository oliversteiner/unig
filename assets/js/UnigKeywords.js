(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigKeywords = {
    attach: function (context, settings) {
      // onload
      console.log('Drupal.behaviors.unigKeywords ');


      this.constructor(context, settings);
    },

    isToolbarOpen              : false,
    $toolbar_area              : $('.unig-toolbar-keywords'),
    $toolbar_area_trigger      : $('.unig-toolbar-keywords-toggle-trigger'),
    $toolbar_area_close_trigger: $('.unig-toolbar-keywords-close-trigger'),
    $toolbar_area_open_trigger : $('.unig-toolbar-keywords-open-trigger'),

    search_input   : '#unig-toolbar-head-search input',
    $tags_container: $('.unig-toolbar-keywords-tags-container'),

    $check_all_keywords_trigger  : $('unig-button-keywords-check-all'),
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
        function (id) {
          Drupal.behaviors.unigData.keywordsStorage.add(id);
          this.addMark(id);
        },

    remove:
        function (id) {
          Drupal.behaviors.unigData.keywordsStorage.remove(id);
          this.removeMark(id)
        },

    toggle:
        function (id) {
          console.log('toggle ', id);

          var keywordsStorage = Drupal.behaviors.unigData.keywordsStorage.get();

          // if first Item in list toggle on
          if (keywordsStorage === false) {
            this.add(id);
          }
          else {
            // search item in keywordsStorage List
            var is_in_DownloadList = Drupal.behaviors.unigData.keywordsStorage.find(id);

            if (is_in_DownloadList) {

              // if item in list. toggle off
              this.remove(id);
            }
            else {
              // if item  not in list. toggle on
              this.add(id);
            }
          }

        },

    save:
        function () {
          Drupal.behaviors.unigData.keywordsStorage.save();

        },

    addMark:
        function (id) {
          if (id) {
            console.log('addMark ', id);

            var $target = $('#unig-tag-id-' + id);
            $target.addClass('active');

          }
        },

    removeMark:
        function (id) {
          if (id) {

            var $target = $('#unig-tag-id-' + id);

            $target.removeClass('active');

          }
        },

    toggleMark:
        function (id) {
          console.log('toggleMark ', id);

          var $target = $('#unig-tag-id-' + id);

          if ($target.hasClass('active')) {
            // if item in list. toggle off
            this.removeMark(id);
          }
          else {
            // if item  not in list. toggle on
            this.addMark(id);
          }

        },

    updateInfo:
        function () {

          // target
          const $target_number_of = $('.unig-keywords-number-of');

          // get Number
          var number_of_items = Drupal.behaviors.unigData.keywordsStorage.count();

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
          var number_of_items =  Drupal.behaviors.unigData.keywordsList.count();

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
          var itemList =  Drupal.behaviors.unigData.keywordsList.get();
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


              elem_li += '<li class="unig-tag unig-tag-keywords' + additional_class + '" id="unig-tag-id-' + id + '" data-id = "' + id + '">' +
                  '<span class="unig-keyword-tag-id">' + id + '</span> ' +
                  '<span class="unig-keyword-tag-label">' + label + '</span>' +
                  '</li>';

            });
          }

          var prefix = '<ul class="unig-tags unig-tags-keywords">';
          var suffix = '</ul>';

          var button_mark_all =  '<div class="unig-tag unig-mark-all-tags unig-keywords-mark-all-tags"><i class="fa fa-circle" aria-hidden="true"></i><span class="unig-tags-title">check all</span></div>';

          var button_un_mark_all = '<div class="unig-tag unig-unmark-all-tags unig-keywords-unmark-all-tags"><i class="fa fa-circle-o" aria-hidden="true"></i><span class="unig-tags-title">uncheck all</span></div>';

          // Build DOM
          var html = button_mark_all + button_un_mark_all + prefix + elem_li + suffix;

          // Add to dom
          this.$tags_container.html(html);

          // Add Handler
          $('ul.unig-tags-keywords').on('click', 'li', function () {
            var id = $(this).data('id');
            Drupal.behaviors.unigKeywords.toggle(id);
            Drupal.behaviors.unigKeywords.save();

          });
          $('.unig-keywords-mark-all-tags').click(function () {
            Drupal.behaviors.unigKeywords.addAll();
          });

          $('.unig-keywords-unmark-all-tags').click(function () {
            Drupal.behaviors.unigKeywords.removeAll();
          })
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
          var keywordsStorage = Drupal.behaviors.unigData.keywordsStorage.get();

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
      Drupal.behaviors.unigData.keywordsStorage.destroy();
      this.removeMarkAll();
      this.buildTags();
      this.updateInfo();
      this.save();
    },
    /**
     *
     *
     */
    removeAll:
        function () {

          var listItem = Drupal.behaviors.unigData.itemList.get();


          if (listItem) {

            for (var key in listItem) {

              this.remove(key);

            }
          }
        },
    addAll:
        function () {

          var listItem = Drupal.behaviors.unigData.itemList.get();


          if (listItem) {

            for (var key in listItem) {

              this.add(key);

            }
          }
        },
    /**
     *
     *
     */
    removeMarkAll:
        function () {

      var listItem = Drupal.behaviors.unigData.itemList.get();

      // console.log('listItem ', listItem);

      if (listItem) {

        for (var key in listItem) {

          this.removeMark(key);

        }
      }
    },
    addMarkAll:
        function () {

          var listItem = Drupal.behaviors.unigData.itemList.get();

          // console.log('listItem ', listItem);

          if (listItem) {

            for (var key in listItem) {

              this.addMark(key);

            }
          }
        },
    /**
     *
     * https://goodies.pixabay.com/javascript/auto-complete
     *
     */
    searchAutocomplete: function () {

      var auto_complete = new autoComplete({
        selector  : '*[name="unig-keywords-autocomplete"]',
        minChars  : 2,
        source    : function (term, suggest) {
          term = term.toLowerCase();
          const choices =  Drupal.behaviors.unigData.keywordsList.get();
          var matches = [];
          for (var i = 0; i < choices.length; i++) {
            if (~choices[i]['name'].toLowerCase().indexOf(term)) {
              matches.push(choices[i]);
            }
          }
          suggest(matches);
        },
        renderItem: function (item, search) {
          search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');


          return '<div class="autocomplete-suggestion" data-name="' + item['name'] + '" data-id="' + item['id'] + '" data-val="' + search + '">' + item['name'] + '</div>';
        },

        onSelect: function (e, term, item) {

          const id = item.getAttribute('data-id');
          const name = item.getAttribute('data-name');
          console.log(id + ' - ' + name);
          Drupal.behaviors.unigKeywords.addMark(id);

        }
      });

    },

    /**
     *
     * @param context
     * @param settings
     */
    constructor: function (context, settings) {


      // promise : wait for data from server
       Drupal.behaviors.unigData.keywordsList.load().then(function (value) {


        Drupal.behaviors.unigKeywords.searchAutocomplete();
        Drupal.behaviors.unigKeywords.buildTags();
        // successCallback
        var keywordsStorage = Drupal.behaviors.unigData.keywordsStorage.load();
        if (keywordsStorage) {

          var count = Drupal.behaviors.unigData.keywordsStorage.count();
          if (count > 0) {
            Drupal.behaviors.unigKeywords.openToolbar();
            Drupal.behaviors.unigKeywords.refreshGUI();
          }
        }
        Drupal.behaviors.unigKeywords.openToolbar();

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


      // Autocomplate


    }
  }

})(jQuery, Drupal, drupalSettings);



