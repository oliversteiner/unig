(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigKeywords = {
    keywordList: [],
    Store: {},
    Visible: [],
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
      this.Store.add(id);
    },

    remove(id) {
      this.Store.remove(id);
    },

    toggle(id) {
      this.Store.toggle(id);
    },
    /**
     *
     * @param id
     */


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
      this.Store.clear();
    },
    /**
     *
     *
     */
    addAll() {
      const items = this.keywordList;

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
      const items = this.keywordList;

      for (let i = 0; i < items.length; i++) {
        this.markAsActive(items[i].id);
      }
    },
    /**
     *
     *
     */
    updateDisplay() {
      this.keywordList = Drupal.behaviors.unigData.projectKeywords.list;
      // target
      const $targetNumberOf = $('.unig-keywords-display');

      // get Number


      const numberAllItems = this.keywordList.length;
      const numberChosenItems = this.Store.count();

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
      let elemLi = '';
      if (keywordsList) {
        keywordsList.forEach(item => {
          // check
          const additionalClass = '';
          const label = item.name;

          elemLi +=
            `<li class="unig-tag unig-tag-keyword ${additionalClass}" 
                id="unig-tag-id-${item.id}" 
                data-id = "${item.id}"
                onclick="Drupal.behaviors.unigKeywords.toggleTag(${item.id})"
                >` +
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
        Drupal.behaviors.unigDownload.updateFiles();
      });

      $('.unig-keywords-unmark-all-tags-trigger').click(() => {
        scope.removeAll();
        scope.markAllAsInactive();
        scope.updateDisplay();
        Drupal.behaviors.unigDownload.updateFiles();
      });

      // Update GUI

      $('.build-done').ready(() => {
        scope.reMark();
        scope.updateDisplay();
      });
    },

    toggleTag(id){
      this.toggle(id);
      this.toggleMark(id);
      this.updateDisplay();
      Drupal.behaviors.unigDownload.updateFiles();
    },

    /**
     *
     *
     *
     */
    reMark() {
      // Get Download Item List
      const keywordsStorage = this.Store.get();

      if (keywordsStorage) {
        keywordsStorage.forEach(elem => {
          Drupal.behaviors.unigKeywords.markAsActive(elem);
        });
      }
    },

    clearDownloadList() {
      this.Store.clear();
      this.markAllAsInactive();
      this.buildTags();
      this.updateDisplay();
      Drupal.behaviors.unigDownload.updateFiles();
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
          const choices = Drupal.behaviors.unigData.projectKeywords.get();
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
          Drupal.behaviors.unigDownload.updateFiles();
        },
      });
    },

    /**
     *
     * @param context
     * @param settings
     */
    constructor(context) {
      this.keywordList = Drupal.behaviors.unigData.projectKeywords.list;

      this.Store = Object.assign(this.Store, Drupal.behaviors.unigStore);
      this.Store.init('keywords');

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
    },
  };

})(jQuery, Drupal, drupalSettings);
