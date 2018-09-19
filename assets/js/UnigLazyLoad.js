/* eslint-disable prettier/prettier,valid-jsdoc,no-console */
(function($, Drupal) {
  Drupal.behaviors.unigLazyLoad = {
    numberOfFiles: 0,
    nodeIDsWithNoPreviews: [],
    imagesCounter: 0,
    attach() {
      console.log("Drupal.behaviors.unigLazyLoad");
    },
    replaceImage(nid, result) {
      const styleNames = ["unig_thumbnail", "unig_medium", "unig_hd"];
      let mode = "";

      if (result.data) {
        styleNames.forEach(styleName => {
          if (result.data.hasOwnProperty(styleName)) {

            // set current process image name in message block
            document.querySelector(
              ".unig-generate-images-current-process-name"
            ).textContent = result.title;

            // set current process image style name in message block
            document.querySelector(
              ".unig-generate-images-current-process-size"
            ).textContent = `(${styleName})`;

            switch (styleName) {
              case "unig_thumbnail":
                mode = "small";
                break;

              case "unig_medium":
                mode = "medium";
                break;

              case "unig_hd":
                mode = "big";
                break;

              default:
                mode = "medium";
                break;
            }
            console.log("mode:", mode);

            const srcCache = result.data[styleName];

            const n = srcCache.indexOf("?");
            const src = srcCache.substring(0, n !== -1 ? n : srcCache.length);

            const imgId = `img-${nid}-${styleName}`;

            const NODEImg = document.createElement("img");
            NODEImg.setAttribute("src", src);
            NODEImg.setAttribute("alt", mode);
            NODEImg.setAttribute("id", imgId);

            console.log(`#unig-file-${nid} .img-preview-${mode}`);

            const DomTarget = document.querySelector(
              `#unig-file-${nid} .img-preview-${mode}`
            );
            DomTarget.innerHTML = "";
            DomTarget.appendChild(NODEImg);

            const DomTargetPreview = document.querySelector(
              `#no-preview-${mode}-${nid}`
            );
            if (DomTargetPreview) {
              DomTargetPreview.parentElement.removeChild(DomTargetPreview);
            }

            if (mode === "medium") {
              DomTarget.setAttribute("style", "block");
            }
          }
        });

        //   lightgallery
        const DomLightgallery = document.querySelector(
          `#unig-lightgallery-placeholder-${nid}`
        );
        DomLightgallery.setAttribute("data-src", result.data.unig_hd);

        // Dom-Elem Spinner
        const DomTargetPreviewSpinner = document.querySelector(
          `#no-preview-spinner-${nid}`
        );

        // remove Spinner
        if (DomTargetPreviewSpinner) {
          DomTargetPreviewSpinner.parentElement.removeChild(
            DomTargetPreviewSpinner
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
      console.log("spinnerPlaceholder", id);
      $("#unig-main", context)
        .once(`preview-${id}`)
        .each(() => {
          const ElemSpinner = document.createElement("div");
          ElemSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          ElemSpinner.setAttribute("id", `no-preview-spinner-${id}`);
          ElemSpinner.setAttribute("class", `no-preview-spinner`);

          const DomTarget = document.querySelector(
            `#unig-file-${id} .unig-lazyload-container`
          );
          DomTarget.append(ElemSpinner);

          const DomTargetPreviewSmall = document.querySelector(
            `#no-preview-small-${id}`
          );
          if (DomTargetPreviewSmall) {
            DomTargetPreviewSmall.parentElement.removeChild(
              DomTargetPreviewSmall
            );
          }

          const DomTargetPreviewMedium = document.querySelector(
            `#no-preview-medium-${id}`
          );
          if (DomTargetPreviewMedium) {
            DomTargetPreviewMedium.parentElement.removeChild(
              DomTargetPreviewMedium
            );
          }

          const DomTargetPreviewBig = document.querySelector(
            `#no-preview-big-${id}`
          );
          if (DomTargetPreviewBig) {
            DomTargetPreviewBig.parentElement.removeChild(DomTargetPreviewBig);
          }
        });
    },
    /**
     *
     * @param context
     */
    generatePreviewImages(context) {
      const test = false;
      const nids = Drupal.behaviors.unigLazyLoad.nodeIDsWithNoPreviews;

      console.log("generatePreviewImages", nids);

      const numberOfImages = nids.length;

      Drupal.behaviors.unigLazyLoad.imagesCounter = 1;
      if (nids && numberOfImages > 0) {
        // show message block
        document
          .querySelector(".unig-messages-generate-images")
          .setAttribute("style", "display:block");

        // add number of images to message block
        document.querySelector(
          ".unig-preview-image-number-of-images"
        ).textContent = numberOfImages.toString();

        if (test === true) {
          console.log("---------- generate Preview Test Mode -----------");

          // Add Spinner to Image Placeholder
          nids.forEach(nid => {
            this.spinnerPlaceholder(nid, context);
          });

          // iterate over Placeholders, remove Spinner and add Check
          nids.forEach((nid, index) => {
            setTimeout(() => {
              // Dom-Elem
              const DomTargetPreviewSpinner = document.querySelector(
                `#no-preview-spinner-${nid}`
              );

              if (DomTargetPreviewSpinner) {
                // remove Spinner
                DomTargetPreviewSpinner.parentElement.removeChild(
                  DomTargetPreviewSpinner
                );

                // Add check
                document.querySelector(`#img-preview-${nid}-medium`).innerHTML =
                  '<i class="fas fa-check fa-3x">';

                // Display Elem
                document
                  .querySelector(`#img-preview-${nid}-medium`)
                  .setAttribute("style", "display:block");
              }

              // Update Counter Number in Message Block
              document.querySelector(
                ".unig-preview-image-counter"
              ).textContent = Drupal.behaviors.unigLazyLoad.imagesCounter.toString();

              // Update Counter
              Drupal.behaviors.unigLazyLoad.imagesCounter += 1;
              console.log(index);

              // after last elem in list
              if (index === numberOfImages - 1) {
                this.generatePreviewImagesDone();
              }
            }, index * 500);
          });

          console.log("---------- End Test Mode -----------");
        } else {
          //  First generate medium Previews
          nids.forEach(nid => {
            // add spinner
            this.spinnerPlaceholder(nid, context);

            $.ajax({
              url: Drupal.url(`unig/imagestyles/${nid}/unig_medium`),
              type: "get",
              dataType: "json",
              success(results) {
                Drupal.behaviors.unigLazyLoad.replaceImage(nid, results);
              }
            });
          });

          //  wate 2 seconds and generate all other styles
          setTimeout(() => {
            nids.forEach(nid => {
              $.ajax({
                url: Drupal.url(`unig/imagestyles/${nid}`),
                type: "get",
                dataType: "json",
                success(results) {
                  Drupal.behaviors.unigLazyLoad.replaceImage(nid, results);

                  // Update Counter Number in Message Block
                  document.querySelector(
                    ".unig-preview-image-counter"
                  ).textContent = Drupal.behaviors.unigLazyLoad.imagesCounter.toString();

                  // Update Counter
                  Drupal.behaviors.unigLazyLoad.imagesCounter += 1;

                  // after last elem in list
                  if (Drupal.behaviors.unigLazyLoad.imagesCounter === numberOfImages - 1) {
                      Drupal.behaviors.unigLazyLoad.generatePreviewImagesDone();
                  }
                }
              });
            });
          }, 10000);
        } // end else Test
      }
    },

    generatePreviewImagesDone() {
      // show: process done
      document
        .querySelector(".unig-preview-image-process-done")
        .setAttribute("style", "display:inline-block");

      // hide: Process Work
      document
        .querySelector(".unig-preview-image-process-work")
        .setAttribute("style", "display:none");

      // hide: current-process-name
      document
        .querySelector(".unig-generate-images-current-process-name")
        .setAttribute("style", "display:none");

      // hide: current-process-size
      document
        .querySelector(".unig-generate-images-current-process-size")
        .setAttribute("style", "display:none");
    },
    /**
     *
     * @param fileList
     */
    loadImages(fileList) {
      // Get fileList

      this.numberOfFiles = fileList.length;

      console.log("fileList", fileList);

      this.buildImgContainer(fileList);
    },
    /**
     *
     * @param fileList
     */
    loadImagesSmall(fileList) {
      const mode = "small";

      Object.keys(fileList).forEach(id => {
        if (fileList && fileList.hasOwnProperty(id)) {
          this.addImage(fileList, id, mode);
        }
      });

      Drupal.behaviors.unigLazyLoad.loadImagesBig(fileList);
    },
    /**
     *
     * @param fileList
     */
    loadImagesMedium(fileList) {
      console.error(
        "nodeIDsWithNoPreviews",
        Drupal.behaviors.unigLazyLoad.nodeIDsWithNoPreviews.length
      );

      if (Drupal.behaviors.unigLazyLoad.nodeIDsWithNoPreviews.length === 0) {
        const mode = "medium";

        Object.keys(fileList).forEach(id => {
          if (fileList && fileList.hasOwnProperty(id)) {
            this.addImage(fileList, id, mode);
          }
        });
        Drupal.behaviors.unigLazyLoad.loadImagesSmall(fileList);
      }
    },
    /**
     *
     * @param fileList
     */
    loadImagesBig(fileList) {
      const mode = "big";

      Object.keys(fileList).forEach(id => {
        if (fileList && fileList.hasOwnProperty(id)) {
          this.addImage(fileList, id, mode);
        }
      });
    },
    /**
     *
     * @param fileList
     * @param id
     * @param mode
     */
    addImage(fileList, id, mode) {
      // target
      document
        .querySelector(`#unig-file-${id} .unig-lazyload-placeholder`)
        .setAttribute("style", "display:none");

      // elem
      let styleName = "";
      let display = false;

      switch (mode) {
        case "small":
          styleName = "unig_thumbnail";
          break;

        case "medium":
          styleName = "unig_medium";
          display = true;
          break;

        case "big":
          styleName = "unig_hd";
          break;

        default:
          styleName = "unig_medium";
          break;
      }

      console.log("Style: ", styleName);

      if (fileList[id].image[styleName]) {
        const src = fileList[id].image[styleName].url;
        const imgID = `img-${id}-${mode}`;

        const NODEImg = document.createElement("img");
        NODEImg.setAttribute("src", src);
        NODEImg.setAttribute("alt", mode);
        NODEImg.setAttribute("id", imgID);

        const DomTarget = document.querySelector(
          `#unig-file-${id} .img-preview-${mode}`
        );
        DomTarget.append(NODEImg);

        if (display) {
          DomTarget.setAttribute("style", "block");
        }
      } else {
        // check if id is already in arry

        if (!Drupal.behaviors.unigLazyLoad.nodeIDsWithNoPreviews.includes(id)) {
          Drupal.behaviors.unigLazyLoad.nodeIDsWithNoPreviews.push(id);
        }

        const DomElemNoPreview = document.createElement("div");
        DomElemNoPreview.setAttribute("class", `no-preview-${mode}`);
        DomElemNoPreview.setAttribute("id", `no-preview-${mode}-${id}`);
        DomElemNoPreview.textContent = `Kein Vorschaubild: ${mode}`;

        const DomTarget = document.querySelector(
          `#unig-file-${id} .unig-lazyload-container`
        );

        DomTarget.append(DomElemNoPreview);
      }
    },
    /**
     *
     */
    buildImgContainer(fileList) {
      console.log("--- buildImgContainer", fileList);

      Drupal.behaviors.unigLazyLoad.nodeIDsWithNoPreviews = [];

      if (fileList) {
        const ElemsTargetImageContainer = document.querySelectorAll(
          "div.unig-lazyload-container"
        );

        const ImageIds = [];

        Object.keys(fileList).forEach((id, index) => {
          console.log(id);

          if (fileList && fileList.hasOwnProperty(id)) {
            ImageIds[index] = id;
          }
        });

        for (let i = 0; i < ElemsTargetImageContainer.length; ++i) {
          // elem
          const DOMContainerSmall = document.createElement("div");
          const DOMContainerMedium = document.createElement("div");
          const DOMContainerBig = document.createElement("div");

          // css class
          DOMContainerSmall.setAttribute("class", "img-preview-small");
          DOMContainerMedium.setAttribute("class", "img-preview-medium");
          DOMContainerBig.setAttribute("class", "img-preview-big");

          // ID
          const id = ImageIds[i];

          DOMContainerSmall.setAttribute("id", `img-preview-${id}-small`);
          DOMContainerMedium.setAttribute("id", `img-preview-${id}-medium`);
          DOMContainerBig.setAttribute("id", `img-preview-${id}-big`);

          // hide element
          DOMContainerSmall.setAttribute("style", "display:none");
          DOMContainerMedium.setAttribute("style", "display:none");
          DOMContainerBig.setAttribute("style", "display:none");

          // add new Content
          ElemsTargetImageContainer[i].appendChild(DOMContainerMedium);
          ElemsTargetImageContainer[i].appendChild(DOMContainerSmall);
          ElemsTargetImageContainer[i].appendChild(DOMContainerBig);
        }

        this.loadImagesMedium(fileList);

        setTimeout(() => {
          this.generatePreviewImages();
        }, 500);
      } else {
        console.warn("no list");
      }
    }
  };
})(jQuery, Drupal);
