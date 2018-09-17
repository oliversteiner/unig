/* eslint-disable prettier/prettier,valid-jsdoc,no-console */
(function ($, Drupal) {


    Drupal.behaviors.unigLazyLoad = {
        numberOfFiles: 0,
        nodeIDsWithNoPreviews :[],

        attach() {
            console.log('Drupal.behaviors.unigLazyLoad');

        },

        /**
         *
         * @param fileList
         */
        loadImages(fileList) {
            // Get fileList
            this.numberOfFiles = fileList.length;

            console.log('fileList', fileList);

            this.buildImgContainer(fileList);
        },


        /**
         *
         * @param fileList
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
         * @param fileList
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
         * @param fileList
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
         * @param fileList
         * @param id
         * @param mode
         */
        addImage(fileList, id, mode) {
            // target
            document.querySelector(`#unig-file-${id} .unig-lazyload-placeholder`).setAttribute('style', 'display:none');


            // elem
            let styleName = '';
            let display = false;

            switch (mode) {

                case 'small':
                    styleName = 'unig_thumbnail';
                    break;

                case 'medium':
                    styleName = 'unig_medium';
                    display = true;
                    break;

                case 'big':
                    styleName = 'unig_hd';
                    break;

                default :
                    styleName = 'unig_medium';
                    break;
            }

            console.log('Style: ', styleName);

            if (fileList[id].image[styleName]) {
                const src = fileList[id].image[styleName].url;
                const imgID = `img-${id}-${mode}`;


                const NODEImg = document.createElement('img');
                NODEImg.setAttribute('src', src);
                NODEImg.setAttribute('alt', mode);
                NODEImg.setAttribute('id', imgID);


                const DomTarget = document.querySelector(`#unig-file-${id} .img-preview-${mode}`);
                DomTarget.append(NODEImg);

                if (display) {
                    DomTarget.setAttribute('style', 'block')
                }
            }
            else {
                console.warn('addImage Error', fileList[id]);
                Drupal.behaviors.unigLazyLoad.nodeIDsWithNoPreviews.push(id);
                const DomElemNoPreview = document.createElement('div');
                DomElemNoPreview.setAttribute('class', `no-preview-${mode}`);
                DomElemNoPreview.setAttribute('id', `no-preview-${mode}-${id}`);
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

                        if (fileList && fileList.hasOwnProperty(id)) {
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
