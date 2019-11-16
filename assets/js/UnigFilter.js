(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigFilter = {
    version: '1.0.0',
    isToolbarOpen: false,

    getId(event) {
      const $elem = $(event.target).parents('.unig-filter-item');
      return $elem.data('id');
    },

    update() {
      console.log('Unig Filter Update');

      const $placeholder = $('.unig-filter-placeholder');
      $placeholder.removeClass('active warning');

      // get items from Store

      // People
      let people = [];
      if (Drupal.behaviors.unigPeople.Store.hasOwnProperty('get')) {
        people = Drupal.behaviors.unigPeople.Store.get();
      }

      // Keywords
      let keywords = [];
      if (Drupal.behaviors.unigKeywords.Store.hasOwnProperty('get')) {
        keywords = Drupal.behaviors.unigKeywords.Store.get();
      }

      // Visible
      let number_of_visible = 0;
      if (Drupal.behaviors.unigProject.Store.hasOwnProperty('count')) {
        number_of_visible = Drupal.behaviors.unigProject.Store.count();
      }

      let output = '';

      // Number of Visible Images
      if (number_of_visible === 0) {
        // bad combination of Keywords
        if (people.length > 0 || keywords.length > 0) {
          const message = Drupal.t('NO Images found with this combination: ');
          output += `<span class="unig-filter-text-people warning"> ${message}</span>`;
          $placeholder.addClass('warning');
        }
      } else {
        $placeholder.addClass('active');
        const message = Drupal.t('Images found');
        output = `<span class="unig-filter unig-filter-number-of-visible  unig-add-visible-to-download-list-trigger"> <span class="nov-icon"> 
<i class="fas fa-download" aria-hidden="true"></i> </span> <span class="number-of-visible">${number_of_visible}</span> </span>`;
        output += `<span class="unig-filter-text-people">${message} </span>`;
      }

      // Peoples
      if (people.length > 0) {
        // Text
        let message = '';
        if (people.length === 1) {
          message = Drupal.t('with person');
        } else {
          message = Drupal.t('with persons');
        }
        output += `<span class="unig-filter-text-people">${message}</span>`;

        let i = 1;

        people.forEach(id => {
          const name = Drupal.behaviors.unigStore.getNameByID(id);
          // Add Name Tag
          output += `<span class="unig-filter-item" data-id="${id}">${name}
            <span class="unig-filter-item-remove unig-filter-item-remove-trigger"> 
            <i class="fas fa-times"></i>
            </span>
            </span>`;
          i++;

          //  Operator
          if (i <= people.length) {
            output += Drupal.t(' or ');
          }
        });
      }

      // Keywords

      if (keywords.length > 0) {
        //  Operator
        if (people.length > 0) {
          output += Drupal.t(' and ');
        }

        // Text
        let message = '';
        if (keywords.length === 1) {
          message = Drupal.t('with Keyword');
        } else {
          message = Drupal.t('with Keywords');
        }
        output += `<span class="unig-filter-text-keywords">${message}</span>`;

        let y = 1;
        keywords.forEach(id => {
          const name = Drupal.behaviors.unigStore.getNameByID(id);

          // Add Name Tag
          output += ` <span class="unig-filter-item" data-id="${id}">${name}
            <span class="unig-filter-item-remove unig-filter-item-remove-trigger"> 
            <i class="fas fa-times"></i></span></span>`;

          y++;

          // Add Operator
          if (y <= people.length) {
            output += 'or ';
          }
        });
      }

      // Favorites
      if (Drupal.behaviors.unigFavorite.showOnlyFavorites) {
        $placeholder.addClass('active');
        const t_favorites = Drupal.t('Favorites');

        if (people.length === 0 && keywords.length === 0) {
          const t_show_only = Drupal.t('Show only');
          output += `<span class="unig-filter-text-favorites">${t_show_only} </span>`;
        } else {
          const t_only_of = Drupal.t('only of');
          output += `<span class="unig-filter-text-favorites">${t_only_of} </span>`;
        }

        output +=
          `<span class="unig-filter-item unig-filter-item-favorite-remove ">` +
          `<i class="fas fa-heart red"></i>` +
          `<span class="unig-filter-item-favorite-label">${t_favorites} </span>` +
          `<span class="unig-filter-item-remove unig-filter-item-favorite-remove-trigger">` +
          `<i class="fas fa-times"></i>` +
          `</span>` +
          `</span>`;
      }

      $placeholder.html(output);

      // Add Remove Tag Trigger
      $('.unig-filter-item-remove-trigger')
        .once('unigFilter')
        .click(event => {
          const id = this.getId(event);
          this.remove(id);
        });

      // Add Remove Tag Trigger
      $('.unig-filter-item-favorite-remove-trigger')
        .once('unigFilter')
        .click(event => {
          Drupal.behaviors.unigFavorite.toggleShowOnlyFavorites();
        });

      // add-visible-to-download-list
      $('.unig-add-visible-to-download-list-trigger')
        .once('unigFilter')
        .click(() => {
          Drupal.behaviors.unigDownload.openToolbar();
          this.addVisible();
        });
    },

    changeOperator() {},

    remove(id) {
      console.log('Remove Tag with ID', id);
      Drupal.behaviors.unigPeople.remove(id);
      Drupal.behaviors.unigKeywords.remove(id);

      // Update
      this.update();
    },

    addVisible() {
      console.log('Add images to download list');
      Drupal.behaviors.unigDownload.addVisible();
    },

    clearFilter() {
      if (Drupal.behaviors.unigPeople.Store.hasOwnProperty('clear')) {
        Drupal.behaviors.unigPeople.Store.clear();
      }

      if (Drupal.behaviors.unigKeywords.Store.hasOwnProperty('clear')) {
        Drupal.behaviors.unigKeywords.Store.clear();
      }
    },

    constructor(context, settings) {
      // Toolbar
      $('.unig-toolbar-filter-toggle-trigger', context).click(() => {
        this.isToolbarOpen = !this.isToolbarOpen;
        console.log('toggle filter', this.isToolbarOpen);
      });

      // clear-filter
      $('.unig-clear-filter-trigger', context).click(() => {
        this.clearFilter();
      });
    },

    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigFilter')
        .each(() => {
          this.constructor(context, settings);
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
