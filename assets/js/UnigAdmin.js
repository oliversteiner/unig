/* eslint-disable prettier/prettier */
/**
 * Created by ost on 14.05.17.
 */

const UnigProcess = {
  nid: "",
  mode: "file",
  elemSpinner: null,
  elemSuccess: null,
  elemError: null,
  init(nid, mode) {
    // Spinner
    this.elemSpinner = document.querySelector(
      `.unig-${mode}-${nid} .unig-process-spinner`
    );

    // Success
    this.elemSuccess = document.querySelector(
      `.unig-${mode}-${nid} .unig-process-success`
    );

    // Error
    this.elemError = document.querySelector(
      `.unig-${mode}-${nid} .unig-process-error`
    );
  },
  start(nid, mode) {
    this.init(nid, mode);

    this.elemSpinner.setAttribute("style", "display:block");
    this.elemSuccess.setAttribute("style", "display:none");
  },
  success() {
    this.elemSpinner.setAttribute("style", "display:none");
    this.elemSuccess.setAttribute("style", "display:block");
  },
  error() {
    this.elemSpinner.setAttribute("style", "display:none");
    this.elemError.setAttribute("style", "display:block");
  }
};

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigAdmin = {
    attach(context, settings) {
      console.log("Drupal.behaviors.unigAdmin");

      // Theme - Default
      $(".unig-theme-dark-trigger", context).click(() => {
        Drupal.behaviors.unigAdmin.changeTheme("dark");
        $(".unig-button-theme-dark", context).toggle();
        $(".unig-button-theme-default", context).toggle();
      });

      //  Theme - Dark
      $(".unig-theme-default-trigger", context).click(() => {
        Drupal.behaviors.unigAdmin.changeTheme("bright");
        $(".unig-button-theme-dark", context).toggle();
        $(".unig-button-theme-default", context).toggle();
      });
    },

    changeTheme(theme) {
      const classPrefix = "unig-theme-";
      const themeName = classPrefix + theme;

      const $main = $("#unig-main");
      const pattern = /\bunig-theme-\S+/g;
      // remove other Theme classes
      const matches = $main.attr("class").match(pattern);
      $.each(matches, function() {
        const className = this;
        $main.removeClass(className.toString());
      });

      // Add new Theme Class
      $main.addClass(themeName);
    },

    saveThemeToLocalStorage() {
      return true;
    },

    edit(nid, field, mode) {
      console.log(`Edit`, `${mode} - ${field}- ${nid}`);

      const elemRootClassName = `unig-${mode}-${field}-${nid}`;
      // Elems`
      const elemTrigger = document.querySelector(
        `.${elemRootClassName} .unig-edit-trigger`
      );
      const elemEdit = document.querySelector(
        `.${elemRootClassName} .unig-edit-input`
      );
      const elemInput = document.getElementById(`${elemRootClassName}-input`);

      // change Display to Edit
      elemTrigger.setAttribute("style", "display:none");
      elemEdit.setAttribute("style", "display:block");

      // set Focus on input
      elemInput.focus();
      elemInput.select();

      // listen to blur
      elemInput.addEventListener("blur", () => {
        // change Display to Default
        elemEdit.setAttribute("style", "display:none");
        elemTrigger.setAttribute("style", "display:block");

        // Save Changes
        this.save(nid, field, mode);
      });
    },

    togglePrivat(nid) {
      const field = "private";
      const mode = "project";

      // Root
      const elemRoot = document.querySelector(`.unig-${mode}-${nid}`);

      // Private
      const elemPrivate = document.querySelector(
        `.unig-${mode}-${nid} .unig-${mode}-private`
      );

      // Public
      const elemPublic = document.querySelector(
        `.unig-${mode}-${nid} .unig-${mode}-public`
      );

      // Start process spinner
      const process = UnigProcess;
      process.start(nid, mode);

      const data = {
        nid,
        field
      };
      const url = `/unig/save`;

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
            process.success();

            console.log("Private", response.data[1]);

            if (response.data[1]) {
              // set To Private
              elemPrivate.setAttribute("style", "display:block");
              elemPublic.setAttribute("style", "display:none");

              // add "private" class
              elemRoot.classList.add("private");
            } else {
              // set To Public

              elemPrivate.setAttribute("style", "display:none");
              elemPublic.setAttribute("style", "display:block");

              // remove "private" class
              elemRoot.classList.remove("private");
            }
          } else {
            process.error();

            // build Error Message
            const message = response.messages;
            const type = "warning";
            Drupal.behaviors.unigMessage.set(message, type);

            return response.json();
          }
        })
        .catch(() => {
          process.error();

          const message = Drupal.t("Save to server failed.");
          const type = "error";
          Drupal.behaviors.unigMessage.set(message, type);
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
    save(nid, field, mode) {
      const elemRootClassName = `unig-${mode}-${field}-${nid}`;

      // Error
      const elemError = document.querySelector(
        `.unig-${mode}-${nid} .unig-process-error`
      );

      // Original
      const elemOriginal = document.querySelector(
        `.${elemRootClassName} .unig-edit-content`
      );

      // Input
      const elemInput = document.getElementById(`${elemRootClassName}-input`);

      // Trim Text
      const textOriginal = elemOriginal.textContent.trim();
      const textInput = elemInput.value.trim();

      // compare input and original
      if (textOriginal !== textInput) {
        if (field === "date") {
          const date = new Date(textInput);
          const locales = window.navigator.language;
          const options = { year: "numeric", month: "long", day: "numeric" };

          elemOriginal.innerText = date.toLocaleDateString(locales, options);
        } else {
          // copy new Input to Original
          elemOriginal.innerText = textInput;
        }

        // Start Process Spinner
        const process = UnigProcess;
        process.start(nid, mode);

        const value = Drupal.checkPlain(textInput);
        const data = {
          nid,
          field,
          value
        };
        const url = `/unig/save`;

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
              process.success();

              // Description
              if (field === "description" && value === "") {
                const text = Drupal.t("Add description");
                elemOriginal.innerHTML = `<span class="unig-input-placeholder">${text}</span>`;
              }
              // Copyright
              if (field === "copyright" && value === "") {
                const text = Drupal.t("Add copyright");
                elemOriginal.innerHTML = `<span class="unig-input-placeholder">${text}</span>`;
              }

              // Private
              if (field === "private") {
                console.log("Privat", response.data.private);
              }
            } else {
              process.error();

              const message = response.messages;
              const type = "warning";
              Drupal.behaviors.unigMessage.set(message, type);

              return response.json();
            }
          })
          .catch(() => {
            process.error();

            const message = Drupal.t("Save to server failed.");
            const type = "error";
            Drupal.behaviors.unigMessage.set(message, type);
          });
      }
    }
  };
})(jQuery, Drupal, drupalSettings);
