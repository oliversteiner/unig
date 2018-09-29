/* eslint-disable prettier/prettier */
/**
 * Created by ost on 14.05.17.
 */

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
      console.log(`Edit - ${mode} - ${field}`, nid);

      const elemRootClassName = `unig-${mode}-${field}-${nid}`;
      // Elems
      const elemTrigger = document.querySelector(
        `.${elemRootClassName} .unig-edit-trigger`
      );
      const elemEdit = document.querySelector(
        `.${elemRootClassName} .unig-edit-input`
      );
      const elemInput = document.getElementById(
        `${elemRootClassName}-input`
      );

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
        this.safe(nid, field, mode);
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
    safe(nid, field, mode) {

      const elemRootClassName = `unig-${mode}-${field}-${nid}`;

      // Spinner
      const elemSpinner = document.querySelector(
        `.unig-${mode}-${nid} .unig-file-process-spinner`
      );

      // Success
      const elemSuccess = document.querySelector(
        `.unig-${mode}-${nid} .unig-file-process-success`
      );

      // Error
      const elemError = document.querySelector(
        `.unig-${mode}-${nid} .unig-file-process-error`
      );

      // Original
      const elemOriginal = document.querySelector(
        `.${elemRootClassName} .unig-edit-content`
      );

      // Input
      const elemInput = document.getElementById(
        `${elemRootClassName}-input`
      );

      // Trim Text
      const textOriginal = elemOriginal.textContent.trim();
      const textInput = elemInput.value.trim();

      // compare input and original
      if (textOriginal !== textInput) {
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
              elemSpinner.setAttribute("style", "display:none");
              elemSuccess.setAttribute("style", "display:block");

              if (field === "description" && value === "") {
                const text = Drupal.t("Add description");
                elemOriginal.innerHTML = `<span class="unig-input-placeholder">${text}</span>`;
              }
            } else {
              elemSpinner.setAttribute("style", "display:none");
              elemError.setAttribute("style", "display:block");

              const message = response.messages;
              const type = "warning";
              Drupal.behaviors.unigMessage.set(message, type);

              return response.json();
            }
          })
          .catch(() => {

            elemSpinner.setAttribute("style", "display:none");
            elemError.setAttribute("style", "display:block");

            const message = Drupal.t("Save to server failed.");
            const type = "error";
            Drupal.behaviors.unigMessage.set(message, type);
          });
      }
    }
  };
})(jQuery, Drupal, drupalSettings);
