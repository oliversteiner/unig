(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProject = {
    extractKeywords() {
      const projectNid = this.getProjectNid();


      const url = `/unig/process/extract-keyword/${projectNid}/`;

      fetch(url)
        .then(response => response.json())
        .then(json => {
          // Set message to ajax container
          const text = json.messages[0][0];
          const type = json.messages[0][1];
          Drupal.behaviors.unigMessages.addMessage(text, type);

        });

    },

    toggleToolbox(nid, name) {
      // toggle Div
      const $target = $(`#unig-file-${nid} .unig-file-${name}-toolbox`);
      $target.slideToggle('fast');

      // toggle Button
      const $button = $(`#unig-file-${nid} .unig-file-${name}-toolbox-trigger`);
      $button.toggleClass('active');
    },

    toggleAllToolbox(name, modus) {
      // toggle Div
      const $target = $(`.unig-file-${name}-toolbox`);
      // toggle Button
      const $button = $(`.unig-file-${name}-toolbox-trigger`);
      const $buttonAll = $(`.unig-button-${name}-toggle-all`);

      switch (modus) {
        case 'hide':
          $button.removeClass('active');
          $buttonAll.removeClass('active');
          $target.slideUp('fast');
          break;
        case 'show':
          $button.addClass('active');
          $buttonAll.addClass('active');
          $target.slideDown('fast');

          break;

        default:
          $button.toggleClass('active');
          $target.slideToggle('fast');
          break;
      }
    },

    toggleEditButtons() {
      $('.unig-file-download-mark').toggle();
      $('.unig-file-rating').toggle();
      $('.unig-file-head-info').toggle();
      $('.unig-file-middle').toggle();

      $('.unig-button-files-edit').toggle();
      $('.unig-button-files-preview').toggle();
      $('.unig-button-sort-toggle').toggle();
      $('.unig-fieldset-keywords').toggle();
      $('.unig-button-files-add').toggle();
    },

    getNodeId(event) {
      const $elem = $(event.target).parents('.unig-file-item');
      const nid = $elem.data('unig-file-nid');
      return nid;
    },

    edit(event) {
      // Elem
      const elemTarget = event.target.parentNode;

      // Data
      const nid = elemTarget.dataset.unigNid;
      const field = elemTarget.dataset.unigField;
      const mode = elemTarget.dataset.unigMode;
      const form = elemTarget.dataset.unigForm;

      if (form === 'option_list') {
        Drupal.behaviors.unigAdmin.optionList(nid, field, mode);
      } else {
        //  Drupal.behaviors.unigAdmin.edit(nid, field, mode);
      }
    },

    getProjectNid() {
      return drupalSettings.unig.project.project.nid;
    },

    save(data, route) {
      $.ajax({
        url: Drupal.url(`unig/${route}`),
        type: 'POST',
        data: {
          data,
        },
        dataType: 'json',
        success(results) {
          if (results.messages && results.messages[0]) {
            const text = results.messages[0][0];
            const type = results.messages[0][1];
            Drupal.behaviors.unigMessages.addMessage(text, type);
          }
        },
      });

      return true;
    },

    setRating(nid, direction) {
      const $badge = $(`#unig-file-${nid} .unig-file-rating-badge`);
      const $input = $(`#unig-file-${nid} .unig-file-rating-input`);

      const number = parseInt($input.val(), 10);

      let numberNew = 0;
      if (direction === 'up') {
        numberNew = number + 1;
      } else {
        numberNew = number - 1;
      }
      $input.val(numberNew);
      $badge.html(numberNew);
      if (numberNew !== 0) {
        $badge.addClass('active');
      } else {
        $badge.removeClass('active');
      }
      if (numberNew > 0) {
        $badge.removeClass('negativ');
        $badge.addClass('positiv');
      }
      if (numberNew < 0) {
        $badge.addClass('negativ');
        $badge.removeClass('positiv');
      }
      if (numberNew === 0) {
        $badge.removeClass('negativ');
        $badge.removeClass('positiv');
      }

      const data = {
        nid,
        value: numberNew,
      };

      const route = 'rating/save';

      this.save(data, route);
    },

    setProjectCover(projectNid, imageNid) {
      // get DOM Elems
      const processElem = document.querySelector(
        `.unig-image-is-cover-container-${imageNid} .unig-set-project-cover-process`,
      );

      const isCoverElem = document.querySelector(
        `.unig-image-is-cover-container-${imageNid} .unig-image-is-cover`,
      );

      const buttonElem = document.querySelector(
        `.unig-image-is-cover-container-${imageNid} .unig-set-project-cover-button`,
      );

      // activate Process Spinner
      processElem.classList.add('active');

      const url = `/unig/set_cover/${projectNid}/${imageNid}`;

      fetch(url)
        .then(response => response.json())
        .then(json => {
          // Set message to ajax container
          const text = json.messages[0][0];
          const type = json.messages[0][1];
          Drupal.behaviors.unigMessages.addMessage(text, type);

          // deactivate all active covers
          const allActiveCoverElems = document.querySelectorAll(
            '.unig-image-is-cover.active',
          );

          // activate all buttons
          const allbuttonElems = document.querySelectorAll(
            '.unig-set-project-cover-button',
          );

          allActiveCoverElems.forEach(elem => {
            elem.classList.remove('active');
          });

          allbuttonElems.forEach(elem => {
            elem.classList.add('active');
          });

          isCoverElem.classList.add('active');
          processElem.classList.remove('active');

          // deactivate this Button
          buttonElem.classList.remove('active');
        });
    },

    clearAjaxMessageBox() {
      document.getElementsByClassName('unig-ajax-container').innerHtml = '';
    },

    editFileTitle(nid) {
      Drupal.behaviors.unigAdmin.edit(nid, 'title', 'file');
    },

    editFileDescription(nid) {
      Drupal.behaviors.unigAdmin.edit(nid, 'description', 'file');
    },


    /**
     *
     * @param nid
     */
    togglePrivat(nid) {
      Drupal.behaviors.unigAdmin.togglePrivat(nid);
    },

    attach(context, settings) {
      // onload

      const scope = this;

      $('#unig-main', context)
        .once('unigProject')
        .each(() => {
          $('*[id^=\'lightgallery-\']').lightGallery({
            selector: '.lightgallery-item',
          });


          // Toggle Options
          $('.unig-project-options-trigger', context).click(() => {
            $('.unig-dropdown-project-options').toggle();
          });

          // Close Options
          $('.unig-project-options-close-trigger', context).click(() => {
            $('.unig-dropdown-project-options').hide();
          });

          // Toggle all Keywords
          $('.unig-button-keywords-toggle-all', context).click(() => {
            const $trigger = $(scope);
            if ($trigger.hasClass('active')) {
              scope.toggleAllToolbox('keywords', 'hide');
            } else {
              scope.toggleAllToolbox('keywords', 'show');
            }
          });


          // Toggle all People
          $('.unig-button-people-toggle-all', context).click(() => {
            const $trigger = $(scope);
            if ($trigger.hasClass('active')) {
              scope.toggleAllToolbox('people', 'hide');
            } else {
              scope.toggleAllToolbox('people', 'show');
            }
          });

          // Event Handlers
          $('.unig-gallery-preview-wrapper img', context).hover(() => {
            $(scope)
              .parents('.unig-file-edit')
              .toggleClass('active');
          });

          // Rating Down
          $('.unig-file-rating-down-trigger', context).click(event => {
            const nid = scope.getNodeId(event);
            scope.setRating(nid, 'down');
          });

          // Rating Up
          $('.unig-file-rating-up-trigger', context).click(event => {
            const nid = scope.getNodeId(event);

            scope.setRating(nid, 'up');
          });

          // Toggle Keywords Toolbox
          $('.unig-file-keywords-toolbox-trigger', context).click(event => {
            const name = 'keywords';
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
          });

          // Toggle People Toolbox
          $('.unig-file-people-toolbox-trigger', context).click(event => {
            const name = 'people';
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
          });

          // Toggle Download Toolbox
          $('.unig-file-download-toolbox-trigger', context).click(event => {
            const name = 'download';
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
          });

          // Toggle Options Toolbox
          $('.unig-file-options-toolbox-trigger', context).click(event => {
            const name = 'options';
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
          });

          // Set Coverimage to current project
          $('.unig-set-project-cover-trigger', context).click(event => {
            // clear ajax message box
            scope.clearAjaxMessageBox();
            const imageNid = scope.getNodeId(event);
            const projectNid = Drupal.behaviors.unigData.project.nid;
            scope.setProjectCover(projectNid, imageNid);
            // the actual function go via drupal <a href ... >  and "use-ajax"
          });

          // Toggle Meta Info Toolbox
          $('.unig-file-metainfo-toolbox-trigger', context).click(event => {
            const name = 'metainfo';
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
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

            const $formElemProjectNid = $('input[name=\'projectNid\']');
            const projectNid = $container.data('projectnid');
            $formElemProjectNid.val(projectNid);
          });

          // Generate Previews
          $('.unig-generate-preview-images-trigger', context).click(() => {
            Drupal.behaviors.unigLazyLoad.generatePreviewImages(context);
          });

          // Extract Keywords
          $('.unig-extract-keywords-trigger', context).click(() => {
            scope.extractKeywords();
            $('.unig-dropdown-project-options').hide();
          });

          const projectNid = scope.getProjectNid();

          //  Delete Project Trigger
          document
            .querySelectorAll('.unig-project-delete-trigger', context)
            .forEach(elem =>
              elem.addEventListener(
                'click',
                event => {
                  Drupal.behaviors.unigProjectList.toggleConfirmDeleteProject(
                    projectNid,
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
                    projectNid,
                  );
                },
                false,
              ),
            );

          // Edit Trigger
          document
            .querySelectorAll('.unig-edit-trigger', context)
            .forEach(elem =>
              elem.addEventListener(
                'click',
                event => {
                  scope.edit(event);
                },
                false,
              ),
            );

          //  Private Project Trigger
          document
            .querySelectorAll('.unig-project-private-trigger', context)
            .forEach(elem =>
              elem.addEventListener(
                'click',
                event => {
                  const nid = scope.getProjectNid(event);
                  scope.togglePrivat(nid);
                },
                false,
              ),
            );
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
