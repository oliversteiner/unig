/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unig = {
    attach:
        function (context, settings) {
          // console.log(' Drupal.behaviors.unig');

        },

    removeDuplicates:
        function (arr) {
          return arr.filter(function (elem, index, self) {
            return index == self.indexOf(elem);
          })

        },

    changeArrayItemToInt:
        function (array) {
          // console.log('changeArrayItemToInt ', array);

          if (Object.prototype.toString.call(array) === '[object Array]') {

            var int_array = [];
            var counter = 0;
            array.forEach(function (item) {

              if (parseInt(item) !== 0) {
                int_array[counter] = parseInt(item);
                counter++;
              }

            });
            return int_array;
          }
          else {
            // console.log('in not Array ');

            return false;
          }
        },

    cleanArray:
        function (array) {
          // console.log('cleanArray:input ', array);


          var int_array = this.changeArrayItemToInt(array);
          var no_dublicates_array = this.removeDuplicates(int_array);
          var clean_array = this.changeArrayItemToInt(no_dublicates_array);

          // console.log('clean_array ', clean_array);

          return clean_array;
        },


    getNodeId:
        function (context) {

          var $elem = $(context.target).parents(".unig-file-item");
          return $elem.data('unig-file-nid');
        }

  };

})(jQuery, Drupal, drupalSettings);


