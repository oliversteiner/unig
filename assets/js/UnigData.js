/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

  'use strict';
  Drupal.behaviors.unigData = {
    attach:
        function (context, settings) {
          console.log(' Drupal.behaviors.unigData');

          Drupal.behaviors.unigData.FileList.load().then(function (value) {
            Drupal.behaviors.unigLazyLoad.loadImages();
          });
        }
  };

  /**
   * File-IDs in Download List
   *
   * @type {{local_storage_name: string, list: Array, add:
   *     Drupal.behaviors.unigData.FilesForDownload.add, remove:
   *     Drupal.behaviors.unigData.FilesForDownload.remove, destroy:
   *     Drupal.behaviors.unigData.FilesForDownload.destroy, clean:
   *     Drupal.behaviors.unigData.FilesForDownload.clean, save:
   *     Drupal.behaviors.unigData.FilesForDownload.save, load:
   *     Drupal.behaviors.unigData.FilesForDownload.load, get:
   *     Drupal.behaviors.unigData.FilesForDownload.get, find:
   *     Drupal.behaviors.unigData.FilesForDownload.find, count:
   *     Drupal.behaviors.unigData.FilesForDownload.count}}
   */



  Drupal.behaviors.unigData.FilesForDownload = {

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
   * @type {{list: Array, route: string, load:
   *     Drupal.behaviors.unigData.FileList.load, destroy:
   *     Drupal.behaviors.unigData.FileList.destroy, get:
   *     Drupal.behaviors.unigData.FileList.get, set:
   *     Drupal.behaviors.unigData.FileList.set, count:
   *     Drupal.behaviors.unigData.FileList.count}}
   */
  Drupal.behaviors.unigData.FileList = {

    list : [],
    route: 'unig/project/json',

    load: function () {

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
            //  console.log('FileList ', result);

            Drupal.behaviors.unigData.FileList.set(result);
          })
          .fail(function (xhr) {
          });


    },

    destroy: function () {
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
      for (key in this.list) {
        if (this.list.hasOwnProperty(key)) {
          size++;
        }
      }
      return size;
    },

    /**
     *
     *
     * @param array_id
     * @returns {Array}
     */
    findKeyword: function (array_id) {
      var results = [];
      var list = this.list;

      for (var i = 0; i < array_id.length; i++) {


        var id = parseInt(array_id[i]);

        var key;
        for (key in list) {
          if (list.hasOwnProperty(key)) {

            var keywords = list[key].keywords;

            for (var index in keywords) {

              var keyword_id = parseInt(keywords[index].id);

              // Keyword-ID in File ?
              if (keyword_id === id) {

                // add file to Resultlist
                var nid = parseInt(list[key].nid);
                results.push(nid);
              }
            }
          }
        }
      }


      return results;
    },

    countKeyword: function (array_id) {
      var results = [];
      var list = this.list;

      for (var i = 0; i < array_id.length; i++) {


        var id = parseInt(array_id[i]);

        var key;
        for (key in list) {
          if (list.hasOwnProperty(key)) {

            var keywords = list[key].keywords;

            for (var index in keywords) {

              var keyword_id = parseInt(keywords[index].id);

              // Keyword-ID in File ?
              if (keyword_id === id) {

                // add file to Resultlist
                var nid = parseInt(list[key].nid);
                results.push(nid);
              }
            }
          }
        }
      }


      return results;
    }

  };

  /**
   * Keywords
   *
   * @type {{list: Array, route: string, load:
   *     Drupal.behaviors.unigData.FileList.load, destroy:
   *     Drupal.behaviors.unigData.FileList.destroy, get:
   *     Drupal.behaviors.unigData.FileList.get, set:
   *     Drupal.behaviors.unigData.FileList.set, count:
   *     Drupal.behaviors.unigData.FileList.count}}
   */
  Drupal.behaviors.unigData.keywordsList = {

    list : [],
    route: 'unig/term/keywords/json',

    load: function () {
      var data = {};


      return $.ajax({
        url     : Drupal.url(this.route),
        type    : 'POST',
        data    : data,
        dataType: 'json'
      })
          .done(function (result) {
            console.log('Keywords: success', result); //  DEVELOP

            Drupal.behaviors.unigData.keywordsList.set(result);
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
      if (this.list.length > 0) {
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

      return this.list.length;
    }

  };

  Drupal.behaviors.unigData.keywordsStorage = {

    local_storage_name: 'unig.keywords',

    list: [],


    add: function (nid) {

      var int_nid = parseInt(nid);
      if (int_nid) {
        this.list.push(int_nid);
        this.save();
      }

    },

    /**
     * remove from list
     *
     */
    remove:
        function (nid) {

          var index = this.list.indexOf(nid);  // indexOf is not supported in
          // IE 7 and 8.
          //remove it
          if (index > -1) {
            this.list.splice(index, 1);
            this.save();

          }

        },

    destroy:
        function () {
          this.list = [];
          this.save();

        },

    /**
     * save to localStorage
     */
    save:
        function () {
          var cleanlist = Drupal.behaviors.unig.cleanArray(this.list);
          localStorage.setItem(this.local_storage_name, cleanlist);
        },

    /**
     * load from localStorage
     */
    load:
        function () {
          var local_string = localStorage.getItem(this.local_storage_name);

          if (local_string != null) {
            var list = local_string.split(',');
            this.list = Drupal.behaviors.unig.cleanArray(list);
          }

          return true;
        },

    /**
     * returns array or false
     */
    get:
        function () {


          if (this.count() > 0) {
            return this.list;
          }
          else {
            return false;
          }
        },

    find:
        function (nid) {


          var search = this.list.indexOf(nid);


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


      return this.list.length;
    }
  };

  Drupal.behaviors.unigData.people = {

    list : [],
    route: 'unig/term/people/json',

    load: function () {
      var data = {};


      return $.ajax({
        url     : Drupal.url(this.route),
        type    : 'POST',
        data    : data,
        dataType: 'json'
      })
          .done(function (result) {

            Drupal.behaviors.unig.keywords.set(result);
          })
          .fail(function (xhr) {
          });


    },

    destroy: function () {
      this.list = [];
    },

    /**
     * returns array or false
     */
    get: function () {
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

  Drupal.behaviors.unigData.peopleStorage = {

    local_storage_name: 'unig.people',

    list: [],


    add: function (nid) {

      var int_nid = parseInt(nid);
      if (int_nid) {
        this.list.push(int_nid);
      }


    },

    /**
     * remove from list
     *
     */
    remove:
        function (nid) {

          var index = this.list.indexOf(nid);  // indexOf is not supported in
          // IE 7 and 8.
          //remove it
          if (index > -1) {
            this.list.splice(index, 1);
          }
        },

    destroy:
        function () {
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


          if (this.count() > 0) {
            return this.list
          }
          else {
            return false;
          }
        },

    find:
        function (nid) {


          var search = this.list.indexOf(nid);


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

      return this.list.length;
    }
  };


})(jQuery, Drupal, drupalSettings);


