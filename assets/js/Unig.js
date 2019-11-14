let Unig = {
  cr() {
    Drupal.behaviors.unigOptions.cacheRebuild();
  },
  cc() {
    Drupal.behaviors.unigOptions.cacheClear();
  },
};

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unig = {
    number_files: 0,
    number_files_in_download_list: 0,
    number_files_visible: 0,
    projectName: '',
    messages: [],

    attach(context) {
      $('#unig-main', context)
        .once('unig')
        .each(() => {});
    },

    removeDuplicates(arr) {
      if (arr) {
        return arr.filter((elem, index, self) => index === self.indexOf(elem));
      } else {
        return [];
      }
    },

    changeArrayItemToInt(array) {
      if (Object.prototype.toString.call(array) === '[object Array]') {
        const intArray = [];
        let counter = 0;

        for (counter; array.length > counter; counter++) {
          if (parseInt(array[counter], 10) !== 0) {
            intArray[counter] = parseInt(array[counter], 10);
          }
        }

        return intArray;
      }

      return false;
    },

    cleanArray(array) {
      const intArray = this.changeArrayItemToInt(array);
      const removeDuplicates = this.removeDuplicates(intArray);
      return this.changeArrayItemToInt(removeDuplicates);
    },

    getFileId(event) {
      const $elem = $(event.target).parents('.unig-file-item');
      return $elem.data('unig-file-id');
    },

    humanFile_size(size) {
      // https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
      const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
      //      return `${(size / Math.pow(1024, i)).toFixed(2) * 1} ${

      return `${(size / 1024 ** i).toFixed(2) * 1} ${
        ['B', 'kB', 'MB', 'GB', 'TB'][i]
      }`;
    },
  };
})(jQuery, Drupal, drupalSettings);
