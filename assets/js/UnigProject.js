(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProject = {
    showKeywordsOnFile:false,
    showPeoplesOnFile:false,


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

    attach(context) {
      const unigProject = Drupal.behaviors.unigProject;
      const unigFile = Drupal.behaviors.unigFiles;

      $('#unig-main', context)
        .once('unigProject')
        .each(() => {
          console.log('LoadTime:', drupalSettings.unig.project.time);

          $('*[id^=\'lightgallery-\']').lightGallery({
            selector: '.lightgallery-item',
          });

          // Toggle all Keywords
          $('.unig-button-keywords-toggle-all', context).click(() => {
              unigFile.toggleAllToolbox('keywords');
          });

          // Toggle all People
          $('.unig-button-people-toggle-all', context).click(() => {
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
