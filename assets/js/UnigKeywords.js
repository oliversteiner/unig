(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigKeywords = {
    list: [],
    Store: {},
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
        });
    },


    getKeywordIDsInProject() {

      let keywordIDsInProject = [];
      const files = drupalSettings.unig.project.files;

      files.forEach(item => {
        const keywords = item.keywords;
        keywords.forEach(keyword => {
          const id = parseInt(keyword.id);
          if (!keywordIDsInProject.includes(id)) {
            keywordIDsInProject.push(id);
          }
        });
      });

      return keywordIDsInProject;
    },


    load() {
      const allItems = drupalSettings.unig.project.keywords;
      const itemsInProject = this.getKeywordIDsInProject();

      let list = [];
      if (itemsInProject) {
        allItems.forEach(item => {
          if (itemsInProject.includes(item.id)) {
            list.push(item);
          }
        });
      } else {
        list = allItems;
      }

      this.list = list;
    },

    clear() {
      this.list = [];
    },

    get() {
      return this.list;
    },

    count() {
      return this.list.length;
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
      this.markAsActive(id);
      Drupal.behaviors.unigProject.updateBrowser();
    },

    remove(id) {
      this.Store.remove(id);
      this.markAsInactive(id);

      Drupal.behaviors.unigProject.updateBrowser();

    },

    toggle(id) {
      this.Store.toggle(id);
      Drupal.behaviors.unigProject.updateBrowser();
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
      Drupal.behaviors.unigProject.updateBrowser();
    },
    /**
     *
     *
     */
    addAll() {
      const items = this.list;
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
      const items = this.list;
      for (let i = 0; i < items.length; i++) {
        this.markAsActive(items[i].id);
      }
    },
    /**
     *
     *
     */
    update() {
      // target
      const $targetNumberOf = $('.unig-keywords-display');

      const numberAllItems = this.list.length;
      let numberChosenItems = 0;
      if(this.Store.hasOwnProperty('count')){
        numberChosenItems = this.Store.count();
      }

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

    buildTags() {
      let elemLi = '';
      if (this.list) {
        this.list.forEach(item => {
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

      // Build DOM
      const html =  prefix + elemLi + suffix;

      // Add to dom
      this.$tags_container.html(html);


      $('.unig-keywords-mark-all-tags-trigger').click(() => {
        this.markAllAsActive();
        this.addAll();
      });

      $('.unig-keywords-unmark-all-tags-trigger').click(() => {
        this.markAllAsInactive();
        this.removeAll();
      });

      // Update GUI

      $('.build-done').ready(() => {
        this.reMark();
      });
    },

    toggleTag(id){
      this.toggleMark(id);
      this.toggle(id);
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
      this.update();
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
          Scope.update();
        },
      });
    },

    /**
     *
     * @param context
     * @param settings
     */
    constructor(context) {
      this.load();

      this.Store = Object.assign(this.Store, Drupal.behaviors.unigStore);
      this.Store.init('keywords');
      this.buildTags();

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
