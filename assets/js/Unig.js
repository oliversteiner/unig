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

  /**
   * File-IDs in Download List
   *
   * @type {{local_storage_name: string, list: Array, add: Drupal.behaviors.unig.itemsForDownload.add, remove: Drupal.behaviors.unig.itemsForDownload.remove, destroy: Drupal.behaviors.unig.itemsForDownload.destroy, clean: Drupal.behaviors.unig.itemsForDownload.clean, save: Drupal.behaviors.unig.itemsForDownload.save, load: Drupal.behaviors.unig.itemsForDownload.load, get: Drupal.behaviors.unig.itemsForDownload.get, find: Drupal.behaviors.unig.itemsForDownload.find, count: Drupal.behaviors.unig.itemsForDownload.count}}
   */
  Drupal.behaviors.unig.itemsForDownload = {

    local_storage_name: 'unig.itemsForDownload',

    list: [],


    add: function (nid) {
      // console.log('UnigDownloadList - add()', nid);

      var int_nid = parseInt(nid);
      if (int_nid) {
        this.list.push(int_nid);
      }

      // console.log('list ', this.list);

    },

    /**
     * remove from list
     *
     */
    remove:
        function (nid) {
          // console.log('UnigDownloadList - remove()');

          var index = this.list.indexOf(nid);  // indexOf is not supported in
          // IE 7 and 8.
          //remove it
          if (index > -1) {
            this.list.splice(index, 1);
          }
        },

    destroy:
        function () {
          // console.log('itemList - destroy()');
          this.list = [];
        },

    /**
     * remove empty items and dublicates
     * @returns {*}
     */
    clean:
        function () {


          this.list = Drupal.behaviors.unig.cleanArray(this.list);
        },

    /**
     * save to localStorage
     */
    save:
        function () {
          localStorage.setItem(this.local_storage_name, this.list);
        },

    /**
     * load from localStorage
     */
    load:
        function () {
          var local_string = localStorage.getItem(this.local_storage_name);

          if (local_string != null) {

            this.list = local_string.split(',');
            this.clean();
          }
          return true;
        },

    /**
     * returns array or false
     */
    get:
        function () {

          // console.log('get this.count ', this.count());

          if (this.count() > 0) {
            return this.list
          }
          else {
            return false;
          }
        },

    find:
        function (nid) {

          console.log('-find in DownloadList- nid: ' + nid);

          var search = this.list.indexOf(nid);

          console.log('-find in DownloadList- result: ' + search);

          if (search == -1) {
            return false
          }
          else {
            return true;
          }

        },

    /**
     *
     * @returns {number}
     */
    count: function () {
      // console.log('count -list ', this.list);

      // console.log('count - length ', this.list.length);

      return this.list.length;
    }
  };



  /**
   * Files
   *
   * @type {{list: Array, route: string, load: Drupal.behaviors.unig.itemList.load, destroy: Drupal.behaviors.unig.itemList.destroy, get: Drupal.behaviors.unig.itemList.get, set: Drupal.behaviors.unig.itemList.set, count: Drupal.behaviors.unig.itemList.count}}
   */
  Drupal.behaviors.unig.itemList = {

    list : [],
    route: 'unig/project/json',

    load: function () {
      // console.log('itemList - load()');

      // Route : unig/unig.ajax.project
      var project_nid = $('#unig-project-nid').val();

      var data = {
        'project_nid': project_nid,
        'album_nid'  : 0
      };


      return $.ajax({
        url     : Drupal.url(this.route),
        type    : 'POST',
        data    : data,
        dataType: 'json'
      })
          .done(function (result) {
            // console.log('success', result); //  DEVELOP

            Drupal.behaviors.unig.itemList.set(result);
          })
          .fail(function (xhr) {
            // console.log('error', xhr);
          });


    },

    destroy: function () {
      // console.log('itemList - destroy()');
      this.list = [];
    },
    /**
     * returns array or false
     */
    get    : function () {
      if (this.count() > 0) {
        return this.list
      }
      else {
        return false;
      }
    },

    set: function (arr) {
      this.list = arr;
    },

    /**
     *
     * @returns {number}
     */
    count: function () {

      var size = 0, key;
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          size++;
        }
      }
      return size;
    }

  };

  /**
   * Keywords
   *
   * @type {{list: Array, route: string, load: Drupal.behaviors.unig.itemList.load, destroy: Drupal.behaviors.unig.itemList.destroy, get: Drupal.behaviors.unig.itemList.get, set: Drupal.behaviors.unig.itemList.set, count: Drupal.behaviors.unig.itemList.count}}
   */
  Drupal.behaviors.unig.keywordsList = {

    list : [],
    route: 'unig/term/keywords/json',

    load: function () {
      var data = {
      };


      return $.ajax({
        url     : Drupal.url(this.route),
        type    : 'POST',
        data    : data,
        dataType: 'json'
      })
          .done(function (result) {
             console.log('Keywords: success', result); //  DEVELOP

            Drupal.behaviors.unig.keywordsList.set(result);
          })
          .fail(function (xhr) {
             console.log('error', xhr);
          });


    },

    destroy: function () {
      // console.log('itemList - destroy()');
      this.list = [];
    },
    /**
     * returns array or false
     */
    get    : function () {
      if (this.count() > 0) {
        return this.list
      }
      else {
        return false;
      }
    },

    set: function (arr) {
      this.list = arr;
    },

    /**
     *
     * @returns {number}
     */
    count: function () {

      var size = 0, key;
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          size++;
        }
      }
      return size;
    }

  };
  Drupal.behaviors.unig.keywordsStorage = {

    local_storage_name: 'unig.keywords',

    list: [],


    add: function (nid) {
      // console.log('UnigDownloadList - add()', nid);

      var int_nid = parseInt(nid);
      if (int_nid) {
        this.list.push(int_nid);
      }

      // console.log('list ', this.list);

    },

    /**
     * remove from list
     *
     */
    remove:
        function (nid) {
          // console.log('UnigDownloadList - remove()');

          var index = this.list.indexOf(nid);  // indexOf is not supported in
          // IE 7 and 8.
          //remove it
          if (index > -1) {
            this.list.splice(index, 1);
          }
        },

    destroy:
        function () {
          // console.log('itemList - destroy()');
          this.list = [];
        },

    /**
     * remove empty items and dublicates
     * @returns {*}
     */
    clean:
        function () {


          this.list = Drupal.behaviors.unig.cleanArray(this.list);
        },

    /**
     * save to localStorage
     */
    save:
        function () {
          localStorage.setItem(this.local_storage_name, this.list);
        },

    /**
     * load from localStorage
     */
    load:
        function () {
          var local_string = localStorage.getItem(this.local_storage_name);

          if (local_string != null) {

            this.list = local_string.split(',');
            this.clean();
          }
          return true;
        },

    /**
     * returns array or false
     */
    get:
        function () {

          // console.log('get this.count ', this.count());

          if (this.count() > 0) {
            return this.list
          }
          else {
            return false;
          }
        },

    find:
        function (nid) {

          console.log('-find in DownloadList- nid: ' + nid);

          var search = this.list.indexOf(nid);

          console.log('-find in DownloadList- result: ' + search);

          if (search == -1) {
            return false
          }
          else {
            return true;
          }

        },

    /**
     *
     * @returns {number}
     */
    count: function () {
      // console.log('count -list ', this.list);

      // console.log('count - length ', this.list.length);

      return this.list.length;
    }
  };

  Drupal.behaviors.unig.people = {

    list : [],
    route: 'unig/term/people/json',

    load: function () {
      var data = {
      };


      return $.ajax({
        url     : Drupal.url(this.route),
        type    : 'POST',
        data    : data,
        dataType: 'json'
      })
          .done(function (result) {
            console.log('People: success', result); //  DEVELOP

            Drupal.behaviors.unig.keywords.set(result);
          })
          .fail(function (xhr) {
            console.log('error', xhr);
          });


    },

    destroy: function () {
      // console.log('itemList - destroy()');
      this.list = [];
    },
    /**
     * returns array or false
     */
    get    : function () {
      if (this.count() > 0) {
        return this.list
      }
      else {
        return false;
      }
    },

    set: function (arr) {
      this.list = arr;
    },

    /**
     *
     * @returns {number}
     */
    count: function () {

      var size = 0, key;
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          size++;
        }
      }
      return size;
    }

  };
  Drupal.behaviors.unig.peopleStorage = {

    local_storage_name: 'unig.people',

    list: [],


    add: function (nid) {
      // console.log('UnigDownloadList - add()', nid);

      var int_nid = parseInt(nid);
      if (int_nid) {
        this.list.push(int_nid);
      }

      // console.log('list ', this.list);

    },

    /**
     * remove from list
     *
     */
    remove:
        function (nid) {
          // console.log('UnigDownloadList - remove()');

          var index = this.list.indexOf(nid);  // indexOf is not supported in
          // IE 7 and 8.
          //remove it
          if (index > -1) {
            this.list.splice(index, 1);
          }
        },

    destroy:
        function () {
          // console.log('itemList - destroy()');
          this.list = [];
        },

    /**
     * remove empty items and dublicates
     * @returns {*}
     */
    clean:
        function () {


          this.list = Drupal.behaviors.unig.cleanArray(this.list);
        },

    /**
     * save to localStorage
     */
    save:
        function () {
          localStorage.setItem(this.local_storage_name, this.list);
        },

    /**
     * load from localStorage
     */
    load:
        function () {
          var local_string = localStorage.getItem(this.local_storage_name);

          if (local_string != null) {

            this.list = local_string.split(',');
            this.clean();
          }
          return true;
        },

    /**
     * returns array or false
     */
    get:
        function () {

          // console.log('get this.count ', this.count());

          if (this.count() > 0) {
            return this.list
          }
          else {
            return false;
          }
        },

    find:
        function (nid) {

          console.log('-find in DownloadList- nid: ' + nid);

          var search = this.list.indexOf(nid);

          console.log('-find in DownloadList- result: ' + search);

          if (search == -1) {
            return false
          }
          else {
            return true;
          }

        },

    /**
     *
     * @returns {number}
     */
    count: function () {
      // console.log('count -list ', this.list);

      // console.log('count - length ', this.list.length);

      return this.list.length;
    }
  };

  Drupal.behaviors.unig.remote = {

    list : [],
    route: 'unig/',

    load: function () {
      var data = {
      };


      return $.ajax({
        url     : Drupal.url(this.route),
        type    : 'POST',
        data    : data,
        dataType: 'json'
      })
          .done(function (result) {
            console.log('remote: success', result); //  DEVELOP

            Drupal.behaviors.unig.remote.set(result);
          })
          .fail(function (xhr) {
            console.log('error', xhr);
          });


    },

    destroy: function () {
      // console.log('itemList - destroy()');
      this.list = [];
    },
    /**
     * returns array or false
     */
    get    : function () {
      if (this.count() > 0) {
        return this.list
      }
      else {
        return false;
      }
    },

    set: function (arr) {
      this.list = arr;
    },

    /**
     *
     * @returns {number}
     */
    count: function () {

      var size = 0, key;
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          size++;
        }
      }
      return size;
    }

  };
  Drupal.behaviors.unig.local = {

    local_storage_name: 'unig.local',

    list: [],


    add: function (nid) {
      // console.log('UnigDownloadList - add()', nid);

      var int_nid = parseInt(nid);
      if (int_nid) {
        this.list.push(int_nid);
      }

      // console.log('list ', this.list);

    },

    /**
     * remove from list
     *
     */
    remove:
        function (nid) {
          // console.log('UnigDownloadList - remove()');

          var index = this.list.indexOf(nid);  // indexOf is not supported in
          // IE 7 and 8.
          //remove it
          if (index > -1) {
            this.list.splice(index, 1);
          }
        },

    destroy:
        function () {
          // console.log('itemList - destroy()');
          this.list = [];
        },

    /**
     * remove empty items and dublicates
     * @returns {*}
     */
    clean:
        function () {


          this.list = Drupal.behaviors.unig.cleanArray(this.list);
        },

    /**
     * save to localStorage
     */
    save:
        function () {
          localStorage.setItem(this.local_storage_name, this.list);
        },

    /**
     * load from localStorage
     */
    load:
        function () {
          var local_string = localStorage.getItem(this.local_storage_name);

          if (local_string != null) {

            this.list = local_string.split(',');
            this.clean();
          }
          return true;
        },

    /**
     * returns array or false
     */
    get:
        function () {

          // console.log('get this.count ', this.count());

          if (this.count() > 0) {
            return this.list
          }
          else {
            return false;
          }
        },

    find:
        function (nid) {

          console.log('-find in DownloadList- nid: ' + nid);

          var search = this.list.indexOf(nid);

          console.log('-find in DownloadList- result: ' + search);

          if (search == -1) {
            return false
          }
          else {
            return true;
          }

        },

    /**
     *
     * @returns {number}
     */
    count: function () {
      // console.log('count -list ', this.list);

      // console.log('count - length ', this.list.length);

      return this.list.length;
    }
  };



})(jQuery, Drupal, drupalSettings);


