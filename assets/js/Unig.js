/* eslint-disable prettier/prettier */
/**
 * Created by ost on 14.05.17.
 */

(function ($, Drupal, drupalSettings) {
    Drupal.behaviors.unig = {
        number_files: 0,
        number_files_in_download_list: 0,
        number_files_visible: 0,
        projectname: '',

        attach(context, settings) {
            // console.log(' Drupal.behaviors.unig');
        },

        updateGui() {
        },

        removeDuplicates(arr) {
            return arr.filter((elem, index, self) => index == self.indexOf(elem));
        },

        changeArrayItemToInt(array) {
            // console.log('changeArrayItemToInt ', array);

            if (Object.prototype.toString.call(array) === '[object Array]') {
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

        getNodeId(context) {
            const $elem = $(context.target).parents('.unig-file-item');
            return $elem.data('unig-file-nid');
        },

        showMessages(results) {
            const $messageContainer = $('.unig-message-container');

            const prefix = '<ul class="unig-messages">';
            const suffix = '</ul>';
            let elems = '';

            if (results.messages) {
                results.messages.forEach(item => {
                    elems +=
                        `<li class="message-type-${item.type}">` +
                        `<span>item.message</span>` +
                        `<span class="unig-message-close unig-message-close-trigger">` +
                        `<i class="fa fa-times" aria-hidden="true"></i>` +
                        `</span>` +
                        `</li>`;
                });

                const html = prefix + elems + suffix;

                $messageContainer.html(html);
            }
        },
        humanFileSize(size) {
            // https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
            const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
            return `${(size / Math.pow(1024, i)).toFixed(2) * 1} ${
                ['B', 'kB', 'MB', 'GB', 'TB'][i]
                }`;
        }
    };
})(jQuery, Drupal, drupalSettings);
