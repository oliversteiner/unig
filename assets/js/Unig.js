/* eslint-disable prettier/prettier */

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unig = {
    number_files: 0,
    number_files_in_download_list: 0,
    number_files_visible: 0,
    projectName: "",
    messages: [],

    attach(context) {
      // console.log(' Drupal.behaviors.unig');
      $("#unig-main", context)
        .once("unig")
        .each(() => {});
    },

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

    humanFile_size(size) {
      // https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
      const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
      //      return `${(size / Math.pow(1024, i)).toFixed(2) * 1} ${

      return `${(size / 1024 ** i).toFixed(2) * 1} ${
        ["B", "kB", "MB", "GB", "TB"][i]
      }`;
    }
  };
})(jQuery, Drupal, drupalSettings);
