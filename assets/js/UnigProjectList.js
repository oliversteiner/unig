/* eslint-disable prettier/prettier */
(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProjectList = {
    projectEditOpen: false,

    toggleEditProject(projectNid) {
      if (this.projectEditOpen) {
        this.closeProjectEdit(projectNid);
      } else {
        this.openProjectEdit(projectNid);
      }
    },

    confirmDeleteProject(projectNid) {
      // Show Confirm Dialog
      document
        .querySelector(`.unig-project-delete-confirm-${projectNid}`)
        .setAttribute("style", "display:block");

      // Hide Delete Button
      document
        .querySelector(`.unig-button-project-delete-${projectNid}`)
        .setAttribute("style", "display:none");
    },

    cancelDeleteProject(projectNid) {
      // Show Confirm Dialog
      document
        .querySelector(`.unig-project-delete-confirm-${projectNid}`)
        .setAttribute("style", "display:none");

      // Hide Delete Button
      document
        .querySelector(`.unig-button-project-delete-${projectNid}`)
        .setAttribute("style", "display:block");
    },
    /**
     *
     *
     * @param context
     */
    saveProject(projectNid) {
      const elemProcessIndicator = document.querySelector(
        `.unig-project-process-saving-${projectNid}`
      );

      // start Process Indicator
      elemProcessIndicator.setAttribute("style", "display:inline-block");

      const title = $(`#edit-unig-project-title-${projectNid}`).val();
      const date = $(`#edit-unig-project-date-${projectNid}`).val();
      const weight = $(`#edit-unig-project-weight-${projectNid}`).val();
      const description = $(
        `#edit-unig-project-description-${projectNid}`
      ).val();
      const copyright = $(`#edit-unig-project-copyright-${projectNid}`).val();

      const privStatus = $(`#edit-unig-project-private-${projectNid}`).is(
        ":checked"
      );
      const priv = Number(privStatus);

      const data = {
        title,
        date,
        weight,
        description,
        private: priv,
        copyright
      };

      // console.log('privat ', privStatus);

      $.ajax({
        url: Drupal.url("unig/project/save"),
        type: "POST",
        data: {
          project_nid: projectNid,
          data
        },
        dataType: "json",
        success(results) {
          console.log(results);

          // Private
          const $elemPrivat = $(`#unig-project-private-${projectNid}`);

          // Title
          document
            .querySelectorAll(`.unig-project-title-${projectNid}`)
            .forEach(elem => {
              elem.textContent = results.data.title;
            });

          // Weight
          document
            .querySelectorAll(`.unig-project-weight-${projectNid}`)
            .forEach(elem => {
              elem.textContent = results.data.weight;
            });

          // Description
          document
            .querySelectorAll(`.unig-project-description-${projectNid}`)
            .forEach(elem => {
              elem.textContent = results.data.description;
            });

          // Copyright
          document
            .querySelectorAll(`.unig-project-copyright-${projectNid}`)
            .forEach(elem => {
              elem.textContent = results.data.copyright;
            });

          // Date
          const formatedDate = $.datepicker.formatDate(
            "d. MM yy",
            new Date(results.data.date)
          );

          document
            .querySelectorAll(`.unig-project-date-${projectNid}`)
            .forEach(elem => {
              elem.textContent = formatedDate;
            });

          // Private

          const elemsText = document.querySelectorAll(
            `.unig-project-private-${projectNid}`
          );
          const elemsContainer = document.querySelectorAll(
            `.unig-project-${projectNid}.unig-project-private-status`
          );

          // WTF JS!
          if (results.data.private === "0") {
            elemsText.forEach(elem => {
              elem.textContent = "";
            });

            elemsContainer.forEach(elem => {
              elem.classList.remove("private");
            });
          } else {
            elemsText.forEach(elem => {
              elem.textContent = "(Privat)";
            });

            elemsContainer.forEach(elem => {
              elem.classList.add("private");
            });
          }

          // END Process
          elemProcessIndicator.setAttribute("style", "display:none");

          // Close Editor
          Drupal.behaviors.unigProjectList.closeProjectEdit(projectNid);
        }
      });
    },

    /**
     *
     *
     * @param context
     */

    resetProject(projectNid) {
      this.toggleEditProject(projectNid);
    },

    getProjectNid(event) {
      const $elem = $(event.target).parents(".unig-project-nid");
      console.log("getProjectNid", $elem);

      const nid = $elem.data("unig-project-nid");
      return nid;
    },

    openProjectEdit(projectNid) {
      console.log("openProjectEdit", projectNid);


// Buttons
      document
        .querySelector(`.unig-button-project-edit-open-${projectNid}`)
        .setAttribute("style", "display:none");

      document
        .querySelector(`.unig-button-project-edit-close-${projectNid}`)
        .setAttribute("style", "display:block");


// Seiten
      const wrapper = document.querySelector(`.animate-container-${projectNid}`);
      const front =   document.querySelector(`.unig-project-normal-container-${projectNid}`);
      const back =   document.querySelector(`.unig-project-edit-container-${projectNid}`);


      // Front
      front.setAttribute("style", "display:none");

      // Back
      back.setAttribute("style", "display:block");

      // wrapper
      wrapper.classList.add('fast-fade-in');

      this.projectEditOpen = true;
    },

    closeProjectEdit(projectNid) {
      console.log("closeProjectEdit", projectNid);
// Buttons
      document
        .querySelector(`.unig-button-project-edit-open-${projectNid}`)
        .setAttribute("style", "display:block");

      document
        .querySelector(`.unig-button-project-edit-close-${projectNid}`)
        .setAttribute("style", "display:none");


// Seiten
      const wrapper = document.querySelector(`.animate-container-${projectNid}`);
      const front =   document.querySelector(`.unig-project-normal-container-${projectNid}`);
      const back =   document.querySelector(`.unig-project-edit-container-${projectNid}`);


      // Front
      front.setAttribute("style", "display:block");

      // Back
      back.setAttribute("style", "display:none");

      // wrapper
      wrapper.classList.remove('fast-fade-in');

      this.projectEditOpen = false;
    },

    attach(context, settings) {
      console.log("Drupal.behaviors.unigProjectList");

      //  Save Trigger
      document
        .querySelectorAll(".unig-project-save-trigger", context)
        .forEach(elem =>
          elem.addEventListener(
            "click",
            event => {
              const projectNid = this.getProjectNid(event);
              this.saveProject(projectNid);
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
            event => {
              const projectNid = this.getProjectNid(event);
              this.resetProject(projectNid);
            },
            false
          )
        );

      //  Edit Trigger
      document
        .querySelectorAll(".unig-project-edit-trigger", context)
        .forEach(elem =>
          elem.addEventListener(
            "click",
            event => {
              const projectNid = this.getProjectNid(event);
              console.log("click", projectNid);

              this.toggleEditProject(projectNid);
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
            event => {
              const projectNid = this.getProjectNid(event);

              this.confirmDeleteProject(projectNid);
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
            event => {
              const projectNid = this.getProjectNid(event);
              this.cancelDeleteProject(projectNid);
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
            event => {
              const projectNid = this.getProjectNid(event);
              console.log("dblclick", event);

              this.toggleEditProject(projectNid);
            },
            false
          )
        );
    }
  };
})(jQuery, Drupal, drupalSettings);
