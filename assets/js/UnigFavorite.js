(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigFavorite = {
    version: '1.0.0',
    show: false,
    number_of_favorites: 0,
    toggleShowOnlyFavorites() {
      this.show = !this.show;
      const fullList = Drupal.behaviors.unigData.FileList.list;

      if (fullList && fullList.length > 0) {
        for (const item of fullList) {
          const $elem = $(`#unig-file-${item.id}`);
          if (this.show) {
            $('.unig-toolbar-favorite-toggle').addClass('active');
            if (item.favorite) {
              $elem.show();
              $elem.data('current', true);
            } else {
              $elem.hide();
              $elem.data('current', false);
            }
            $('.unig-button-download-add-current-to-list').show();
            $('.number-of-visible').html(this.number_of_favorites);
            $('.icon-of-visible').html('<i class="fas fa-heart" aria-hidden="true"></i>');

            // hide not favorites
          } else {
            // show all
            $('.unig-toolbar-favorite-toggle').removeClass('active');
            $('.unig-button-download-add-current-to-list').hide();
            $('.number-of-visible').html('');
            $elem.show();
            $elem.data('current', false);
          }
        }
      }

    },

    update() {

      const favorites = Drupal.behaviors.unigData.FileList.list.filter(
        item => item.favorite === 1,
      );

      this.number_of_favorites = favorites.length;

      $('.unig-favorite-number-of').html(this.number_of_favorites);
    },

    toggleFavorite: function(fileId, projectId) {
      let favorite = 0;

      // set Favorite
      Drupal.behaviors.unigData.FileList.list.forEach(file => {
        if (file.id === fileId) {

          if (file.favorite) {
            favorite = 0;
            $(`#unig-file-${fileId}  .unig-file-favorite`).removeClass(
              'favorite',
            );
          } else {
            favorite = 1;
            $(`#unig-file-${fileId} .unig-file-favorite`).addClass('favorite');
          }
          file.favorite = favorite;
        }
      });

      // Loading Message
      let text = 'Set Favorite Status to File ' + fileId;
      let type = 'load';
      const messageID = 'favorite';
      Drupal.behaviors.unigMessages.removeMessageByID(messageID);
      Drupal.behaviors.unigMessages.addMessage(text, type, messageID);

      // send to server
      const url = `/unig/api/file/favorite/${fileId}/${favorite}/${projectId}`;

      fetch(url)
        .then(response => response.json())
        .then(data => {

          // Set message to ajax container
          const text = data.message;
          let type = 'info';
          if (data.status) {
            if (favorite) {
              type = 'favorite';
            } else {
              type = 'info';
            }
          }
          // Update Message
          Drupal.behaviors.unigMessages.removeMessageByID(messageID);
          Drupal.behaviors.unigMessages.addMessage(text, type, messageID);
        });
    },

    constructor(context, settings) {
      this.update();

      // Toolbar
      $('.unig-toolbar-favorite-toggle-trigger', context).click(() => {
        this.toggleShowOnlyFavorites();
      });

      // For File
      $('.unig-file-favorite-trigger', context).click((event) => {
        const fileId = Drupal.behaviors.unig.getFileId(event);
        const projectId = Drupal.behaviors.unigData.project.id;
        this.toggleFavorite(fileId, projectId);
        this.update();
      });

    },

    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigFavorite')
        .each(() => {
          this.constructor(context, settings);
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
