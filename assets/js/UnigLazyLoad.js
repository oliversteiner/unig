(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigLazyLoad = {
    files: [],
    currentSize: 'medium',
    styles: [
      {
        name: 'small',
        styleName: 'unig_thumbnail',
        missing: false,
      },
      {
        name: 'medium',
        styleName: 'unig_medium',
        missing: false,
      },
      {
        name: 'large',
        styleName: 'unig_hd',
        missing: false,
      },
    ],

    /**
     *
     * @param fileList
     */
    loadImages() {
      if (Drupal.behaviors.unigSize.hasOwnProperty('currentSize')) {
        this.currentSize = Drupal.behaviors.unigSize.currentSize;
      }

      this.buildImgContainer().then(resolve => {
        console.log('buildImgContainer', resolve);
        this.addImages('medium').then(resolve => {
          console.log('medium', resolve);
          this.addImages('small').then(resolve => {
            console.log('small', resolve);
            this.addImages('large').then(resolve => {
              console.log('large', resolve);
              this.remarkImages();
              this.createMissingStyles();
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
      const message = 'done Add Message for ' + size;
      return message;
    },

    createMissingStyles() {
      this.styles.forEach(style => {
        if (style.missing) {
          const styleName = style.styleName;
          Drupal.behaviors.unigImageStyles.startWorker(styleName);
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

       console.log(` -- addImage: [${styleName}] ${file.title}`);

      // target
      $(`#unig-file-${id} .unig-lazyload-placeholder`).hide();

      const file_size = file.image[styleName].file_size;

      if (file_size !== 0) {
        // console.log('     Image Exists', file_size);

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
      } else {
        // console.log('     No File Found ');
        this.styles = this.styles.map(style => {
          if (style.name === size) {
            style.missing = true;
          }
          return style;
        });
        console.log('this.styles', this.styles);

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
      const message = 'done Build Container';
      return message;
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
