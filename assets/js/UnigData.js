/* eslint-disable prettier/prettier,no-restricted-syntax,prefer-destructuring,no-console */
/**
 * Created by ost on 14.05.17.
 */

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigData = {
    attach(context, settings) {
      console.log("Drupal.behaviors.unigData");


      const scope = this;

      $('#unig-main', context).once('unigData').each(() => {


        if (!drupalSettings.unigDataOnce) {
          drupalSettings.unigDataOnce = true;

          Drupal.behaviors.unigData.project.load().then(result => {
            const nid = result.nid;
            Drupal.behaviors.unigData.FileList.load(nid).then(data => {
              Drupal.behaviors.unigLazyLoad.loadImages(data);
            });
          });
        }
      })
    }
  };

  Drupal.behaviors.unigData.project = {
    route: "unig/project/info/json",
    hostname: "default",
    name: "",
    name_url: "",
    nid: 0,
    data: {},

    load() {
      const ProjectNid = $("#unig-project-nid").val();
      this.nid = ProjectNid;

      const data = {
        project_nid: ProjectNid
      };

      return $.ajax({
        url: Drupal.url(this.route),
        type: "POST",
        data,
        dataType: "json"
      }).done(result => {
        Drupal.behaviors.unigData.project.set(result);
        console.log("result project load:", result);
      });
    },
    set(data) {
      this.name = data.title;
      this.name_url = data.title_url;
      this.data = data;
      this.hostname = data.host;
      this.nid = data.nid;
    },
    destroy() {
      this.name = "";
      this.name_url = "";
      this.nid = 0;
      this.data = {};
    },
    getName() {
      return this.name;
    },
    getId() {
      return this.id;
    }
  };

  /**
   * File-IDs in Download List
   *
   * @type {{localStorageName: string, list: Array, add:
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
    localStorageName: "unig.itemsForDownload.",
    list: [],

    add(nid) {
      // console.log('UnigDownloadList - add()', nid);

      const intNid = parseInt(nid, 10);
      if (intNid) {
        this.list.push(intNid);
      }

      // console.log('list ', this.list);
    },

    /**
     * remove from list
     *
     */
    remove(nid) {
      // console.log('UnigDownloadList - remove()');

      const index = this.list.indexOf(nid); // indexOf is not supported in
      // IE 7 and 8.
      // remove it
      if (index > -1) {
        this.list.splice(index, 1);
      }
    },

    destroy() {
      // console.log('itemList - destroy()');
      this.list = [];
    },

    /**
     * remove empty items and dublicates
     * @return {*}
     */
    clean() {
      this.list = Drupal.behaviors.unig.cleanArray(this.list);
    },

    /**
     * save to localStorage
     */
    save() {
      const storageName = `${this.localStorageName +
        Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.nid
      }`;

      localStorage.setItem(storageName, this.list);
    },

    /**
     * load from localStorage
     */
    load() {
      const storagename = `${this.localStorageName +
        Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.nid
      }`;
      const localString = localStorage.getItem(storagename);

      if (localString != null) {
        this.list = localString.split(",");
        this.clean();
      }
      return true;
    },

    /**
     *
     * @return {*}
     */
    get() {
      // console.log('get this.count ', this.count());

      if (this.count() > 0) {
        return this.list;
      }
      return false;
    },

    find(nid) {
      const search = this.list.indexOf(nid);

      return search !== -1;
    },

    /**
     *
     * @return {number}
     */
    count() {
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
    list: [],
    route: "unig/project/json",

    load(projectNid) {

      // Route : unig/unig.ajax.project

      if (!projectNid) {
        projectNid = $("#unig-project-nid").val();
      }

      if (!projectNid) {

      } else {
        const data = {
          project_nid: projectNid,
          album_nid: 0
        };

        return $.ajax({
          url: Drupal.url(this.route),
          type: "POST",
          data,
          dataType: "json"
        })
          .done(result => {

            Drupal.behaviors.unigData.FileList.set(result);
          })
          .fail(xhr => {
            // DEBUG
            console.error("cannot load UniG FileList");
            console.log(data);
            console.log(xhr);
          });
      }
    },

    destroy() {
      this.list = [];
    },
    /**
     * returns array or false
     */
    get() {
      if (this.count() > 0) {
        return this.list;
      }
      return false;
    },

    set(arr) {
      this.list = arr;
    },

    /**
     *
     * @return {number}
     */
    count() {
      let size = 0;
      let key;
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
     * @param ArrayId
     * @return {Array}
     */
    findKeyword(ArrayId) {
      const results = [];
      const list = this.list;

      for (let i = 0; i < ArrayId.length; i++) {
        const id = parseInt(ArrayId[i], 10);

        let key;
        for (key in list) {
          if (list.hasOwnProperty(key)) {
            const keywords = list[key].keywords;

            for (const index in keywords) {
              if (keywords.hasOwnProperty(id)) {
                const KeywordId = parseInt(keywords[index].id, 10);

                // Keyword-ID in File ?
                if (KeywordId === id) {
                  // add file to Resultlist
                  const nid = parseInt(list[key].nid, 10);
                  results.push(nid);
                }
              }
            }
          }
        }
      }

      return results;
    },

    countKeyword(arrID) {
      const results = [];
      const list = this.list;

      for (let i = 0; i < arrID.length; i++) {
        const id = parseInt(arrID[i], 10);

        let key;
        for (key in list) {
          if (list.hasOwnProperty(key)) {
            const keywords = list[key].keywords;

            for (const index in keywords) {
              if (keywords.hasOwnProperty(id)) {
                const keywordID = parseInt(keywords[index].id, 10);

                // Keyword-ID in File ?
                if (keywordID === id) {
                  // add file to Resultlist
                  const nid = parseInt(list[key].nid, 10);
                  results.push(nid);
                }
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
    list: [],
    route: "unig/term/keywords/json",

    load() {
      const data = {};

      return $.ajax({
        url: Drupal.url(this.route),
        type: "POST",
        data,
        dataType: "json"
      })
        .done(result => {
          Drupal.behaviors.unigData.keywordsList.set(result);
        })
        .fail(xhr => {
          console.log(xhr);
        });
    },

    destroy() {
      // console.log('itemList - destroy()');
      this.list = [];
    },

    /**
     * returns array or false
     *
     * @return {boolean}
     */
    get() {
      if (this.list && this.list.length > 0) {
        return this.list;
      }
      return false;
    },

    set(arr) {
      this.list = arr;
    },

    /**
     *
     * @return {number}
     */
    count() {
      let length = 0;
      if (this.list && this.list.length > 0) {
        length = this.list.length;
      }

      return length;
    }
  };

  Drupal.behaviors.unigData.keywordsStorage = {
    localStorageName: "unig.keywords.",

    list: [],

    add(nid) {
      const IntNid = parseInt(nid, 10);
      if (IntNid) {
        this.list.push(IntNid);
        this.save();
      }
    },

    /**
     * remove from list
     *
     */
    remove(nid) {
      const index = this.list.indexOf(nid); // indexOf is not supported in
      // IE 7 and 8.
      // remove it
      if (index > -1) {
        this.list.splice(index, 1);
        this.save();
      }
    },

    destroy() {
      this.list = [];
      this.save();
    },

    /**
     * save to localStorage
     */
    save() {
      const cleanlist = Drupal.behaviors.unig.cleanArray(this.list);
      const localStorageName = `${this.localStorageName +
        Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.nid
      }`;

      localStorage.setItem(localStorageName, cleanlist);
    },

    /**
     * load from localStorage
     */
    load() {
      const localStorageName = `${this.localStorageName +
        Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.nid
      }`;

      const localString = localStorage.getItem(localStorageName);

      if (localString != null) {
        const list = localString.split(",");
        this.list = Drupal.behaviors.unig.cleanArray(list);
      }

      return true;
    },

    /**
     * returns array or false
     */
    get() {
      if (this.count() > 0) {
        return this.list;
      }
      return false;
    },

    find(nid) {
      const search = this.list.indexOf(nid);

      if (search === -1) {
        return false;
      }
      return true;
    },

    /**
     *
     * @return {number}
     */
    count() {
      return this.list.length;
    }
  };

  Drupal.behaviors.unigData.peopleList = {
    list: [],
    route: "unig/term/people/json",

    load() {
      const data = {};

      return $.ajax({
        url: Drupal.url(this.route),
        type: "POST",
        data,
        dataType: "json"
      })
        .done(result => {
          Drupal.behaviors.unig.keywords.set(result);
        })
        .fail(xhr => {});
    },

    destroy() {
      this.list = [];
    },

    /**
     * returns array or false
     */
    get() {
      if (this.count() > 0) {
        return this.list;
      }
      return false;
    },

    set(arr) {
      this.list = arr;
    },

    /**
     *
     * @return {number}
     */
    count() {
      let size = 0;
      let key;
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          size++;
        }
      }
      return size;
    }
  };

  Drupal.behaviors.unigData.peopleStorage = {
    localStorageName: "unig.people.",

    list: [],

    add(nid) {
      const intNid = parseInt(nid, 10);
      if (intNid) {
        this.list.push(intNid);
      }
    },

    /**
     * remove from list
     *
     */
    remove(nid) {
      const index = this.list.indexOf(nid); // indexOf is not supported in
      // IE 7 and 8.
      // remove it
      if (index > -1) {
        this.list.splice(index, 1);
      }
    },

    destroy() {
      this.list = [];
    },

    /**
     * remove empty items and dublicates
     * @return {*}
     */
    clean() {
      this.list = Drupal.behaviors.unig.cleanArray(this.list);
    },

    /**
     * save to localStorage
     */
    save() {
      const localStorageName = `${this.localStorageName +
        Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.nid
      }`;

      localStorage.setItem(localStorageName, this.list);
    },

    /**
     * load from localStorage
     */
    load() {
      const localStorageName = `${this.localStorageName +
        Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.nid
      }`;

      const localString = localStorage.getItem(localStorageName);

      if (localString != null) {
        this.list = localString.split(",");
        this.clean();
      }
      return true;
    },

    /**
     * returns array or false
     */
    get() {
      if (this.count() > 0) {
        return this.list;
      }
      return false;
    },

    find(nid) {
      const search = this.list.indexOf(nid);

      if (search === -1) {
        return false;
      }
      return true;
    },

    /**
     *
     * @return {number}
     */
    count() {
      return this.list.length;
    }
  };
})(jQuery, Drupal, drupalSettings);
