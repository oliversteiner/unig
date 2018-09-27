/* eslint-disable prettier/prettier */
/**
 * Created by ost on 14.05.17.
 */

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unig = {
    number_files: 0,
    number_files_in_download_list: 0,
    number_files_visible: 0,
    projectname: "",

    attach(context, settings) {
      // console.log(' Drupal.behaviors.unig');
      $("#unig-main", context)
        .once("unig9043twjrdfhjg")
        .each(() => {
          const scope = this;
          // Message Close Trigger
          document
            .querySelectorAll(".unig-message-close-trigger", context)
            .forEach(elem => {
              elem.addEventListener("click", event => {
                scope.closeMessage(event);
              });
            });

          // Message box
          scope.checkMessagebox();
        });
    },

    checkMessagebox() {
      // Select the node that will be observed for mutations
      const targetNode = document.querySelector(".unig-messages");

      // Options for the observer (which mutations to observe)
      const config = { childList: true };

      // Callback function to execute when mutations are observed
      const callback = mutationsList => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
            if (targetNode.childElementCount === 0) {
              targetNode.classList.remove("active");
            } else {
              targetNode.classList.add("active");
            }
          }
        }
      };

      // Create an observer instance linked to the callback function
      const observer = new MutationObserver(callback);

      // Start observing the target node for configured mutations
      observer.observe(targetNode, config);

      // Later, you can stop observing
      //   observer.disconnect();
    },

    closeMessage(event) {
      console.log("event", event.target);

      const elem = event.target.parentElement;

      elem.classList.add("slide-out-blurred-top");
      setTimeout(() => {
        elem.parentNode.removeChild(elem);
      }, 500);
    },
    updateGui() {},

    removeDuplicates(arr) {
      return arr.filter((elem, index, self) => index == self.indexOf(elem));
    },

    changeArrayItemToInt(array) {
      // console.log('changeArrayItemToInt ', array);

      if (Object.prototype.toString.call(array) === "[object Array]") {
        const int_array = [];
        let counter = 0;

        for (counter; array.length > counter; counter++) {
          if (parseInt(array[counter]) !== 0) {
            int_array[counter] = parseInt(array[counter]);
          }
        }

        return int_array;
      }
      // console.log('in not Array ');

      return false;
    },

    cleanArray(array) {
      // console.log('cleanArray:input ', array);

      const int_array = this.changeArrayItemToInt(array);
      const no_dublicates_array = this.removeDuplicates(int_array);
      const clean_array = this.changeArrayItemToInt(no_dublicates_array);

      // console.log('clean_array ', clean_array);

      return clean_array;
    },

    getNodeId(event) {
      const $elem = $(event.target).parents(".unig-file-item");
      const nid = $elem.data("unig-file-nid");
      return nid;
    },

    showMessages(messages) {
      const messagesContainer = document.querySelectorAll(
        ".unig-messages-container"
      );

      const prefix = '<ul class="unig-messages">';
      const suffix = "</ul>";
      let elems = "";
      let icon = "";

      if (messages.length > 0) {
        messages.forEach(item => {
          const type = item[1];
          const message = item[0];

          switch (item[1]) {
            case "info":
              icon = '<i class="fas fa-info-circle"></i>';
              break;
            case "success":
              icon = '<i class="fas fa-check"></i>';
              break;
            case "warning":
              icon = '<i class="fas fa-exclamation-triangle"></i>';
              break;
            case "error":
              icon = '<i class="fas fa-exclamation-circle"></i>';
              break;
            default:
              icon = "";
              break;
          }

          elems +=
            `<li class="unig-message-type-${type}">` +
            `<span class="unig-message-icon">${icon}</span>` +
            `<span class="unig-message-text">${message}</span>` +
            `<span  role="button"  class="unig-button-icon-info unig-message-button-close unig-message-close-trigger">` +
            `<i class="fa fa-times" aria-hidden="true"></i>` +
            `</span>` +
            `</li>`;
        });

        const html = prefix + elems + suffix;

        messagesContainer.forEach(elem => {
          elem.innerHTML = html;
        });
      }
    },
    humanFileSize(size) {
      // https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
      const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
      return `${(size / Math.pow(1024, i)).toFixed(2) * 1} ${
        ["B", "kB", "MB", "GB", "TB"][i]
      }`;
    }
  };
})(jQuery, Drupal, drupalSettings);
