(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigMessages = {
    messages: [],
    counter: 0,

    removeMessage(messageIndex) {
      Drupal.behaviors.unig.messages.splice(messageIndex, 1);
      this.updateMessageList();
    },

    removeMessageByID(id) {
      const messages = Drupal.behaviors.unig.messages;

      const new_messages = messages.filter(message => message.id !== id);
      Drupal.behaviors.unig.messages = new_messages;
      this.updateMessageList();
    },

    addMessage(text, type = 'info', id = 0, timer = 0) {
      this.counter++;
      const message = { text: text, type: type, id: id, timer: timer };
      Drupal.behaviors.unig.messages.push(message);
      this.updateMessageList();
    },

    updateMessage(text, type, id = 0, timer = 0) {
      if ($(`.unig-message-item-id-${id}`).length > 0) {
        const icon = this.getIcon(type);

        const $Icon = $(`.unig-message-item-id-${id} .unig-message-icon`);
        const $Text = $(`.unig-message-item-id-${id} .unig-message-text`);
        const $Timer = $(`.unig-message-item-id-${id} .unig-message-timer`);

        $Icon.removeClass();
        $Icon.addClass('unig-message-icon ' + type);
        $Icon.html(icon);
        $Text.html(text);

        if (timer) {
          const timerText = `Duration: <span class="unig-message-timer-value">${timer}</span>`;
          $Timer.html(timerText);
          $Timer.show();
        } else {
          $Timer.hide();

        }


      } else {
        this.removeMessageByID(id);
        this.addMessage(text, type, id);
      }
    },

    getIcon(type) {
      let icon = '';
      switch (type) {
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
        case 'load':
          icon = '<i class="fas fa-cog fa-spin"></i>';
          break;
        case 'favorite':
          icon = '<i class="fas fa-heart"></i>';
          break;
        default:
          icon = '';
          break;
      }
      return icon;
    },


    clear() {
      Drupal.behaviors.unig.messages = [];
      const $messagesList = $('.unig-messages');
      $messagesList.empty();
    },

    updateMessageList() {
      const { messages } = Drupal.behaviors.unig;

      const $messagesList = $('.unig-messages');

      let content = '';
      let icon = '';
      let messageIndex = 0;

      // clear Dom
      $messagesList.empty();

      if (messages.length > 0) {
        messages.forEach(item => {
          const message = item.text;
          const type = item.type;
          const id = item.id;
          const timer = item.timer;

          const icon = this.getIcon(type);

          content =
            `<span class="unig-message-index">${messageIndex}</span>` +
            `<span class="unig-message-counter">${Drupal.behaviors.unigMessages.counter}</span>` +
            `<span class="unig-message-id">${id}</span>` +
            `<span class="unig-message-icon">${icon}</span>` +
            `<span class="unig-message-text">${message}</span>`;

          if (timer) {
            content += `<span class="unig-message-timer">Duration: <span class="unig-message-timer-value">${timer}</span></span>`;
          } else {
            content += `<span class="unig-message-timer" style="display: none"></span>`;
          }

          // li
          const messageElem = document.createElement('li');
          messageElem.classList.add(`unig-message-type-${type}`);
          messageElem.classList.add(`unig-message-item-id-${id}`);
          messageElem.innerHTML = content;

          // close button
          const closeButton = document.createElement('span');
          closeButton.classList.add(
            'unig-button-icon-info',
            'unig-message-button-close',
            'unig-message-close-trigger',
          );
          closeButton.setAttribute('role', 'button');
          closeButton.setAttribute('data-message-index', messageIndex);
          closeButton.innerHTML =
            '<i class="fas fa-times" aria-hidden="true"></i>';
          closeButton.addEventListener('click', event => {
            this.removeMessage(event, messageIndex);
          });
          // add button to li
          messageElem.appendChild(closeButton);

          // Add new Node to List
          $messagesList.append(messageElem);
          messageIndex += 1;
        });
      }
    },
  };
})(jQuery, Drupal, drupalSettings);
