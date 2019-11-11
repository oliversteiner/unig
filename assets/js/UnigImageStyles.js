let ImageStylesWorker = {unig_sd:{},unig_hd:{},unig_thumbnail:{}};

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigImageStyles = {
    project: {},
    files: [],
    messageID: 'generate-images',

    messageFromWorkerToUnig(data) {

      // Command
      if (data.hasOwnProperty('command')) {
        this.command(data.command, data.style, data.data);
      }

      // Message
      if (data.hasOwnProperty('message')) {
        const type = data.message.type;
        const text = data.message.text;
        const mode = data.mode;
        const messageID = data.message.messageID;

        if (mode === 'remove') {
          Drupal.behaviors.unigMessages.removeMessageByID(messageID);
        } else {
          Drupal.behaviors.unigMessages.updateMessage(text, type, messageID);
        }
      }
    },

    command(text, style, data) {
      switch (text) {
        case 'stop':
          this.stopWorker(style);
          break;
        default:
          console.warn('Command from ImageStylesWorker not recognised', text);
          break;
      }
    },

    startWorker(style) {
      let text = 'Start Worker...';
      let type = 'load';
      console.log(text);
      Drupal.behaviors.unigMessages.updateMessage(text, type, this.messageID);

      if (typeof Worker !== 'undefined') {
        if (typeof worker == 'undefined') {
/*          ImageStylesWorker[style] = new Worker(
            'https://drullo.local/modules/custom/unig/assets/js/workerStyles.js',
          );*/
          const path = drupalSettings.unig.path;
          console.log('path', path);
          ImageStylesWorker[style] = new Worker(path + '/assets/js/workerStyles.js');

          // wait 1 Sec before starting Worker
          setTimeout(() => {
            const data = { files:drupalSettings.unig.project.files, style:style};
            ImageStylesWorker[style] .postMessage(data);
          }, 1000);
        }
        ImageStylesWorker[style] .onmessage = function(event) {
          Drupal.behaviors.unigMessages.updateMessage(
            'Worker is working.',
            type,
            Drupal.behaviors.unigImageStyles.messageID,
          );
          Drupal.behaviors.unigImageStyles.messageFromWorkerToUnig(event.data);
        };
      } else {
        const type = 'warning';
        const text = 'Sorry! No Web Worker support.';
        Drupal.behaviors.unigMessages.updateMessage(text, type, this.messageID);
      }
    },

    stopWorker(style) {
      let message = 'Stopping Worker...';
      console.log(message);

      Drupal.behaviors.unigOptions.$StartTrigger.show();
      Drupal.behaviors.unigOptions.$StopTrigger.hide();

      if (typeof ImageStylesWorker[style] === 'undefined') {
        console.log('No active Worker found');
      } else {
        ImageStylesWorker[style].terminate();
        ImageStylesWorker[style]  = undefined;
      }

      if (typeof ImageStylesWorker[style] === 'undefined') {
        message = 'Worker Stopped, all Styles generated';
        console.log(message);
        Drupal.behaviors.unigMessages.updateMessage(
          message,
          'success',
          this.messageID,
        );
      } else {
        message = "Can't stop Worker";
        console.error(message);
        Drupal.behaviors.unigMessages.updateMessage(
          message,
          'error',
          this.messageID,
        );
      }
    },

    attach(context) {
      $('#unig-main', context)
        .once('unig-image-styles')
        .each(() => {
          console.log('unigImageStyles loaded');

        });
    },
  };
})(jQuery, Drupal, drupalSettings);
