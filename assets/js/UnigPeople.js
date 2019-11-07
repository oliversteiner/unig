(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigPeople = {
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

    isToolbarOpen: false,

    $tags_container: $('.unig-toolbar-people-tags-container', this.context),

    $check_all_people_trigger: $(
      'unig-button-people-check-all',
      this.context,
    ),
    $uncheck_all_people_trigger: $(
      'unig-button-people-uncheck-all',
      this.context,
    ),

    Storage: Drupal.behaviors.unigData.peopleStorage,
    List: Drupal.behaviors.unigData.peopleList,
    Visible: [],

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
      const peopleStorage = this.Storage.get();

      // if first Item in list toggle on
      if (peopleStorage === false) {
        this.add(id);
      } else {
        // search item in peopleStorage List
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
      const $targetNumberOf = $('.unig-people-display');

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

    buildTags(peopleList) {


      let elemLi = '';
      if (peopleList) {
        peopleList.forEach(item => {
          // check
          const additionalClass = '';
          const label = item.name;

          elemLi +=
            `<li class="unig-tag unig-tag-people unig-people-trigger ${additionalClass}" 
                id="unig-tag-id-${item.id}" 
                data-id = "${item.id}">` +
            `<span class="unig-people-tag-id">${item.id}</span>` +
            `<span class="unig-people-tag-label">${label}</span>` +
            `</li>`;
        });
      }

      const prefix = '<ul class="unig-tags unig-tags-people">';
      const suffix = '</ul><span class="build-done"></span>';

      const buttonMarkAll =
        '<div class="unig-tag unig-mark-all-tags unig-button-people-mark-all-tags unig-people-mark-all-tags-trigger">' +
        '<i class="fas fa-circle" aria-hidden="true"></i>' +
        '<span class="unig-tags-title">check all</span>' +
        '</div>';

      const buttonUnMarkAll =
        '<div class="unig-tag unig-unmark-all-tags unig-button-people-unmark-all-tags unig-people-unmark-all-tags-trigger">' +
        '<i class="far fa-circle" aria-hidden="true"></i>' +
        '<span class="unig-tags-title">uncheck all</span>' +
        '</div>';

      // Build DOM
      const html = buttonMarkAll + buttonUnMarkAll + prefix + elemLi + suffix;

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
        // Add Handler
        $('.unig-people-trigger').click(function() {
          const id = $(this).data('id');

          scope.toggle(id);
          scope.toggleMark(id);
          scope.updateDisplay();
          Drupal.behaviors.unigDownload.updateFiles();
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
      const peopleStorage = this.Storage.get();

      if (peopleStorage) {
        peopleStorage.forEach(elem => {
          Drupal.behaviors.unigPeople.markAsActive(elem);
        });
      }
    },

    clearDownloadList() {
      this.Storage.destroy();
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
