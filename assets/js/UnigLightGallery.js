(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigLightGallery = {
    version: '1.0.0',
    lightGallery: null,
    /**
     *
     */
    update() {

      const projectId = drupalSettings.unig.project.project.id;
      const allImages = Drupal.behaviors.unigData.get();
      $('#dynamic-holder').removeData('#dynamic-holder');

      $('.lightgallery-trigger').once('dsafdsafdsa').click(event => {
        //  $(this).lightGallery().destroy();
        console.log('this.lightGallery', this.lightGallery);

        this.lightGallery = undefined;
        this.lightGallery = $('#dynamic-holder');


        let idsOfItemsVisible = [];
        const isProjectStoreLoaded = Drupal.behaviors.unigProject.Store.hasOwnProperty(
          'get',
        );
        if (isProjectStoreLoaded) {
          idsOfItemsVisible = Drupal.behaviors.unigProject.Store.get();
        }

        const dynamicEL = [];
        let index = 0;
        if (idsOfItemsVisible.length > 0) {
          for (const image of allImages) {
            if (idsOfItemsVisible.includes(image.id)) {
              // Image is Visible
              dynamicEL.push(
                {
                  src: image.image.unig_hd.url,
                  thumb: image.image.unig_thumbnail.url,
                  id: image.id,
                  index: index++,
                  favorite:image.favorite,
                },
              );

            } else {
              // Image is Hidden

            }
          }
        } else {
          // Show All Images
          for (const image of allImages) {

            dynamicEL.push(
              {
                src: image.image.unig_hd.url,
                thumb: image.image.unig_thumbnail.url,
                id: image.id,
                index: index++,
                favorite:image.favorite,
              },
            );

          }
        }


        // Get Index for Gallerystart
        const root = $(event.target).parents('.unig-file-item');
        const _id = root[0].dataset.unigFileId;
        console.log('_id', _id);

        const activeImage = dynamicEL.find(item => parseInt(item.id) === parseInt(_id));

        // Default Options
        let options = {
          dynamic: true,
          dynamicEl: dynamicEL,
          thumbnail: false,
          share: false,
          autoplay: false,
          download: false,
          zoom: false,
          loop: false,
          controls: false,
          counter: false,
          favorite: true,

        };

        // Mobile Options
        let mobileOptions = {
          dynamic: true,
          dynamicEl: dynamicEL,
          thumbnail: false,
          share: false,
          autoplay: false,
          download: false,
          zoom: false,
          loop: false,
          controls: false,
          counter: false,
          favorite: true,

        };

        // Desktop options
        const desktopOptions = {
          dynamic: true,
          dynamicEl: dynamicEL,
          thumbnail: true,
          share: false,
          autoplay: false,
          download: false,
          zoom: true,
          loop: false,
          controls: true,
          counter: true,
          favorite: true,
        };

        // Merge Options
        Object.assign(options, desktopOptions);

        // init
        const w = window.innerWidth;
        console.log('WindowSize', w);

        if (w > 700) {
          options = desktopOptions;
        }else{
          options = mobileOptions;
        }


        options.index = activeImage.index;
        options.dynamicEL = dynamicEL;

        console.log('activeImage.index', activeImage.index);
        console.log('options', options);

        this.lightGallery.lightGallery(options);
        setTimeout(() => {
          console.log('slide ... ', activeImage.index);

          this.lightGallery.data('lightGallery').slide(activeImage.index);
        }, 200);


      });

      // $elem.lightGallery(options);
    },

    /**
     *
     * @param context
     * @param settings
     */
    constructor(context, settings) {
      console.log('UniG LightGallery');

    },

    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigLightGallery')
        .each(() => {
          this.constructor(context, settings);
        });
    },
  };
})(jQuery, Drupal, drupalSettings);


