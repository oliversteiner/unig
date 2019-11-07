(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigKeywords = {
    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigKeywords')
        .each(() => {
          this.constructor(context, settings);
          this.addAll();
          this.markAllAsActive();
          this.updateDisplay();
        });
    },

    isToolbarOpen: false,

    $tags_container: $('.unig-toolbar-keywords-tags-container', this.context),

    $check_all_keywords_trigger: $(
      'unig-button-keywords-check-all',
      this.context,
    ),
    $uncheck_all_keywords_trigger: $(
      'unig-button-keywords-uncheck-all',
      this.context,
    ),

    Storage: Drupal.behaviors.unigData.keywordsStorage,
    List: Drupal.behaviors.unigData.allKeywords,
    Visible: [],

    toggleToolbar(context) {
      if (this.isToolbarOpen) {
        this.closeToolbar(context);
      } else {
        this.openToolbar(context);
      }
    },

    openToolbar() {
      $('.unig-toolbar-keywords').slideDown();
      $('.unig-toolbar-keywords').addClass('open');
      $('.unig-toolbar-keywords-toggle-trigger').addClass('active');
      this.isToolbarOpen = true;
    },

    closeToolbar() {
      $('.unig-toolbar-keywords').slideUp();
      $('.unig-toolbar-keywords').removeClass('open');
      $('.unig-toolbar-keywords-toggle-trigger').removeClass('active');
      this.isToolbarOpen = false;
    },

    add(id) {
      this.Storage.add(id);
    },

    remove(id) {
      this.Storage.remove(id);
    },
    /**
     *
     * @param id
     */
    toggle(id) {
      const keywordsStorage = this.Storage.get();

      // if first Item in list toggle on
      if (keywordsStorage === false) {
        this.add(id);
      } else {
        // search item in keywordsStorage List
        const IsInDownloadList = this.Storage.find(id);

        if (IsInDownloadList) {
          // if item in list. toggle off
          this.remove(id);
        } else {
          // if item  not in list. toggle on
          this.add(id);
        }
      }
    },

    /**
     *
     * @param id
     */
    markAsActive(id) {
      const $targetToolbar = $(`#unig-tag-id-${id}`);
      $targetToolbar.addClass('active');

      const $targetToolbox = $(`.unig-keyword-id-${id}`);
      $targetToolbox.addClass('active');
    },
    /**
     *
     * @param id
     */
    markAsInactive(id) {
      const $target = $(`#unig-tag-id-${id}`);
      $target.removeClass('active');

      const $targetToolbox = $(`.unig-keyword-id-${id}`);
      $targetToolbox.removeClass('active');
    },

    toggleMark(id) {
      const $target = $(`#unig-tag-id-${id}`);

      if ($target.hasClass('active')) {
        // if item in list. toggle off
        this.markAsInactive(id);
      } else {
        // if item  not in list. toggle on
        this.markAsActive(id);
      }
    },
    /**
     *
     *
     */
    removeAll() {
      this.Storage.destroy();
    },
    /**
     *
     *
     */
    addAll() {
      const items = this.List.get();

      for (let i = 0; i < items.length; i++) {
        this.add(items[i].id);
      }
    },
    /**
     *
     *
     */
    markAllAsInactive() {
      $('*[id^=unig-tag-id-]').removeClass('active');
    },
    /**
     *
     *
     */
    markAllAsActive() {
      const items = this.List.get();

      for (let i = 0; i < items.length; i++) {
        this.markAsActive(items[i].id);
      }
    },
    /**
     *
     *
     */
    updateDisplay() {
      // target
      const $targetNumberOf = $('.unig-keywords-display');

      // get Number
      const numberAllItems = this.List.count();
      const numberChosenItems = this.Storage.count();

      let text = '';

      // Append to DOM
      if (numberAllItems > 0) {
        if (numberChosenItems > 0) {
          text = `${numberChosenItems}&thinsp;/&thinsp;${numberAllItems}`;
          $targetNumberOf.html(text);
          $targetNumberOf.addClass('badge badge-marked');
        } else {
          text = numberAllItems;
          $targetNumberOf.html(text);
          $targetNumberOf.removeClass('badge badge-marked');
        }
      } else {
        // remove text
        $targetNumberOf.html();
      }
    },

    buildTags(keywordsList) {

      console.log('keywordsList', keywordsList);

      let elemLi = '';
      if (keywordsList) {
        keywordsList.forEach(item => {
          // check
          const additionalClass = '';
          const label = item.name;

          elemLi +=
            `<li class="unig-tag unig-tag-keyword unig-keyword-trigger${additionalClass}" 
                id="unig-tag-id-${item.id}" 
                data-id = "${item.id}">` +
            `<span class="unig-keyword-tag-id">${item.id}</span>` +
            `<span class="unig-keyword-tag-label">${label}</span>` +
            `</li>`;
        });
      }

      const prefix = '<ul class="unig-tags unig-tags-keywords">';
      const suffix = '</ul><span class="build-done"></span>';

      const buttonMarkAll =
        '<div class="unig-tag unig-mark-all-tags unig-button-keywords-mark-all-tags unig-keywords-mark-all-tags-trigger">' +
        '<i class="fas fa-circle" aria-hidden="true"></i>' +
        '<span class="unig-tags-title">check all</span>' +
        '</div>';

      const buttonUnMarkAll =
        '<div class="unig-tag unig-unmark-all-tags unig-button-keywords-unmark-all-tags unig-keywords-unmark-all-tags-trigger">' +
        '<i class="far fa-circle" aria-hidden="true"></i>' +
        '<span class="unig-tags-title">uncheck all</span>' +
        '</div>';

      // Build DOM
      const html = buttonMarkAll + buttonUnMarkAll + prefix + elemLi + suffix;

      // Add to dom
      this.$tags_container.html(html);

      const scope = Drupal.behaviors.unigKeywords;

      $('.unig-keywords-mark-all-tags-trigger').click(() => {
        scope.addAll();
        scope.markAllAsActive();
        scope.updateDisplay();
        scope.updateFiles();
      });

      $('.unig-keywords-unmark-all-tags-trigger').click(() => {
        scope.removeAll();
        scope.markAllAsInactive();
        scope.updateDisplay();
        scope.updateFiles();
      });

      // Update GUI

      $('.build-done').ready(() => {
        // Add Handler
        $('.unig-keyword-trigger').click(function() {
          const id = $(this).data('id');

          scope.toggle(id);
          scope.toggleMark(id);
          scope.updateDisplay();
          scope.updateFiles();
        });

        scope.reMark();
        scope.updateDisplay();
      });
    },

    /**
     *
     *
     *
     */
    reMark() {
      // Get Download Item List
      const keywordsStorage = this.Storage.get();

      if (keywordsStorage) {
        keywordsStorage.forEach(elem => {
          Drupal.behaviors.unigKeywords.markAsActive(elem);
        });
      }
    },

    clearDownloadList() {
      this.Storage.destroy();
      this.markAllAsInactive();
      this.buildTags();
      this.updateDisplay();
      this.updateFiles();
    },

    /**
     *
     * https://goodies.pixabay.com/javascript/auto-complete
     *
     */
    searchAutocomplete() {
      const Scope = Drupal.behaviors.unigKeywords;
      const UnigAutoComplete = new autoComplete({
        selector: '*[name="unig-keywords-autocomplete"]',
        minChars: 2,
        source(term, suggest) {
          term = term.toLowerCase();
          const choices = Drupal.behaviors.unigData.allKeywords.get();
          const matches = [];
          for (let i = 0; i < choices.length; i++) {
            if (choices[i].name.toLowerCase().indexOf(term)) {
              matches.push(choices[i]);
            }
          }
          suggest(matches);
        },
        renderItem(item, search) {
          search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

          return `<div class="autocomplete-suggestion" data-name="${item.name}" data-id="${item.id}" data-val="${search}">${item.name}</div>`;
        },

        onSelect(e, term, item) {
          const id = item.getAttribute('data-id');
          Scope.add(id);
          Scope.markAsActive(id);
          Scope.updateDisplay();
          Scope.updateFiles();
        },
      });
    },

    updateFiles() {
      $('.unig-button-download-add-current-to-list').hide();

      Drupal.behaviors.unigKeywords.Visible = [];
      const keywordIds = Drupal.behaviors.unigData.keywordsStorage.get();
      const number_of_all_items = Drupal.behaviors.unigData.FileList.count();
      const fullList = Drupal.behaviors.unigData.FileList.list;

      if (keywordIds.length > 0) {
        // hide all files with this tag
        // const keywordList = Drupal.behaviors.unigData.FileList.findKeyword(keywordIds );


        if (fullList && fullList.length > 0) {
          for (const item of fullList) {
            $(`#unig-file-${item.nid}`).hide();
            $(`#unig-file-${item.nid}`).data('current', false);

            // all Keywords
            for (const keywords of item.keywords) {
              if (keywordIds.includes(parseInt(keywords.id))) {
                $(`#unig-file-${item.nid}`).show();
                $(`#unig-file-${item.nid}`).data('current', true);
                Drupal.behaviors.unigKeywords.Visible.push(item.nid);

              }
            }
          }
        }
      } else {
        // show all
        for (const item of fullList) {
          $(`#unig-file-${item.nid}`).show();
        }
      }

      let html = '';
      if (Drupal.behaviors.unigKeywords.Visible.length > 0) {
        html = `${Drupal.behaviors.unigKeywords.Visible.length} von ${number_of_all_items}`;
      }
      $('.number_of_visible').html(html);
      $('.unig-button-download-add-current-to-list').show();
    },
    /**
     *
     * @param context
     * @param settings
     */
    constructor(context) {

      // Close Toolbar
      $('.unig-toolbar-keywords-close-trigger', context).click(event => {
        Drupal.behaviors.unigKeywords.closeToolbar(event);
      });

      // Open Toolbar
      $('.unig-toolbar-keywords-open-trigger', context).click(event => {
        Drupal.behaviors.unigKeywords.closeToolbar(event);
      });

      // Toggle Toolbar
      $('.unig-toolbar-keywords-toggle-trigger', context).click(event => {
        Drupal.behaviors.unigKeywords.toggleToolbar(event);
      });

      // Autocomplate
    },
  };
})(jQuery, Drupal, drupalSettings);
