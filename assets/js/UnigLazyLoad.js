(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigLazyLoad = {
    loop: 0,
    files: [],
    currentSize: 'medium',
    messageID: 'load-images',
    styles: [
      {
        name: 'small',
        styleName: 'unig_thumbnail',
        missing: false,
        workerCount: 0,
      },
      {
        name: 'medium',
        styleName: 'unig_medium',
        missing: false,
        workerCount: 0,
      },
      {
        name: 'large',
        styleName: 'unig_hd',
        missing: false,
        workerCount: 0,
      },
      {
        name: 'SD',
        styleName: 'unig_sd',
        missing: false,
        workerCount: 0,
      },
    ],
    workerQueue: [],

    /**
     *
     * @param fileList
     */
    loadImages(createMissingStyles = true) {
      if (Drupal.behaviors.unigSize.hasOwnProperty('currentSize')) {
        this.currentSize = Drupal.behaviors.unigSize.currentSize;
      }

      // reset Missing Styles

      this.buildImgContainer().then(resolve => {
        console.log('buildImgContainer', resolve);
        this.addImages('medium').then(resolve => {
          console.log('medium', resolve);
          this.addImages('small').then(resolve => {
            console.log('small', resolve);
            this.addImages('large').then(resolve => {
              console.log('small', resolve);
              this.addImages('SD').then(resolve => {
                console.log('SD', resolve);
                this.remarkImages();

                if(createMissingStyles){
                this.createMissingStyles();
                }
              });
            });
          });
        });
      });
    },
    /**
     *
     * @param fileList
     */
    async addImages(size) {
      this.files = drupalSettings.unig.project.files;
      this.files.forEach(file => {
        this.addImage(file, size);
      });
      return 'done';
    },

    createMissingStyles() {
      this.styles.forEach(style => {
        if (style.missing) {
          console.log('createMissingStyles', style);

          style.missing = false;
          const styleName = style.styleName;
          if (this.loop < 10) {
            this.loop++;

            if (style.workerCount === 0) {
              Drupal.behaviors.unigImageStyles.startWorker(styleName);
              style.workerCount++;
            }
          } else {
            const message = Drupal.t(
              'To many Worker Loops. Please Reload Website',
            );
            console.error(message);

            Drupal.behaviors.unigMessages.updateMessage(
              message,
              'error',
              this.messageID,
            );
            Drupal.behaviors.unigOptions.cacheClear();
          }
        }
      });
    },

    remarkImages() {
      const itemsInDownload = Drupal.behaviors.unigDownload.Store.get();
      if (itemsInDownload.length > 0) {
        itemsInDownload.forEach(id => {
          Drupal.behaviors.unigDownload.addMark(id);
        });
      }
    },

    /**
     *
     * @param fileList
     * @param id
     * @param size
     */
    addImage(file, size) {
      const style = this.styles.find(style => style.name === size);
      const styleName = style.styleName;
      const id = file.id;

      // console.log(` -- addImage: [${styleName}] ${file.title}`);

      // target
      $(`#unig-file-${id} .unig-lazyload-placeholder`).hide();

      const file_size = file.image[styleName].file_size;

      if (file_size !== 0) {
        // console.log('     Image Exists', file_size);

        if (size === 'small' || size === 'medium' || size === 'large') {
          const src = file.image[styleName].url;
          const imgID = `img-${id}-${size}`;

          const NodeImg = document.createElement('img');
          NodeImg.setAttribute('src', src);
          NodeImg.setAttribute('alt', size);
          NodeImg.setAttribute('id', imgID);

          const DomTarget = document.querySelector(
            `#unig-file-${id} .img-preview-${size}`,
          );
          DomTarget.append(NodeImg);

          if (this.currentSize === size) {
            DomTarget.setAttribute('style', 'block');
            // DomTarget.classList.add('fade-in');
          }
        }
      } else {
        // console.log('     No File Found ');
        this.styles = this.styles.map(style => {
          if (style.name === size) {
            style.missing = true;
          }
          return style;
        });
      }
    },

    /**
     *
     */
    async buildImgContainer() {
      const ElemsTargetImageContainer = document.querySelectorAll(
        'div.unig-lazyload-container',
      );

      const fileList = drupalSettings.unig.project.files;
      let i = 0;
      fileList.forEach(item => {
        // elem
        const DOMContainerSmall = document.createElement('div');
        const DOMContainerMedium = document.createElement('div');
        const DOMContainerLarge = document.createElement('div');

        // css class
        DOMContainerSmall.setAttribute('class', 'img-preview-small');
        DOMContainerMedium.setAttribute('class', 'img-preview-medium');
        DOMContainerLarge.setAttribute('class', 'img-preview-large');

        // ID

        DOMContainerSmall.setAttribute('id', `img-preview-${item.id}-small`);
        DOMContainerMedium.setAttribute('id', `img-preview-${item.id}-medium`);
        DOMContainerLarge.setAttribute('id', `img-preview-${item.id}-large`);

        // hide element
        DOMContainerSmall.setAttribute('style', 'display:none');
        DOMContainerMedium.setAttribute('style', 'display:none');
        DOMContainerLarge.setAttribute('style', 'display:none');

        // Reset
        const target = ElemsTargetImageContainer[i];
        while (target.firstChild) {
          target.removeChild(target.firstChild);
        }

        // add new Content
        ElemsTargetImageContainer[i].appendChild(DOMContainerMedium);
        ElemsTargetImageContainer[i].appendChild(DOMContainerSmall);
        ElemsTargetImageContainer[i].appendChild(DOMContainerLarge);
        i++;
      });
      return Drupal.t('Done building Container');
    },

    attach(context, settings) {
      $('#unig-main', context)
        .once('loadImages')
        .each(() => {
          console.log('UniG Load Images...');
          this.files = drupalSettings.unig.project.files;

          this.loadImages();
          console.log('UniG Load Images... Done');
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
