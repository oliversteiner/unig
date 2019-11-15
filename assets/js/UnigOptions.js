(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigOptions = {
    serverError(object) {
      const text = 'Server Error: ' + object.message;
      const type = 'error';
      Drupal.behaviors.unigMessages.addMessage(text, type);
    },

    async cacheRebuild() {
      const title = 'Rebuild Cache';
      const name = 'cache-rebuild';
      return await this.projectCache(title, name);
    },

    addFileInfo() {
      const files = drupalSettings.unig.project.files;
      const downloadSizes = [
        { name: 'sd', styleName: 'unig_sd' },
        { name: 'hd', styleName: 'unig_hd' },
        { name: 'xl', styleName: 'original' },
      ];

      files.forEach(file => {
        const id = file.id;

        downloadSizes.forEach(downloadSize => {

          const name = downloadSize.name;
          const styleName = downloadSize.styleName;

          const size = file.image[styleName].file_size_formatted;
          const width = file.image[styleName].width + '&thinsp;px';

          // search
          $(`.unig-file-${id} .unig-file-download-table-width-${name}`).html(
            width,
          );
          $(`.unig-file-${id} .unig-file-download-table-size-${name}`).html(
            size,
          );
        });
      });
    },


     cacheClear() {
      const title = 'Clear Cache';
      const name = 'cache-clear';
      return  this.projectCache(title, name);
    },

     async projectCache(title, name) {
       Drupal.behaviors.unigMessages.clear();

      const id = this.getProjectID();
      const messageID = `${name}-${id}`;
      console.log(`${title} for Project ${id}`);
      const url = `/unig/api/${name}/${id}`;

      let text = `${title} for Project with id: ${id}`;
      let type = 'load';
      let timer = 0;
      Drupal.behaviors.unigMessages.updateMessage(text, type, messageID);

       fetch(url).then(response => {
        if (response.status === 404) {
          response.json().then(object => {
            this.serverError(object);
          });
        } else if (response.status === 200) {
          response.json().then(data => {
            text = `${title} for Project with id: ${data.projectId}.`;
            timer = data.timer;
            type = 'success';

            if (data.variables) {
              drupalSettings.unig.project.project = data.variables.project;
              drupalSettings.unig.project.album = data.variables.album;
              drupalSettings.unig.project.files = data.variables.files;
              this.addFileInfo();


            }

            if (!data[name]) {
              text = `Cant ${title}for Project with id: ${data.projectId}`;
              type = 'error';
            }

            Drupal.behaviors.unigMessages.updateMessage(
              text,
              type,
              messageID,
              timer,
            );
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

      fetch(url).then(response => {
        if (response.status === 404) {
          response.json().then(object => {
            this.serverError(object);
          });
        } else if (response.status === 200) {
          response.json().then(data => {
            // Set message to ajax container
            const text = data.messages[0][0];
            const type = data.messages[0][1];
            Drupal.behaviors.unigMessages.addMessage(text, type);
          });
        }
      });
    },

    startGeneratingImageStyles() {
      console.log('Start Generating Image Styles');
      Drupal.behaviors.unigImageStyles.startWorker('unig_medium');
      Drupal.behaviors.unigImageStyles.startWorker('unig_sd');
      Drupal.behaviors.unigImageStyles.startWorker('unig_hd');
      Drupal.behaviors.unigImageStyles.startWorker('unig_thumbnail');
      this.$StartTrigger.hide();
      this.$StopTrigger.show();
    },

    stopGeneratingImageStyles(style) {
      console.log('Stop Generating Image Styles');
      Drupal.behaviors.unigImageStyles.stopWorker(style);
      this.$StartTrigger.show();
      this.$StopTrigger.hide();
    },

    clearLocalStorage(){

      // People
      const isPeopleStoreLoaded = Drupal.behaviors.unigPeople.Store.hasOwnProperty(
        'clear',
      );
      if (isPeopleStoreLoaded) {
        Drupal.behaviors.unigPeople.Store.clear();
      }

      // Keywords
      const isKeywordStoreLoaded = Drupal.behaviors.unigKeywords.Store.hasOwnProperty(
        'clear',
      );
      if (isKeywordStoreLoaded) {
        Drupal.behaviors.unigKeywords.Store.clear();
      }

      // Project
      const isProjectStoreLoaded = Drupal.behaviors.unigProject.Store.hasOwnProperty(
        'clear',
      );
      if (isProjectStoreLoaded) {
        Drupal.behaviors.unigProject.Store.clear();
      }

      Drupal.behaviors.unigProject.updateBrowser();

    },

    attach(context) {
      $('#unig-main', context)
        .once('options')
        .each(() => {
          console.log('UniG Options');
          this.$StartTrigger = $(
            '.unig-generate-image-styles-start-trigger',
            context,
          );
          this.$StopTrigger = $(
            '.unig-generate-image-styles-stop-trigger',
            context,
          );
          const $optionsDropdown = $('.unig-dropdown-project-options', context);

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
            this.cacheClear();
            $optionsDropdown.hide();
          });

          //  Clear Cache
          $('.unig-rebuild-project-cache-trigger', context).click(() => {
            this.cacheRebuild();
            $optionsDropdown.hide();
          });

          //  Clear Local Store
          $('.unig-clear-local-storage-trigger', context).click(() => {
            this.clearLocalStorage();
            $optionsDropdown.hide();
          });

          //  start generating image styles
          this.$StartTrigger.click(() => {
            this.startGeneratingImageStyles();
            $optionsDropdown.hide();
          });

          //  stop generating image styles
          this.$StopTrigger.click(() => {
            this.stopGeneratingImageStyles();
            $optionsDropdown.hide();
          });
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
