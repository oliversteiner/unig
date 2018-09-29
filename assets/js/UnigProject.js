/* eslint-disable prettier/prettier,no-console */

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

    getProjectNid() {
      return drupalSettings.unig.project.project.nid;
    },

    save(data, route) {
      $.ajax({
        url: Drupal.url(`unig/${route}`),
        type: "POST",
        data: {
          data
        },
        dataType: "json",
        success(results) {
          Drupal.behaviors.unig.showMessages(results);
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
        .then(json => {
          // Set message to ajax container
          Drupal.behaviors.unig.showMessages(json.messages);

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

    editFile(nid, field) {
      console.log(`Edit File ${field}`, nid);

      // Elems
      const elemDefault = document.querySelector(
        `.unig-file-${field}-default-${nid}`
      );
      const elemEdit = document.querySelector(
        `.unig-file-${field}-edit-${nid}`
      );
      const elemInput = document.getElementById(
        `unig-file-${field}-edit-input-${nid}`
      );

      // change Display to Edit
      elemDefault.setAttribute("style", "display:none");
      elemEdit.setAttribute("style", "display:block");

      // set Focus on input
      elemInput.focus();
      elemInput.select();

      // listen to blur
      elemInput.addEventListener("blur", () => {
        // change Display to Default
        elemEdit.setAttribute("style", "display:none");
        elemDefault.setAttribute("style", "display:block");

        // Save Changes
        this.safeFile(nid, field);
      });
    },
    /**
     *
     *
     * @param nid
     * @param field
     * @param input
     * @param original
     * @return {Promise<boolean | never>}
     */
    safeFile(nid, field) {
      // Spinner
      const elemSpinner = document.querySelector(
        `.unig-file-${nid} .unig-file-process-spinner`
      );

      // Success
      const elemSuccess = document.querySelector(
        `.unig-file-${nid} .unig-file-process-success`
      );

      // Error
      const elemError = document.querySelector(
        `.unig-file-${nid} .unig-file-process-error`
      );

      // Original
      const elemOriginal = document.querySelector(
        `.unig-file-${nid} .unig-file-${field}-content`
      );

      // Input
      const elemInput = document.getElementById(
        `unig-file-${field}-edit-input-${nid}`
      );

      // Trim Text
      const textOriginal = elemOriginal.textContent.trim();
      const textInput = elemInput.value.trim();

      // compare input and original
      if (textOriginal === textInput) {
      } else {
        // copy new Input to Original
        elemOriginal.innerText = textInput;

        // start Process Spinner
        elemSuccess.setAttribute("style", "display:none");
        elemSpinner.setAttribute("style", "display:block");

        const value = Drupal.checkPlain(textInput);
        const data = {
          nid,
          field,
          value
        };
        const url = `/unig/file/save`;

        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify(data)
        })
          .then(response => response.json())
          .then(response => {
            if (response.status) {

              elemSpinner.setAttribute("style", "display:none");
              elemSuccess.setAttribute("style", "display:block");

              if(field === "description" && value === ""){
                const text = Drupal.t('Beschreibung hinzufügen');
                elemOriginal.innerHTML = `<span class="unig-input-placeholder">${text}</span>`;
              }

            } else {
              elemSpinner.setAttribute("style", "display:none");
              elemError.setAttribute("style", "display:block");

              Drupal.behaviors.unig.setMessage(response.messages, "warning");

              return response.toString();
            }
          })
          .catch(error => {
            elemSpinner.setAttribute("style", "display:none");
            elemError.setAttribute("style", "display:block");

            Drupal.behaviors.unig.setMessage('Save to server faild.', "error");
          });
      }
    },

    editFileTitle(nid) {
      this.editFile(nid, "title");
    },

    editFileDescription(nid) {
      this.editFile(nid, "description");
    },

    attach(context, settings) {
      // onload
      $("*[id^='lightgallery-']").lightGallery({
        selector: ".lightgallery-item"
      });

      const scope = this;

      $("#unig-main", context)
        .once("unigProjectList4634b47")
        .each(() => {
          // Toggle all Keywords
          $(".unig-button-keywords-toggle-all", context).click(() => {
            const $trigger = $(scope);
            if ($trigger.hasClass("active")) {
              scope.toggleAllToolbox("keywords", "hide");
            } else {
              scope.toggleAllToolbox("keywords", "show");
            }
          });

          // Toggle all People
          $(".unig-button-people-toggle-all", context).click(() => {
            const $trigger = $(scope);
            if ($trigger.hasClass("active")) {
              scope.toggleAllToolbox("people", "hide");
            } else {
              scope.toggleAllToolbox("people", "show");
            }
          });

          // Event Handlers
          $(".unig-gallery-preview-wrapper img", context).hover(() => {
            $(scope)
              .parents(".unig-file-edit")
              .toggleClass("active");
          });

          // Rating Down
          $(".unig-file-rating-down-trigger", context).click(event => {
            const nid = scope.getNodeId(event);
            scope.setRating(nid, "down");

            console.log(`${nid}: Down!`);
          });

          // Rating Up
          $(".unig-file-rating-up-trigger", context).click(event => {
            const nid = scope.getNodeId(event);

            scope.setRating(nid, "up");
            // console.log(nid + ': Up!');
          });

          // Toggle Keywords Toolbox
          $(".unig-file-keywords-toolbox-trigger", context).click(event => {
            const name = "keywords";
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
          });

          // Toggle People Toolbox
          $(".unig-file-people-toolbox-trigger", context).click(event => {
            const name = "people";
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
          });

          // Toggle Download Toolbox
          $(".unig-file-download-toolbox-trigger", context).click(event => {
            const name = "download";
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
          });

          // Toggle Options Toolbox
          $(".unig-file-options-toolbox-trigger", context).click(event => {
            const name = "options";
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
          });

          // Set Coverimage to current project
          $(".unig-set-project-cover-trigger", context).click(event => {
            // clear ajax message box
            scope.clearAjaxMessageBox();
            const imageNid = scope.getNodeId(event);
            const projectNid = Drupal.behaviors.unigData.project.nid;
            scope.setProjectCover(projectNid, imageNid);
            // the actual function go via drupal <a href ... >  and "use-ajax"
          });

          // Toggle Meta Info Toolbox
          $(".unig-file-metainfo-toolbox-trigger", context).click(event => {
            const name = "metainfo";
            const nid = scope.getNodeId(event);
            scope.toggleToolbox(nid, name);
          });

          // Close Message Generate Images
          $(".unig-messages-generate-images-close-trigger", context).click(
            () => {
              $(".unig-messages-generate-images").hide();
            }
          );

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

          const projectNid = scope.getProjectNid();

          //  Edit Trigger
          document
            .querySelectorAll(".unig-project-edit-trigger")
            .forEach(elem =>
              elem.addEventListener(
                "click",
                () => {
                  Drupal.behaviors.unigProjectList.toggleEditProject(
                    projectNid
                  );
                },
                false
              )
            );

          //  Save Trigger
          document
            .querySelectorAll(".unig-project-save-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                () => {
                  Drupal.behaviors.unigProjectList.saveProject(projectNid);
                },
                false
              )
            );

          //  Cancel Trigger
          document
            .querySelectorAll(".unig-project-cancel-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                () => {
                  Drupal.behaviors.unigProjectList.resetProject(projectNid);
                },
                false
              )
            );

          //  Delete Project Trigger
          document
            .querySelectorAll(".unig-project-delete-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                () => {
                  Drupal.behaviors.unigProjectList.confirmDeleteProject(
                    projectNid
                  );
                },
                false
              )
            );

          //  Cancel Delete Project Trigger
          document
            .querySelectorAll(".unig-project-delete-cancel-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                () => {
                  Drupal.behaviors.unigProjectList.cancelDeleteProject(
                    projectNid
                  );
                },
                false
              )
            );

          // Open Edit Dialog on dubleclick
          document
            .querySelectorAll(".unig-project-title-trigger", context)
            .forEach(edit =>
              edit.addEventListener(
                "dblclick",
                () => {
                  Drupal.behaviors.unigProjectList.toggleEditProject(
                    projectNid
                  );
                },
                false
              )
            );

          // Edit File Title
          document
            .querySelectorAll(".unig-file-title-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                event => {
                  const nid = scope.getNodeId(event);

                  scope.editFileTitle(nid);
                },
                false
              )
            );

          // Edit File Description
          document
            .querySelectorAll(".unig-file-description-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                event => {
                  const nid = scope.getNodeId(event);

                  scope.editFileDescription(nid);
                },
                false
              )
            );
        });
    }
  };
})(jQuery, Drupal, drupalSettings);
