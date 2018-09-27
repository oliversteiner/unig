(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProject = {
    // Image Titles
    statusNames: false,
    statusIndex: false,

    // ----- Names
    // Button
    elemButtonNames: document.querySelector(".unig-gallery-button-image-name"),

    // Show
    elemLabelShowNames: document.querySelector(
      ".unig-gallery-image-name-label-show"
    ),

    // Hide
    elemLabelHideNames: document.querySelector(
      ".unig-gallery-image-name-label-hide"
    ),

    // ------ Index

    // Button
    elemButtonIndex: document.querySelector(".unig-gallery-button-image-index"),

    // Show
    elemLabelShowIndex: document.querySelector(
      ".unig-gallery-image-index-label-show"
    ),

    // Hide
    elemLabelHideIndex: document.querySelector(
      ".unig-gallery-image-index-label-hide"
    ),
    /**
     *
     */
    showImageNames() {
      this.elemLabelShowNames.setAttribute("style", "display:none");
      this.elemLabelHideNames.setAttribute("style", "display:block");

      // Show Title
      document.querySelectorAll(".unig-file-name").forEach(elem => {
        elem.setAttribute("style", "display:block");
      });

      // set Active
      this.elemButtonNames.classList.add("active");
    },
    /**
     *
     */
    hideImageNames() {
      this.elemLabelShowNames.setAttribute("style", "display:block");
      this.elemLabelHideNames.setAttribute("style", "display:none");

      // Show Title
      document.querySelectorAll(".unig-file-name").forEach(elem => {
        elem.setAttribute("style", "display:none");
      });

      // unset Active
      this.elemButtonNames.classList.remove("active");
    },
    /**
     *
     */
    toggleImageNames() {
      if (!this.statusNames) {
        this.showImageNames();
        this.statusNames = true;
      } else {
        this.hideImageNames();
        this.statusNames = false;
      }
    },

    // Image Index Numbers
    showImageIndex() {
      this.elemLabelShowIndex.setAttribute("style", "display:none");
      this.elemLabelHideIndex.setAttribute("style", "display:block");

      // Show Title
      document.querySelectorAll(".unig-file-index").forEach(elem => {
        elem.setAttribute("style", "display:block");
      });

      // set Active
      this.elemButtonIndex.classList.add("active");
    },
    hideImageIndex() {
      this.elemLabelShowIndex.setAttribute("style", "display:block");
      this.elemLabelHideIndex.setAttribute("style", "display:none");

      // Show Title
      document.querySelectorAll(".unig-file-index").forEach(elem => {
        elem.setAttribute("style", "display:none");
      });

      // unset Active
      this.elemButtonIndex.classList.remove("active");
    },
    toggleImageIndex() {
      if (!this.statusIndex) {
        this.showImageIndex();
        this.statusIndex = true;
      } else {
        this.hideImageIndex();
        this.statusIndex = false;
      }
    },

    // Attach
    attach(context, settings) {
      // onload
      $("*[id^='lightgallery-']").lightGallery({
        selector: ".lightgallery-item"
      });

      // Title Trigger
      document
        .querySelector(".unig-gallery-image-name-trigger", context)
        .addEventListener("click", () => {
          // change Button Label
          this.toggleImageNames();
        });

      // Index Trigger
      document
        .querySelector(".unig-gallery-image-index-trigger", context)
        .addEventListener("click", () => {
          // change Button Label
          this.toggleImageIndex();
        });
    }
  };
})(jQuery, Drupal, drupalSettings);
