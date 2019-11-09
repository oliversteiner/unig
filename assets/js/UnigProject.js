(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProject = {
    showKeywordsOnFile: false,
    showPeoplesOnFile: false,
    Store: {},

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
      document.getElementsByClassName('unig-ajax-container').innerHtml = '';
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
      const $ButtonDownloadVisible = $(
        '.unig-button-download-add-current-to-list',
      );
      const $NumberOfVisible = $('.number-of-visible');
      const $IconOfVisible = $('.icon-of-visible');

      const number_of_all_items = Drupal.behaviors.unigData.FileList.count();
      let number_of_Visible_items = this.Store.count();

      let icon = 'fa-key';
      const isPeopleStoreLoaded = Drupal.behaviors.unigPeople.Store.hasOwnProperty(
        'get',
      );
      if (isPeopleStoreLoaded) {
        if (Drupal.behaviors.unigPeople.Store.count()) {
          icon = 'fa-user';
        }
      }

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
      this.Store.clear();
      // People
      let peopleIds = [];
      const isPeopleStoreLoaded = Drupal.behaviors.unigPeople.Store.hasOwnProperty(
        'get',
      );
      if (isPeopleStoreLoaded) {
        peopleIds = Drupal.behaviors.unigPeople.Store.get();
      }

      // Keywords
      let keywordIds = [];
      const isKeywordStoreLoaded = Drupal.behaviors.unigKeywords.Store.hasOwnProperty(
        'get',
      );
      if (isKeywordStoreLoaded) {
        keywordIds = Drupal.behaviors.unigKeywords.Store.get();
      }

      // favorites
      let favorites = false;
      const isFavoritesLoaded = Drupal.behaviors.unigFavorite.hasOwnProperty(
        'filter',
      );
      if (isFavoritesLoaded) {
         favorites = Drupal.behaviors.unigFavorite.filter;
      }


      let fullList = Drupal.behaviors.unigData.FileList.list;

      if(favorites){
        fullList = fullList.filter( item=>item.favorite === 1);
      }


      if (peopleIds.length > 0) {
        // hide all files with this tag

        if (fullList && fullList.length > 0) {
          for (const item of fullList) {
            const $elem = $(`#unig-file-${item.id}`);

            // all people
            for (const people of item.people) {
              if (peopleIds.includes(parseInt(people.id))) {
                // if also keywords
                // all Keywords
                if (keywordIds.length > 0) {
                  for (const keywords of item.keywords) {
                    if (keywordIds.includes(parseInt(keywords.id))) {
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
      } else if (keywordIds.length > 0) {
        if (fullList && fullList.length > 0) {
          for (const item of fullList) {
            for (const keywords of item.keywords) {
              if (keywordIds.includes(parseInt(keywords.id))) {
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

      this.updateNumbers();
    },

    attach(context) {
      const unigProject = Drupal.behaviors.unigProject;
      const unigFile = Drupal.behaviors.unigFiles;

      $('#unig-main', context)
        .once('unigProject')
        .each(() => {
          console.log('LoadTime:', drupalSettings.unig.project.time);

          this.Store = Object.assign(this.Store, Drupal.behaviors.unigStore);
          this.Store.init('project');
          this.restore();
          this.updateBrowser();

          $("*[id^='lightgallery-']").lightGallery({
            selector: '.lightgallery-item',
          });

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

            const $formElemProjectNid = $("input[name='projectId']");
            const projectId = $container.data('project-id');
            $formElemProjectNid.val(projectId);
          });

          // Generate Previews
          $('.unig-generate-preview-images-trigger', context).click(() => {
            Drupal.behaviors.unigLazyLoad.generatePreviewImages(context);
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
            scope.edit(event);
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
