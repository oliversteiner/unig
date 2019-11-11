(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigLazyLoad = {
    files: [],
    styles:{
      small:'unig_thumbnail',
      medium:'unig_medium',
      large:'unig_hd'
    },
    rebuildStyles:{
      small:false,
      medium:false,
      large:false
    },

    replaceImage(nid, result) {
      const styleNames = ['unig_thumbnail', 'unig_medium', 'unig_hd'];
      let mode = '';

      if (result.data) {
        styleNames.forEach(styleName => {
          if (result.data.hasOwnProperty(styleName)) {
            switch (styleName) {
              case 'unig_thumbnail':
                mode = 'small';
                break;

              case 'unig_medium':
                mode = 'medium';
                break;

              case 'unig_hd':
                mode = 'large';
                break;

              default:
                mode = 'medium';
                break;
            }

            // set current process image name in message block
            document.querySelector(
              '.unig-generate-images-current-process-name',
            ).textContent = result.title;

            // set current process image style name in message block
            document.querySelector(
              '.unig-generate-images-current-process-size',
            ).textContent = `(${mode})`;

            const srcCache = result.data[styleName].url;

            const n = srcCache.indexOf('?');
            const src = srcCache.substring(0, n !== -1 ? n : srcCache.length);

            const imgId = `img-${nid}-${styleName}`;

            const NODEImg = document.createElement('img');
            NODEImg.setAttribute('src', src);
            NODEImg.setAttribute('alt', mode);
            NODEImg.setAttribute('id', imgId);

            const DomTarget = document.querySelector(
              `#unig-file-${nid} .img-preview-${mode}`,
            );
            DomTarget.innerHTML = '';
            DomTarget.appendChild(NODEImg);

            const DomTargetPreview = document.querySelector(
              `#no-preview-${mode}-${nid}`,
            );
            if (DomTargetPreview) {
              DomTargetPreview.parentElement.removeChild(DomTargetPreview);
            }

            if (mode === 'medium') {
              DomTarget.setAttribute('style', 'block');
              DomTarget.classList.add('fade-in');
            }
          }
        });

        //   lightgallery

        if (result.data.hasOwnProperty('unig_hd')) {
          const DomLightgallery = document.querySelector(
            `#unig-lightgallery-placeholder-${nid}`,
          );
          DomLightgallery.setAttribute('data-src', result.data.unig_hd);
        }

        // Dom-Elem Spinner
        const DomTargetPreviewSpinner = document.querySelector(
          `#no-preview-spinner-${nid}`,
        );

        // remove Spinner
        if (DomTargetPreviewSpinner) {
          DomTargetPreviewSpinner.parentElement.removeChild(
            DomTargetPreviewSpinner,
          );
        }
      }
    },

    /**
     *
     * @param id
     * @param context
     */
    spinnerPlaceholder(id, context) {
      const ElemSpinner = document.createElement('div');
      ElemSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      ElemSpinner.setAttribute('id', `no-preview-spinner-${id}`);
      ElemSpinner.setAttribute('class', `no-preview-spinner`);

      const DomTarget = document.querySelector(
        `#unig-file-${id} .unig-lazyload-container`,
      );
      DomTarget.append(ElemSpinner);

      const DomTargetPreviewSmall = document.querySelector(
        `#no-preview-small-${id}`,
      );
      if (DomTargetPreviewSmall) {
        DomTargetPreviewSmall.parentElement.removeChild(DomTargetPreviewSmall);
      }

      const DomTargetPreviewMedium = document.querySelector(
        `#no-preview-medium-${id}`,
      );
      if (DomTargetPreviewMedium) {
        DomTargetPreviewMedium.parentElement.removeChild(
          DomTargetPreviewMedium,
        );
      }

      const DomTargetPreviewLarge = document.querySelector(
        `#no-preview-large-${id}`,
      );
      if (DomTargetPreviewLarge) {
        DomTargetPreviewLarge.parentElement.removeChild(DomTargetPreviewLarge);
      }
    },
    /**
     *
     * @param context
     */
    generatePreviewImages(context) {},

    /**
     *
     * @param fileList
     */
    loadImages() {
      this.buildImgContainer();
    },
    /**
     *
     * @param fileList
     */
    loadImagesSmall(fileList) {
      const mode = 'small';

      fileList.forEach(file => {
        this.addImage(file, mode);
      });

      this.loadImagesLarge(fileList);
    },
    /**
     *
     * @param fileList
     */
    loadImagesMedium(fileList) {
      const mode = 'medium';

      fileList.forEach(file => {
        this.addImage(file, mode);
      });
      this.loadImagesSmall(fileList);
    },
    /**
     *
     * @param fileList
     */
    loadImagesLarge(fileList) {
      const mode = 'large';

      fileList.forEach(file => {
        this.addImage(file, mode);
      });
    },
    /**
     *
     * @param fileList
     * @param id
     * @param mode
     */
    addImage(file, mode) {
      console.log(` -- addImage: [${mode}] ${file.title}`);

      const id = file.id;
      // target
      $(`#unig-file-${id} .unig-lazyload-placeholder`).hide();

      // elem
      let styleName = '';
      let display = false;

      switch (mode) {
        case 'small':
          styleName = 'unig_thumbnail';
          break;

        case 'large':
          styleName = 'unig_hd';
          break;

        case 'medium':
          styleName = 'unig_medium';
          display = true;
          break;

        default:
          styleName = 'unig_medium';
          break;
      }

      const file_size = file.image[styleName].file_size;

      if (file_size !== 0) {
        console.log('     Image Exists', file_size);

        const src = file.image[styleName].url;
        const imgID = `img-${id}-${mode}`;

        const NodeImg = document.createElement('img');
        NodeImg.setAttribute('src', src);
        NodeImg.setAttribute('alt', mode);
        NodeImg.setAttribute('id', imgID);

        const DomTarget = document.querySelector(
          `#unig-file-${id} .img-preview-${mode}`,
        );
        DomTarget.append(NodeImg);

        if (display) {
          DomTarget.setAttribute('style', 'block');
          // DomTarget.classList.add('fade-in');
        }
      } else{
        console.log('     No File Found ');
this.rebuildStyles[mode] = true;
      }
    },
    /**
     *
     */
    buildImgContainer() {
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

      this.loadImagesMedium(fileList);

      setTimeout(() => {
        // remark items
        const itemsInDownload = Drupal.behaviors.unigDownload.Store.get();
        if (itemsInDownload.length > 0) {
          itemsInDownload.forEach(id => {
            Drupal.behaviors.unigDownload.addMark(id);
          });
        }

        //  this.generatePreviewImages();
      }, 10);
    },

    attach(context, settings) {
      $('#unig-main', context)
        .once('loadImages')
        .each(() => {
          console.log('UniG Load Images...');
          const files = drupalSettings.unig.project.files;
          this.files = files;
          this.numberOfFiles = files.length;

          this.loadImages();
          console.log('UniG Load Images... Done');
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
