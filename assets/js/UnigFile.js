(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigFiles = {

    deleteFile(fileId, projectId) {

      // Loading Message
      let text = 'Delete File with ' + fileId + '...';
      let type = 'load';
      const messageID = 'delete-file-' + fileId;
      Drupal.behaviors.unigMessages.addMessage(text, type, messageID);

      // send DELETE to server
      const url = `/unig/api/file/${fileId}/${projectId}`;
      fetch(url, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
      })
        .then(response => response.json())
        .then(data => {
          console.log('Response:', data);
          // Set message to ajax container
          const text = data.message;
          let type = 'info';
          if(data.status){
           type = 'success';

           // Remove Item from HTML
           $('#unig-file-'+fileId).remove();
            Drupal.behaviors.unigData.FileList.remove(fileId);
           // Remove Item from LIST

          }

          // Update Message
          Drupal.behaviors.unigMessages.removeMessageByID(messageID);
          Drupal.behaviors.unigMessages.addMessage(text, type);
        });
    },

    save(data, route) {
      Drupal.behaviors.unigAdmin.quickSave(data, route);
    },

    getFileId(event) {
      return Drupal.behaviors.unig.getFileId(event);
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

    setRating(id, direction) {
      const $badge = $(`#unig-file-${id} .unig-file-rating-badge`);
      const $input = $(`#unig-file-${id} .unig-file-rating-input`);

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
        id,
        value: numberNew,
      };

      const route = 'rating/save';

      this.save(data, route);
    },

    setProjectCover(projectId, imageId) {
      // get DOM Elems
      const processElem = document.querySelector(
        `.unig-image-is-cover-container-${imageId} .unig-set-project-cover-process`,
      );

      const isCoverElem = document.querySelector(
        `.unig-image-is-cover-container-${imageId} .unig-image-is-cover`,
      );

      const buttonElem = document.querySelector(
        `.unig-image-is-cover-container-${imageId} .unig-set-project-cover-button`,
      );

      // activate Process Spinner
      processElem.classList.add('active');

      const url = `/unig/set_cover/${projectId}/${imageId}`;

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

    attach(context, settings) {
      const scope = this;

      $('#unig-main', context)
        .once('unigFiles')
        .each(() => {
          console.log('Unig File');

          // Rating Down
          $('.unig-file-rating-down-trigger', context).click(event => {
            const id = scope.getFileId(event);
            scope.setRating(id, 'down');
          });

          // Rating Up
          $('.unig-file-rating-up-trigger', context).click(event => {
            const id = scope.getFileId(event);

            scope.setRating(id, 'up');
          });

          // Toggle Keywords Toolbox
          $('.unig-file-keywords-toolbox-trigger', context).click(event => {
            const name = 'keywords';
            const id = scope.getFileId(event);
            scope.toggleToolbox(id, name);
          });

          // Toggle People Toolbox
          $('.unig-file-people-toolbox-trigger', context).click(event => {
            const name = 'people';
            const id = scope.getFileId(event);
            scope.toggleToolbox(id, name);
          });

          // Toggle Download Toolbox
          $('.unig-file-download-toolbox-trigger', context).click(event => {
            const name = 'download';
            const id = scope.getFileId(event);
            scope.toggleToolbox(id, name);
          });

          // Toggle Options Toolbox
          $('.unig-file-options-toolbox-trigger', context).click(event => {
            const name = 'options';
            const id = scope.getFileId(event);
            scope.toggleToolbox(id, name);
          });

          // Set Cover image to current project
          $('.unig-set-project-cover-trigger', context).click(event => {
            const imageId = scope.getFileId(event);
            const projectId = Drupal.behaviors.unigData.project.id;
            scope.setProjectCover(projectId, imageId);
            // the actual function go via drupal <a href ... >  and "use-ajax"
          });

          // Delete File
          $('.unig-file-delete-trigger', context).click(event => {
            const fileId = scope.getFileId(event);
            const projectId = Drupal.behaviors.unigData.project.id;
            scope.deleteFile(fileId, projectId);
          });

          // Toggle Meta Info Toolbox
          $('.unig-file-metainfo-toolbox-trigger', context).click(event => {
            const name = 'metainfo';
            const id = scope.getFileId(event);
            scope.toggleToolbox(id, name);
          });

          // Event Handlers
          $('.unig-gallery-preview-wrapper img', context).hover(() => {
            $(scope)
              .parents('.unig-file-edit')
              .toggleClass('active');
          });
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
