/* eslint-disable prettier/prettier */

(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.unigMessages = {
    messages: [],

    attach(context, settings) {
      $('#unig-main', context)
        .once('unigMessages')
        .each(() => {
          const scope = this;

          // Message box
          this.observeList();

          // Message Close Trigger
          document
            .querySelectorAll('.unig-message-close-trigger', context)
            .forEach(elem => {
              elem.addEventListener('click', event => {
                scope.closeMessage(event);
              });
            });
        });
    },

    observeList() {
      // Select the node that will be observed for mutations
      const targetNode = document.querySelector('.unig-messages');

      // Options for the observer (which mutations to observe)
      const config = {childList: true};

      // Callback function to execute when mutations are observed
      const callback = mutationsList => {
        // Check for changes
        if (mutationsList[0].type === 'childList') {
          if (targetNode.childElementCount === 0) {
            // add Class "active"
            targetNode.classList.remove('active');
          } else {
            // Remove Class "active"
            targetNode.classList.add('active');
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

    close(event) {
      // Target
      const elem = event.target.parentElement;

      // Effect
      elem.classList.add('slide-out-blurred-top');

      // remove Node
      setTimeout(() => {
        elem.parentNode.removeChild(elem);
      }, 400);
    },

    set(text, type) {
      let message = [];

      if (Array.isArray(text)) {
        message = text;
      } else {
        message = [text, type];
      }
      Drupal.behaviors.unig.messages.push(message);
      this.show(Drupal.behaviors.unig.messages);
    },

    show(messages) {
      const messagesList = document.querySelectorAll('.unig-messages');

      let content = '';
      let icon = '';

      if (messages.length > 0) {
        messages.forEach(item => {
          const type = item[1];
          const message = item[0];

          switch (item[1]) {
            case 'info':
              icon = '<i class="fas fa-info-circle"></i>';
              break;
            case 'success':
              icon = '<i class="fas fa-check"></i>';
              break;
            case 'warning':
              icon = '<i class="fas fa-exclamation-triangle"></i>';
              break;
            case 'error':
              icon = '<i class="fas fa-exclamation-circle"></i>';
              break;
            default:
              icon = '';
              break;
          }

          content +=
            `<span class="unig-message-icon">${icon}</span>` +
            `<span class="unig-message-text">${message}</span>`;

          // li
          const messageElem = document.createElement('li');
          messageElem.classList.add(`unig-message-type-${type}`);
          messageElem.innerHTML = content;

          // close button
          const closeButton = document.createElement('span');
          closeButton.classList.add(
            'unig-button-icon-info',
            'unig-message-button-close',
            'unig-message-close-trigger'
          );
          closeButton.setAttribute('role', 'button');
          closeButton.innerHTML =
            '<i class="fa fa-times" aria-hidden="true"></i>';
          closeButton.addEventListener('click', event => {
            this.closeMessage(event);
          });
          // add button to li
          messageElem.appendChild(closeButton);

          // Add new Node to List
          messagesList.forEach(elem => {
            elem.appendChild(messageElem);
          });
        });
      }
    }
  };
})(jQuery, Drupal, drupalSettings);
