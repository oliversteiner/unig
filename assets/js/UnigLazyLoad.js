/* eslint-disable prettier/prettier */
(function ($, Drupal) {


    Drupal.behaviors.unigLazyLoad = {
        numberOfFiles: 0,

        attach() {
            console.log('Drupal.behaviors.unigLazyLoad');

        },

        /**
         *
         */
        loadImages(fileList) {
            // Get fileList
            this.numberOfFiles = fileList.length;

            console.log('fileList', fileList);

            this.buildImgContainer(fileList);
        },


        /**
         *
         */
        loadImagesSmall(fileList) {
            const mode = 'small';

            Object.keys(fileList).forEach((id) => {
                if (fileList && fileList.hasOwnProperty(id)) {
                    this.addImage(fileList, id, mode);
                }
            });

            Drupal.behaviors.unigLazyLoad.loadImagesBig(fileList);

        }
        ,

        /**
         *
         */
        loadImagesMedium(fileList) {
            const mode = 'medium';

            Object.keys(fileList).forEach((id) => {
                if (fileList && fileList.hasOwnProperty(id)) {
                    this.addImage(fileList, id, mode);
                }
            });
            Drupal.behaviors.unigLazyLoad.loadImagesSmall(fileList);


        }
        ,

        /**
         *
         */
        loadImagesBig(fileList) {
            const mode = 'big';

            Object.keys(fileList).forEach((id) => {
                if (fileList && fileList.hasOwnProperty(id)) {
                    this.addImage(fileList, id, mode);
                }
            });
        }
        ,

        /**
         *
         */
        addImage(fileList, id, mode) {
            // target
            const ModeCss = mode.replace('_', '-');


            // elem
            let name = '';
            let display = false;

            switch (mode) {

                case 'small':
                    name = 'unig_thumbnail';
                    break;

                case 'medium':
                    name = 'unig_medium';
                    display = true;
                    break;

                case 'big':
                    name = 'unig_large';
                    break;

                default :
                    name = 'unig_medium';
                    break;
            }

            console.log('Style: ', name);

            if (fileList[id].image[name]) {
                const src = fileList[id].image[name].url;
                const ImgId = `img-${id}-${mode}`;


                const NODEImg = document.createElement('img');
                NODEImg.setAttribute('src', src);
                NODEImg.setAttribute('alt', ModeCss);
                NODEImg.setAttribute('id', ImgId);


                const DomTarget = document.querySelector(`#unig-file-${id} .img-preview-${ModeCss}`);
                DomTarget.append(NODEImg);

                if (display) {
                    DomTarget.setAttribute('style', 'block')
                }
            }
            else {
                console.warn('addImage Error', fileList[id]);


                document.querySelector(`#unig-file-${id} .unig-lazyload-placeholder`).setAttribute('style', 'display:none');

                const DomElemNoPreview = document.createElement('div');
                DomElemNoPreview.setAttribute('class', 'no-preview');
                DomElemNoPreview.setAttribute('id', `no-preview-${id}`);
                DomElemNoPreview.textContent = `Kein Vorschaubild: ${mode}`;

                const DomTarget = document.querySelector(`#unig-file-${id} .unig-lazyload-container`);

                DomTarget.append(DomElemNoPreview);


            }
        }
        ,

        /**
         *
         */
        buildImgContainer(fileList) {

            console.log('--- buildImgContainer', fileList);


            if (fileList) {


                const ElemsTargetImageContainer = document.querySelectorAll(
                    'div.unig-lazyload-container'
                );

                const ImageIds = [];


                Object.keys(fileList).forEach((id, index) => {


                        console.log(id);

                        if (fileList && fileList.hasOwnProperty(id, index)) {
                            ImageIds[index] = id;
                        }
                    }
                );

                for (let i = 0; i < ElemsTargetImageContainer.length; ++i) {
                    // elem
                    const DOMContainerSmall = document.createElement('div');
                    const DOMContainerMedium = document.createElement('div');
                    const DOMContainerBig = document.createElement('div');

                    // css class
                    DOMContainerSmall.setAttribute('class', 'img-preview-small');
                    DOMContainerMedium.setAttribute('class', 'img-preview-medium');
                    DOMContainerBig.setAttribute('class', 'img-preview-big');

                    // ID
                    const id = ImageIds[i];

                    DOMContainerSmall.setAttribute('id', `img-preview-${id}-small`);
                    DOMContainerMedium.setAttribute('id', `img-preview-${id}-medium `);
                    DOMContainerBig.setAttribute('id', `img-preview-${id}-big`);

                    // hide element
                    DOMContainerSmall.setAttribute('style', 'display:none');
                    DOMContainerMedium.setAttribute('style', 'display:none');
                    DOMContainerBig.setAttribute('style', 'display:none');

                    // add new Content
                    ElemsTargetImageContainer[i].appendChild(DOMContainerMedium);
                    ElemsTargetImageContainer[i].appendChild(DOMContainerSmall);
                    ElemsTargetImageContainer[i].appendChild(DOMContainerBig);
                }
            }
            else {
                console.warn('no list');
            }

            this.loadImagesMedium(fileList);


        }
    };
})(jQuery, Drupal);
