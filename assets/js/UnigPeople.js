(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigPeople = {
    peopleList: [],
    Store: {},
    isToolbarOpen: false,
    $tags_container: $('.unig-toolbar-people-tags-container', this.context),
    $check_all_people_trigger: $('unig-button-people-check-all', this.context),
    $uncheck_all_people_trigger: $(
      'unig-button-people-uncheck-all',
      this.context,
    ),

    Visible: [],
    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigPeople')
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
      $('.unig-toolbar-people').slideDown();
      $('.unig-toolbar-people').addClass('open');
      $('.unig-toolbar-people-toggle-trigger').addClass('active');
      this.isToolbarOpen = true;
    },

    closeToolbar() {
      $('.unig-toolbar-people').slideUp();
      $('.unig-toolbar-people').removeClass('open');
      $('.unig-toolbar-people-toggle-trigger').removeClass('active');
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
    markAsActive(id) {
      const $targetToolbar = $(`#unig-tag-id-${id}`);
      $targetToolbar.addClass('active');

      const $targetToolbox = $(`.unig-people-id-${id}`);
      $targetToolbox.addClass('active');
    },
    /**
     *
     * @param id
     */
    markAsInactive(id) {
      const $target = $(`#unig-tag-id-${id}`);
      $target.removeClass('active');

      const $targetToolbox = $(`.unig-people-id-${id}`);
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
      const items = this.peopleList;

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
      const items = this.peopleList;

      for (let i = 0; i < items.length; i++) {
        this.markAsActive(items[i].id);
      }
    },
    /**
     *
     *
     */
    updateDisplay() {
      this.peopleList = Drupal.behaviors.unigData.projectPeople.list;

      // target
      const $targetNumberOf = $('.unig-people-display');

      // get Number
      const numberAllItems = this.peopleList.length;
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

    buildTags(peopleList) {
      let elemLi = '';
      if (peopleList) {
        peopleList.forEach(item => {
          // check
          const additionalClass = '';
          const label = item.name;

          elemLi +=
            `<li class="unig-tag unig-tag-people  ${additionalClass}" 
                id="unig-tag-id-${item.id}" 
                data-id = "${item.id}"
                onclick="Drupal.behaviors.unigPeople.toggleTag(${item.id})"
                >` +
            `<span class="unig-people-tag-id">${item.id}</span>` +
            `<span class="unig-people-tag-label">${label}</span>` +
            `</li>`;
        });
      }

      const prefix = '<ul class="unig-tags unig-tags-people">';
      const suffix = '</ul><span class="build-done"></span>';



      // Build DOM
      const html =  prefix + elemLi + suffix;

      // Add to dom
      this.$tags_container.html(html);

      const scope = Drupal.behaviors.unigPeople;

      $('.unig-people-mark-all-tags-trigger').click(() => {
        scope.addAll();
        scope.markAllAsActive();
        scope.updateDisplay();
        Drupal.behaviors.unigDownload.updateFiles();
      });

      $('.unig-people-unmark-all-tags-trigger').click(() => {
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
      const peopleStorage = this.Store.get();

      if (peopleStorage) {
        peopleStorage.forEach(elem => {
          Drupal.behaviors.unigPeople.markAsActive(elem);
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
      const Scope = Drupal.behaviors.unigPeople;
      const UnigAutoComplete = new autoComplete({
        selector: '*[name="unig-people-autocomplete"]',
        minChars: 2,
        source(term, suggest) {
          term = term.toLowerCase();
          const choices = Drupal.behaviors.unigData.allpeople.get();
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
      this.peopleList = Drupal.behaviors.unigData.projectPeople.list;

      this.Store = Object.assign(this.Store, Drupal.behaviors.unigStore);
      this.Store.init('people');

      // Close Toolbar
      $('.unig-toolbar-people-close-trigger', context).click(event => {
        Drupal.behaviors.unigPeople.closeToolbar(event);
      });

      // Open Toolbar
      $('.unig-toolbar-people-open-trigger', context).click(event => {
        Drupal.behaviors.unigPeople.closeToolbar(event);
      });

      // Toggle Toolbar
      $('.unig-toolbar-people-toggle-trigger', context).click(event => {
        Drupal.behaviors.unigPeople.toggleToolbar(event);
      });

      // Autocomplate
    },
  };
})(jQuery, Drupal, drupalSettings);
