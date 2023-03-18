(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProject = {
    showKeywordsOnFile: false,
    showPeoplesOnFile: false,
    currentSize: 'medium',
    Store: {},
    updateCounter: 0,
    lightgallery: null,

    edit(event) {
      // Elem
      const elemTarget = event.target.parentNode;

      // Data
      const projectId = elemTarget.dataset.unigProjectId;
      const fileId = elemTarget.dataset.unigFileId;
      const field = elemTarget.dataset.unigField;
      const mode = elemTarget.dataset.unigMode;
      const form = elemTarget.dataset.unigForm;
      let id = false;

      if (projectId) {
        id = projectId;
      } else if (fileId) {
        id = fileId;
      } else {
        console.warn('No ID found in Element', elemTarget);
      }

      if (form === 'option_list') {
        Drupal.behaviors.unigAdmin.optionList(id, field, mode);
      } else {
        Drupal.behaviors.unigAdmin.edit(id, field, mode);
      }
    },

    save(data, route) {
      Drupal.behaviors.unigAdmin.quickSave(data, route);
    },

    clearAjaxMessageBox() {
      $('.unig-ajax-container').html('');
    },

    editFileTitle(id) {
      Drupal.behaviors.unigAdmin.edit(id, 'title', 'file');
    },

    editFileDescription(id) {
      Drupal.behaviors.unigAdmin.edit(id, 'description', 'file');
    },

    /**
     *
     * @param id
     */
    togglePrivate(id) {
      Drupal.behaviors.unigAdmin.togglePrivate(id);
    },

    restore() {
      console.log('Restore Project List');

      const visible = this.Store.get();
      visible.forEach(id => () => {
        $(`#unig-file-${id}`).hide();
      });
    },


    updateNumbers() {
      // DOM Elements
      const $ButtonDownloadVisible = $(
        '.unig-button-download-add-current-to-list',
      );
      const $NumberOfVisible = $('.number-of-visible');
      const $IconOfVisible = $('.icon-of-visible');

      // Number of All Items
      let number_of_all_items = 0;
      if (Drupal.behaviors.unigData.hasOwnProperty('count')) {
        number_of_all_items = Drupal.behaviors.unigData.count();
      }

      // Icon
      let icon = 'fa-key';
      if (Drupal.behaviors.unigPeople.Store.hasOwnProperty('get')) {
        if (Drupal.behaviors.unigPeople.Store.count()) {
          icon = 'fa-user';
        }
      }

      // Number of Visible Items
      let number_of_Visible_items = this.Store.count();
      if (number_of_Visible_items > 0) {
        $ButtonDownloadVisible.show();
        $NumberOfVisible.html(number_of_Visible_items);
        $IconOfVisible.html(`<i class="fas ${icon}" aria-hidden="true"></i>`);
      } else {
        $ButtonDownloadVisible.hide();
        $NumberOfVisible.html(number_of_all_items);
      }
    },

    updateBrowser() {
      this.updateCounter++;
      console.log('updateBrowser', this.updateCounter);
      let fullList = Drupal.behaviors.unigData.get();

      // People
      let peopleList = [];
      const isPeopleStoreLoaded = Drupal.behaviors.unigPeople.Store.hasOwnProperty(
        'get',
      );
      if (isPeopleStoreLoaded) {
        peopleList = Drupal.behaviors.unigPeople.Store.get();
      }

      // Keywords
      let keywordList = [];
      const isKeywordStoreLoaded = Drupal.behaviors.unigKeywords.Store.hasOwnProperty(
        'get',
      );
      if (isKeywordStoreLoaded) {
        keywordList = Drupal.behaviors.unigKeywords.Store.get();
      }

      // favorites
      let favorites = false;
      const isFavoritesLoaded = Drupal.behaviors.hasOwnProperty('unigFavorite');
      if (isFavoritesLoaded) {
        favorites = Drupal.behaviors.unigFavorite.filter;
      }

      if (favorites) {
        fullList = fullList.filter(item => item.favorite === 1);
      }

      this.Store.clear();

      if (peopleList.length > 0) {
        // hide all files with this tag

        if (fullList && fullList.length > 0) {
          for (const item of fullList) {
            const $elem = $(`#unig-file-${item.id}`);

            // all people
            for (const people of item.people) {
              if (peopleList.includes(parseInt(people.id))) {
                // if also keywords
                // all Keywords
                if (keywordList.length > 0) {
                  for (const keywords of item.keywords) {
                    if (keywordList.includes(parseInt(keywords.id))) {
                      this.Store.add(item.id);
                    }
                  }
                } else {
                  $elem.data('current', true);
                  this.Store.add(item.id);
                }
              }
            }
          }
        }
      } else if (keywordList.length > 0) {
        if (fullList && fullList.length > 0) {
          for (const item of fullList) {
            for (const keywords of item.keywords) {
              if (keywordList.includes(parseInt(keywords.id))) {
                this.Store.add(item.id);
              }
            }
          }
        }
      } else {
        // show all
      }

      if (this.Store.count() > 0) {
        const idsOfItemsVisible = this.Store.get();
        for (const item of fullList) {
          if (idsOfItemsVisible.includes(item.id)) {
            $(`#unig-file-${item.id}`).show();
          } else {
            $(`#unig-file-${item.id}`).hide();
          }
        }
      } else {
        // Show All
        for (const item of fullList) {
          $(`#unig-file-${item.id}`).show();
        }
      }

      // Hide all if bad Combination of Keywords
      if (
        this.Store.count() === 0 &&
        (peopleList.length > 0 || keywordList.length > 0)
      ) {
        console.warn('bad Combination of Keywords');
        // Hide All
        for (const item of fullList) {
          $(`#unig-file-${item.id}`).hide();
        }
      }

      this.updateNumbers();

      if (Drupal.behaviors.hasOwnProperty('unigFilter')) {
        Drupal.behaviors.unigFilter.update();
      }

      if (Drupal.behaviors.hasOwnProperty('unigPeople')) {
        Drupal.behaviors.unigPeople.update();
      }

      if (Drupal.behaviors.hasOwnProperty('unigKeywords')) {
        Drupal.behaviors.unigKeywords.update();
      }

      if (Drupal.behaviors.hasOwnProperty('unigLightGallery')) {
        Drupal.behaviors.unigLightGallery.update();
      }

      // TODO Hack for Operette.ch

      $('.unig-people-tag-id-151').remove(); // Operette Möriken Wildegg
      $('.unig-people-tag-id-152').remove(); // Die Lustige Witwe
      $('.unig-people-tag-id-154').remove(); // Namen
    },

    attach(context) {
      const unigProject = Drupal.behaviors.unigProject;
      const unigFile = Drupal.behaviors.unigFiles;

      $('#unig-main', context)
        .once('unigProject')
        .each(() => {
          console.log('LoadTime:', drupalSettings.unig.project.time);
          const projectID = drupalSettings.unig.project.project.id;
          console.log('projectID:', projectID);

          this.Store = Object.assign(this.Store, Drupal.behaviors.unigStore);
          this.Store.init('project');
          this.restore();

          this.updateBrowser();

          // Toggle all Keywords
          $('.unig-show-keywords-on-files-trigger', context).click(() => {
            unigFile.toggleAllToolbox('keywords');
          });

          // Toggle all People
          $('.unig-show-people-on-files-trigger', context).click(() => {
            unigFile.toggleAllToolbox('people');
          });

          // Close Message Generate Images
          $('.unig-messages-generate-images-close-trigger', context).click(
            () => {
              $('.unig-messages-generate-images').hide();
            },
          );

          // New Album Form
          $('.ajax-container-new-album-trigger', context).click(() => {
            const $container = $('#ajax-container-new-album-container');
            $container.toggle();

            const $formElemProjectNid = $('input[name=\'projectId\']');
            const projectId = $container.data('project-id');
            $formElemProjectNid.val(projectId);
          });

          const projectId = drupalSettings.unig.project.project.id;

          //  Delete Project Trigger
          document
            .querySelectorAll('.unig-project-delete-trigger', context)
            .forEach(elem =>
              elem.addEventListener(
                'click',
                event => {
                  Drupal.behaviors.unigProjectList.toggleConfirmDeleteProject(
                    projectId,
                  );
                },
                false,
              ),
            );

          //  Cancel Delete Project Trigger
          document
            .querySelectorAll('.unig-project-delete-cancel-trigger', context)
            .forEach(elem =>
              elem.addEventListener(
                'click',
                () => {
                  Drupal.behaviors.unigProjectList.toggleConfirmDeleteProject(
                    projectId,
                  );
                },
                false,
              ),
            );

          // Edit Trigger
          $('.unig-edit-trigger', context).click(event => {
            this.edit(event);
          });

          //  Private Project Trigger
          document
            .querySelectorAll('.unig-project-private-trigger', context)
            .forEach(elem =>
              elem.addEventListener(
                'click',
                event => {
                  const id = drupalSettings.unig.project.project.id;
                  unigProject.togglePrivate(id);
                },
                false,
              ),
            );
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
