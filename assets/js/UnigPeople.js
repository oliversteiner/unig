(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigPeople = {
    list: [],
    Store: {},
    isToolbarOpen: false,
    $tags_container: $('.unig-toolbar-people-tags-container', this.context),
    $check_all_people_trigger: $('unig-button-people-check-all', this.context),
    $uncheck_all_people_trigger: $(
      'unig-button-people-uncheck-all',
      this.context,
    ),

    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigPeople')
        .each(() => {
          this.constructor(context, settings);
        });
    },

    getPeopleIDsInProject() {
      let peopleIDsInProject = [];
      const files = drupalSettings.unig.project.files;

      files.forEach(item => {
        const people = item.people;
        people.forEach(people => {
          const id = parseInt(people.id);
          if (!peopleIDsInProject.includes(id)) {
            peopleIDsInProject.push(id);
          }
        });
      });

      return peopleIDsInProject;
    },

    /**
     *
     */
    load() {

      // get Names to IDs
      let list = [];
      const allItems = drupalSettings.unig.project.people;
      const itemsInProject = this.getPeopleIDsInProject();

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

    /**
     * returns array or false
     *
     * @return {boolean}
     */
    get() {
      if (this.list && this.list.length > 0) {
        return this.list;
      }
      return false;
    },

    /**
     *
     * @return {number}
     */
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
    markAsActive(id) {
      const $targetToolbar = $(`#unig-tag-people-id-${id}`);
      $targetToolbar.addClass('active');

      const $targetToolbox = $(`.unig-people-id-${id}`);
      $targetToolbox.addClass('active');
    },
    /**
     *
     * @param id
     */
    markAsInactive(id) {
      const $target = $(`#unig-tag-people-id-${id}`);
      $target.removeClass('active');

      const $targetToolbox = $(`.unig-people-id-${id}`);
      $targetToolbox.removeClass('active');
    },

    toggleMark(id) {
      const $target = $(`#unig-tag-people-id-${id}`);

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
      $('*[id^=unig-tag-people-id-]').removeClass('active');
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
      const $targetNumberOf = $('.unig-people-display');

      // get Number
      const numberAllItems = this.list.length;
      let numberChosenItems = 0;
      if (this.Store.hasOwnProperty('count')) {
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
      const peopleList = this.list;
      let elemLi = '';
      if (peopleList) {
        peopleList.forEach(item => {
          // check
          const additionalClass = '';
          const label = item.name;

          elemLi +=
            `<li class="unig-tag unig-tag-people  ${additionalClass}" 
                id="unig-tag-people-id-${item.id}" 
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
      const html = prefix + elemLi + suffix;

      // Add to dom
      this.$tags_container.html(html);

      const scope = Drupal.behaviors.unigPeople;

      $('.unig-people-mark-all-tags-trigger').click(() => {
        scope.markAllAsActive();
        scope.addAll();
      });

      $('.unig-people-unmark-all-tags-trigger').click(() => {
        scope.markAllAsInactive();
        scope.removeAll();
      });

      // Update GUI

      $('.build-done').ready(() => {
        scope.reMark();
      });
    },

    toggleTag(id) {
      this.toggle(id);
      this.toggleMark(id);
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
      this.update();
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
          Scope.update();
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

      this.Store = Object.assign(this.Store, Drupal.behaviors.unigStore);
      this.Store.init('people');
      this.load();
      this.buildTags();

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
