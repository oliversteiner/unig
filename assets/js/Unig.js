/* eslint-disable prettier/prettier */

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unig = {
    number_files: 0,
    number_files_in_download_list: 0,
    number_files_visible: 0,
    projectName: "",

    attach(context, settings) {
      // console.log(' Drupal.behaviors.unig');
      $("#unig-main", context)
        .once("unig9043twjrdfhjg")
        .each(() => {
          const scope = this;

          // Message box
          this.checkMessagebox();

          // Message Close Trigger
          document
            .querySelectorAll(".unig-message-close-trigger", context)
            .forEach(elem => {
              elem.addEventListener("click", event => {
                scope.closeMessage(event);
              });
            });
        });
    },

    checkMessagebox() {
      // Select the node that will be observed for mutations
      const targetNode = document.querySelector(".unig-messages");

      // Options for the observer (which mutations to observe)
      const config = { childList: true };

      // Callback function to execute when mutations are observed
      const callback = mutationsList => {
        // Check for changes
        if (mutationsList[0].type === "childList") {
          if (targetNode.childElementCount === 0) {
            // add Class "active"
            targetNode.classList.remove("active");
          } else {
            // Remove Class "active"
            targetNode.classList.add("active");
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
      // Target
      const elem = event.target.parentElement;

      // Effect
      elem.classList.add("slide-out-blurred-top");

      // remove Node
      setTimeout(() => {
        elem.parentNode.removeChild(elem);
      }, 500);
    },

    updateGui() {},

    removeDuplicates(arr) {
      return arr.filter((elem, index, self) => index === self.indexOf(elem));
    },

    changeArrayItemToInt(array) {
      // console.log('changeArrayItemToInt ', array);

      if (Object.prototype.toString.call(array) === "[object Array]") {
        const intArray = [];
        let counter = 0;

        for (counter; array.length > counter; counter++) {
          if (parseInt(array[counter], 10) !== 0) {
            intArray[counter] = parseInt(array[counter], 10);
          }
        }

        return intArray;
      }
      // console.log('in not Array ');

      return false;
    },

    cleanArray(array) {
      // console.log('cleanArray:input ', array);

      const intArray = this.changeArrayItemToInt(array);
      const NoDublicatesArray = this.removeDuplicates(intArray);
      const CleanArray = this.changeArrayItemToInt(NoDublicatesArray);

      // console.log('clean_array ', clean_array);

      return CleanArray;
    },

    getNodeId(event) {
      const $elem = $(event.target).parents(".unig-file-item");
      const nid = $elem.data("unig-file-nid");
      return nid;
    },

    showMessages(messages) {
      const messagesList = document.querySelectorAll(".unig-messages");

      let content = "";
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

          content +=
            `<span class="unig-message-icon">${icon}</span>` +
            `<span class="unig-message-text">${message}</span>` +
            `<span  role="button"  class="">` +
            `` +
            `</span>`;

          // li
          const messageElem = document.createElement("li");
          messageElem.classList.add(`unig-message-type-${type}`);
          messageElem.innerHTML = content;

          // close button
          const closeButton = document.createElement("span");
          closeButton.classList.add(
            "unig-button-icon-info",
            "unig-message-button-close",
            "unig-message-close-trigger"
          );
          closeButton.setAttribute("role", "button");
          closeButton.innerHTML =
            '<i class="fa fa-times" aria-hidden="true"></i>';
          closeButton.addEventListener("click", event => {
            this.closeMessage(event);
          });
          // add button to li
          messageElem.appendChild(closeButton);

          // Add new Node to List
          messagesList.forEach(elem => {
            console.log("messagesContainer", messagesList);

            elem.appendChild(messageElem);
          });
        });
      }
    },
    humanFileSize(size) {
      // https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
      const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
      //      return `${(size / Math.pow(1024, i)).toFixed(2) * 1} ${

      return `${(size / 1024 ** i).toFixed(2) * 1} ${
        ["B", "kB", "MB", "GB", "TB"][i]
      }`;
    }
  };
})(jQuery, Drupal, drupalSettings);
