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

        Storage: Drupal.behaviors.unigData.keywordsStorage,
        List   : Drupal.behaviors.unigData.keywordsList,
        Visible: [],


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
              this.Storage.add(id);


            },

        remove:
            function (id) {
              this.Storage.remove(id);
            },
        /**
         *
         * @param id
         */
        toggle:
            function (id) {

              var keywordsStorage = this.Storage.get();

              // if first Item in list toggle on
              if (keywordsStorage === false) {
                this.add(id);

              }
              else {
                // search item in keywordsStorage List
                var is_in_DownloadList = this.Storage.find(id);

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

        /**
         *
         * @param id
         */
        addMark:
            function (id) {
              console.log('addMark ', id);

              var $target_toolbar = $('#unig-tag-id-' + id);
              $target_toolbar.addClass('active');

              var $target_toolbox = $('.unig-keyword-id-' + id);
              $target_toolbox.addClass('active');

            },
        /**
         *
         * @param id
         */
        removeMark:
            function (id) {

              var $target = $('#unig-tag-id-' + id);
              $target.removeClass('active');

              var $target_toolbox = $('.unig-keyword-id-' + id);
              $target_toolbox.removeClass('active');

            },

        toggleMark   :
            function (id) {

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
        /**
         *
         *
         */
        removeAll    :
            function () {

              this.Storage.destroy();
            },
        addAll       :
            function () {

              var items = this.List.get();

              for (var i = 0; i < items.length; i++) {
                this.add(items[i]['id']);
              }
            },
        /**
         *
         *
         */
        removeMarkAll:
            function () {


              $('*[id^=unig-tag-id-]').removeClass('active');
            },
        addMarkAll   :
            function () {

              var items = this.List.get();

              for (var i = 0; i < items.length; i++) {
                this.addMark(items[i]['id']);
              }
            },

        updateDisplay:
            function () {


              // target
              const $target_number_of = $('.unig-keywords-display');

              // get Number
              var number_all_items = this.List.count();
              var number_chosen_items = this.Storage.count();


              var text = '';

              // Append to DOM
              if (number_all_items > 0) {

                if (number_chosen_items > 0) {
                  text = number_chosen_items + '&thinsp;/&thinsp;' + number_all_items;
                  $target_number_of.html(text);
                  $target_number_of.addClass('badge badge-marked');

                }
                else {
                  text = number_all_items;
                  $target_number_of.html(text);
                  $target_number_of.removeClass('badge badge-marked');
                }
              }
              else {
                // remove text
                $target_number_of.html();

              }


            },


        buildTags:
            function () {

              var keywordsList = Drupal.behaviors.unigData.keywordsList.get();

              var elem_li = '';
              if (keywordsList) {
                keywordsList.forEach(function (item) {


                  // check
                  var additional_class = '';

                  const id = item.id;
                  const label = item.name;

                  elem_li += '<li class="unig-tag unig-tag-keyword unig-keyword-trigger' + additional_class + '" id="unig-tag-id-' + id + '" data-id = "' + id + '">' +
                      '<span class="unig-keyword-tag-id">' + id + '</span> ' +
                      '<span class="unig-keyword-tag-label">' + label + '</span>' +
                      '</li>';

                });
              }

              var prefix = '<ul class="unig-tags unig-tags-keywords">';
              var suffix = '</ul><span class="build-done"></span>';

              var button_mark_all = '<div class="unig-tag unig-mark-all-tags unig-button-keywords-mark-all-tags unig-keywords-mark-all-tags-trigger"><i class="fa fa-circle" aria-hidden="true"></i><span class="unig-tags-title">check all</span></div>';

              var button_un_mark_all = '<div class="unig-tag unig-unmark-all-tags unig-button-keywords-unmark-all-tags unig-keywords-unmark-all-tags-trigger"><i class="fa fa-circle-o" aria-hidden="true"></i><span class="unig-tags-title">uncheck all</span></div>';

              // Build DOM
              var html = button_mark_all + button_un_mark_all + prefix + elem_li + suffix;

              // Add to dom
              this.$tags_container.html(html);

              var scope = Drupal.behaviors.unigKeywords;


              $('.unig-keywords-mark-all-tags-trigger').click(function () {
                scope.addAll();
                scope.addMarkAll();
                scope.updateDisplay();
                scope.updateFiles();

              });

              $('.unig-keywords-unmark-all-tags-trigger').click(function () {
                scope.removeAll();
                scope.removeMarkAll();
                scope.updateDisplay();
                scope.updateFiles();
              });

              // Update GUI
              $('.build-done').ready(function () {

                // Add Handler
                $('.unig-keyword-trigger').click(function () {

                  var id = $(this).data('id');

                  scope.toggle(id);
                  scope.toggleMark(id);
                  scope.updateDisplay();
                  scope.updateFiles();
                });


                scope.reMark();
                scope.updateDisplay();
              })
            },


        /**
         *
         *
         *
         */
        reMark:
            function () {


              // Get Download Item List
              var keywordsStorage = this.Storage.get();


              if (keywordsStorage) {
                keywordsStorage.forEach(function (elem) {
                  Drupal.behaviors.unigKeywords.addMark(elem);
                })
              }

            },

        clearDownloadList:
            function () {
              this.Storage.destroy();
              this.removeMarkAll();
              this.buildTags();
              this.updateDisplay();
              this.updateFiles();
            },

        /**
         *
         * https://goodies.pixabay.com/javascript/auto-complete
         *
         */
        searchAutocomplete: function () {

          var Scope = Drupal.behaviors.unigKeywords;
          var auto_complete = new autoComplete({
            selector  : '*[name="unig-keywords-autocomplete"]',
            minChars  : 2,
            source    : function (term, suggest) {
              term = term.toLowerCase();
              const choices = Drupal.behaviors.unigData.keywordsList.get();
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
              Scope.add(id);
              Scope.addMark(id);
              Scope.updateDisplay();
              Scope.updateFiles();
            }
          });

        },

        updateFiles: function () {


          Drupal.behaviors.unigKeywords.Visible = [];
          var array_id = Drupal.behaviors.unigData.keywordsStorage.get();
          var full_list = Drupal.behaviors.unigData.FileList.get();

          if (array_id.length > 0) {

            // hide all files with this tag
            var keyword_list = Drupal.behaviors.unigData.FileList.findKeyword(array_id);

            // hide all files not in result_list


            // go through all files
            for (var index in full_list) {

              var hide = true;
              // compare each keyword id with ids in "result_list"
              for (var i = 0; i < keyword_list.length; i++) {

                if (parseInt(keyword_list[i]) === parseInt(index)) {
                  // keyword found !, do not hide file
                  hide = false;
                  $('#unig-file-' + index).slideUp();
                  Drupal.behaviors.unigKeywords.Visible.push(index);

                  break;
                }
              }
              // hide file
              if (hide) {
                $('#unig-file-' + index).slideDown();
              }

            } // for full_list

          }

          else {
            // Show all
            for (var file in full_list) {
              Drupal.behaviors.unigKeywords.Visible.push(file);
              var $elem = $('#unig-file-' + file);

              if ($elem.css("display") == "none" || $elem.css("visibility") == "hidden") {
                // The element is not visible
                $elem.fadeIn();
              }
            }
          }


          console.log('visible ', Drupal.behaviors.unigKeywords.Visible);

          var html = '';
          if (Drupal.behaviors.unigKeywords.Visible.length > 0) {
            html = Drupal.behaviors.unigKeywords.Visible.length + ' von ';

          }
          $('.number_of_visible').html(html);

        }
        ,

        /**
         *
         * @param context
         * @param settings
         */
        constructor: function (context, settings) {

          var Scope = Drupal.behaviors.unigKeywords;
          var List = Drupal.behaviors.unigData.keywordsList;
          var Storage = Drupal.behaviors.unigData.keywordsStorage;

          // preload data from localStorage
          Storage.load();

          // promise : wait for data from server
          List.load().then(function () {

            Scope.searchAutocomplete();
            Scope.buildTags();
            // successCallback
            var keywordsStorage = Storage.get();

            if (keywordsStorage) {
              var count = Storage.count();
              if (count > 0) {
                Scope.openToolbar();
              }
            }
            Scope.openToolbar();


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
            Drupal.behaviors.unigKeywords.toggleToolbar(context);
          });


          // Autocomplate


        }
      }

    }
)(jQuery, Drupal, drupalSettings);



