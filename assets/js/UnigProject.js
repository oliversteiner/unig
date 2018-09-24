/* eslint-disable prettier/prettier,no-console */
/**
 * Created by ost on 14.05.17.
 */

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProject = {
    toggleToolbox(nid, name) {
      // toggle Div
      const $target = $(`#unig-file-${nid} .unig-file-${name}-toolbox`);
      $target.slideToggle("fast");

      // toggle Button
      const $button = $(`#unig-file-${nid} .unig-file-${name}-toolbox-trigger`);
      $button.toggleClass("active");
    },

    toggleAllToolbox(name, modus) {
      // toggle Div
      const $target = $(`.unig-file-${name}-toolbox`);
      // toggle Button
      const $button = $(`.unig-file-${name}-toolbox-trigger`);
      const $buttonAll = $(`.unig-button-${name}-toggle-all`);

      switch (modus) {
        case "hide":
          $button.removeClass("active");
          $buttonAll.removeClass("active");
          $target.slideUp("fast");
          break;
        case "show":
          $button.addClass("active");
          $buttonAll.addClass("active");
          $target.slideDown("fast");

          break;

        default:
          $button.toggleClass("active");
          $target.slideToggle("fast");
          break;
      }
    },

    toggleEditButtons() {
      $(".unig-file-download-mark").toggle();
      $(".unig-file-rating").toggle();
      $(".unig-file-head-info").toggle();
      $(".unig-file-middle").toggle();

      $(".unig-button-files-edit").toggle();
      $(".unig-button-files-preview").toggle();
      $(".unig-button-sort-toggle").toggle();
      $(".unig-fieldset-keywords").toggle();
      $(".unig-button-files-add").toggle();
    },

    getNodeId(event) {
      const $elem = $(event.target).parents(".unig-file-item");
      const nid = $elem.data("unig-file-nid");
      return nid;
    },

    showMessages(results) {
      const messageContainer = $(".unig-messages-container");
      const type = "";

      if (results) {
        results.messages.forEach((index, item) => {});
      }
    },

    save(data, route) {
      $.ajax({
        url: Drupal.url(`unig/${route}`),
        type: "POST",
        data: {
          data: data
        },
        dataType: "json",
        success(results) {
          this.showMessages(results);
        }
      });

      return true;
    },



    setRating(nid, direction) {
      const $badge = $(`#unig-file-${nid} .unig-file-rating-badge`);
      const $input = $(`#unig-file-${nid} .unig-file-rating-input`);

      const number = parseInt($input.val(), 10);
      // console.log('number ', number);

      let numberNew = 0;
      if (direction === "up") {
        numberNew = number + 1;
      } else {
        numberNew = number - 1;
      }
      $input.val(numberNew);
      $badge.html(numberNew);
      if (numberNew !== 0) {
        $badge.addClass("active");
      } else {
        $badge.removeClass("active");
      }
      if (numberNew > 0) {
        $badge.removeClass("negativ");
        $badge.addClass("positiv");
      }
      if (numberNew < 0) {
        $badge.addClass("negativ");
        $badge.removeClass("positiv");
      }
      if (numberNew === 0) {
        $badge.removeClass("negativ");
        $badge.removeClass("positiv");
      }

      const data = {
        nid,
        value: numberNew
      };

      const route = "rating/save";

      this.save(data, route);
    },



    setProjectCover(projectNid, imageNid) {

      // get DOM Elems
      const processElem = document.querySelector(
        `.unig-image-is-cover-container-${imageNid} .unig-set-project-cover-process`
      );

      const isCoverElem = document.querySelector(
        `.unig-image-is-cover-container-${imageNid} .unig-image-is-cover`
      );

      const buttonElem = document.querySelector(
        `.unig-image-is-cover-container-${imageNid} .unig-set-project-cover-button`
      );

      // activate Process Spinner
      processElem.classList.add("active");

      const url = `/unig/set_cover/${projectNid}/${imageNid}`;

          fetch(url)
              .then(response => response.json())
              .then(myJson => {
                  // Set message to ajac container
                  const newElem = document.createElement("div");
                  newElem.innerHTML = myJson[0].data;

                  const oldElem = document.querySelector(myJson[0].selector);
                  const parentElem = oldElem.parentNode;
                  parentElem.replaceChild(newElem, oldElem);

                  // deactivate all active covers
                  const allActiveCoverElems = document.querySelectorAll(
                      ".unig-image-is-cover.active"
                  );

                  // activate all buttons
                  const allbuttonElems = document.querySelectorAll(
                      ".unig-set-project-cover-button"
                  );

                  allActiveCoverElems.forEach(elem => {
                      elem.classList.remove("active");
                  });

                  allbuttonElems.forEach(elem => {
                      elem.classList.add("active");
                  });

                  isCoverElem.classList.add("active");
                  processElem.classList.remove("active");

                  // deactivate this Button
                  buttonElem.classList.remove("active");
              });

    },

    clearAjaxMessageBox() {
      document.getElementsByClassName("unig-ajax-container").innerHtml = "";
    },

    attach(context, settings) {
      // onload
      $("*[id^='lightgallery-']").lightGallery({
        selector: ".lightgallery-item"
      });

      // Toggle all Keywords
      $(".unig-button-keywords-toggle-all", context).click(() => {
        const $trigger = $(this);
        if ($trigger.hasClass("active")) {
          this.toggleAllToolbox("keywords", "hide");
        } else {
          this.toggleAllToolbox("keywords", "show");
        }
      });

      // Toggle all People
      $(".unig-button-people-toggle-all", context).click(() => {
        const $trigger = $(this);
        if ($trigger.hasClass("active")) {
          this.toggleAllToolbox("people", "hide");
        } else {
          this.toggleAllToolbox("people", "show");
        }
      });

      // Event Handlers
      $(".unig-gallery-preview-wrapper img", context).hover(() => {
        $(this)
          .parents(".unig-file-edit")
          .toggleClass("active");
      });

      // Rating Down
      $(".unig-file-rating-down-trigger", context).click(event => {
        const nid = this.getNodeId(event);
        this.setRating(nid, "down");

        console.log(`${nid}: Down!`);
      });

      // Rating Up
      $(".unig-file-rating-up-trigger", context).click(event => {
        const nid = this.getNodeId(event);

        this.setRating(nid, "up");
        // console.log(nid + ': Up!');
      });

      // Toggle Keywords Toolbox
      $(".unig-file-keywords-toolbox-trigger", context).click(event => {
        const name = "keywords";
        const nid = this.getNodeId(event);
        this.toggleToolbox(nid, name);
      });

      // Toggle People Toolbox
      $(".unig-file-people-toolbox-trigger", context).click(event => {
        const name = "people";
        const nid = this.getNodeId(event);
        this.toggleToolbox(nid, name);
      });

      // Toggle Download Toolbox
      $(".unig-file-download-toolbox-trigger", context).click(event => {
        const name = "download";
        const nid = this.getNodeId(event);
        this.toggleToolbox(nid, name);
      });

      // Toggle Options Toolbox
      $(".unig-file-options-toolbox-trigger", context).click(event => {
        const name = "options";
        const nid = this.getNodeId(event);
        this.toggleToolbox(nid, name);
      });

      // Set Coverimage to current project
      $(".unig-set-project-cover-trigger", context).click(event => {
        // clear ajax message box
        this.clearAjaxMessageBox();
        const imageNid = this.getNodeId(event);
        const projectNid = Drupal.behaviors.unigData.project.nid;
        this.setProjectCover(projectNid, imageNid);
        // the actual function go via drupal <a href ... >  and "use-ajax"
      });

      // Toggle Meta Info Toolbox
      $(".unig-file-metainfo-toolbox-trigger", context).click(event => {
        const name = "metainfo";
        const nid = this.getNodeId(event);
        this.toggleToolbox(nid, name);
      });

      // Close Message Generate Images
      $(".unig-messages-generate-images-close-trigger", context).click(() => {
        $(".unig-messages-generate-images").hide();
      });

      // New Album Form
      $(".ajax-container-new-album-trigger", context).click(() => {
        const $container = $("#ajax-container-new-album-container");
        $container.toggle();

        const $formElemProjectNid = $("input[name='projectNid']");
        const projectNid = $container.data("projectnid");
        $formElemProjectNid.val(projectNid);
      });

      $(".unig-generate-preview-images-trigger", context).click(() => {
        Drupal.behaviors.unigLazyLoad.generatePreviewImages(context);
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
