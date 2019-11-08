(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigOptions = {
    clearProjectCache() {
      const id = this.getProjectID();
      const messgeID = 'rb-' + id;
      console.log('clear cache for Project ' + id);
      const url = `/unig/api/cc/${id}`;

      let text = 'Clear Cache for Project with id: ' + id;
      let type = 'load';
      Drupal.behaviors.unigMessages.addMessage(text, type, messgeID);

      fetch(url).then(response => {
        console.log('response', response);

        if (response.status === 404) {
          response.json().then(function(object) {
            Drupal.behaviors.unigMessages.removeMessageByID(messgeID);
            text = 'Server Error: ' + object.message;
            type = 'error';
            Drupal.behaviors.unigMessages.addMessage(text, type);

            console.log(object.type, object.message);
          });
        } else if (response.status === 200) {
          response.json().then(data => {
            text = 'Clear Cache for Project with id: ' + data.projectId;
            type = 'success';

            if (!data.clearCache) {
              text = 'Cant Clear Cache for Project with id: ' + data.projectId;
              type = 'error';
            }
            Drupal.behaviors.unigMessages.removeMessageByID(messgeID);
            Drupal.behaviors.unigMessages.addMessage(text, type);
          });
        }
      });
    },

    getProjectID() {
      const id = $('.unig-project-id').data('unig-project-id');
      return id;
    },

    extractKeywords() {
      const id = this.getProjectID();
      const url = `/unig/process/extract-keyword/${id}/`;

      fetch(url)
        .then(response => response.json())
        .then(json => {
          // Set message to ajax container
          const text = json.messages[0][0];
          const type = json.messages[0][1];
          Drupal.behaviors.unigMessages.addMessage(text, type);
        });
    },

    attach(context) {
      $('#unig-main', context)
        .once('options')
        .each(() => {
          console.log('UniG Options');

          const $optionsDropdown = $('.unig-dropdown-project-options');

          // Toggle Options
          $('.unig-project-options-trigger', context).click(() => {
            $optionsDropdown.toggle();
          });

          // Close Options
          $('.unig-project-options-close-trigger', context).click(() => {
            $optionsDropdown.hide();
          });

          // Extract Keywords
          $('.unig-extract-keywords-trigger', context).click(() => {
            this.extractKeywords();
            $optionsDropdown.hide();
          });

          //  Clear Cache
          $('.unig-clear-project-cache-trigger', context).click(() => {
            this.clearProjectCache();
            $optionsDropdown.hide();
          });
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
