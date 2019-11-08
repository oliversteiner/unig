/**
 * Created by ost on 14.05.17.
 */

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigData = {

    project: {},

    attach(context, settings) {
      $('#unig-main', context)
        .once('unigData')
        .each(() => {
          if (!drupalSettings.unigDataOnce) {
            drupalSettings.unigDataOnce = true;
            console.log('project loading...');

            this.project = drupalSettings.unig.project.project;
            const projectId = this.project.nid;
            console.log('Done.');

            console.log('FileList loading...');
            Drupal.behaviors.unigData.FileList.load();
              console.log('Done.');

              console.log('Images loading...');
           //   Drupal.behaviors.unigLazyLoad.loadImages();



          }
        });
    },
  };

  Drupal.behaviors.unigData.project2 = {
    hostname: 'default',
    name: '',
    name_url: '',
    id: 0,
    data: {},

    load() {
      const project = drupalSettings.unig.project.project;
      this.set(project);
    },
    set(project) {
      this.name = project.title;
      this.name_url = project.title_url;
      this.hostname = project.host;
      this.id = project.project_id;
      this.data = project;
    },
    destroy() {
      this.name = '';
      this.name_url = '';
      this.id = 0;
      this.data = {};
    },
    getName() {
      return this.name;
    },
    getId() {
      return this.id;
    },
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
    localStorageName: 'unig.itemsForDownload.',
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

      const index = this.list.indexOf(nid);
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
      const storageName = `${this.localStorageName +
      Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.id
      }`;

      localStorage.setItem(storageName, this.list);
    },

    /**
     * load from localStorage
     */
    load() {
      const storagename = `${this.localStorageName +
      Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.id
      }`;
      const localString = localStorage.getItem(storagename);

      if (localString != null) {
        this.list = localString.split(',');
        this.clean();
      }
      return true;
    },

    /**
     *
     * @return {*}
     */
    get() {

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


      return this.list.length;
    },
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
    keywords: [],
    people: [],
    route: 'unig/project/json',

    load() {
      const fileList = drupalSettings.unig.project.files;

      this.list = fileList;

      // Keywords
      this.keywords = this.getKeywords(fileList);
      Drupal.behaviors.unigData.allKeywords.load(fileList);

      // People
      this.people = this.getPeople(fileList);
      Drupal.behaviors.unigData.peopleList.load(fileList);

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


    getKeywords(fileList) {

      let keywordsList = [];

      fileList.forEach(item => {
        const keywords = item.keywords;
        keywords.forEach(keyword => {
          const id = parseInt(keyword.id);
          if (!keywordsList.includes(id)) {
            keywordsList.push(id);
          }
        });
      });

      return keywordsList;
    },

    getPeople(fileList) {

      let peopleList = [];

      fileList.forEach(item => {
        const people = item.people;
        people.forEach(people => {
          const id = parseInt(people.id);
          if (!peopleList.includes(id)) {
            peopleList.push(id);
          }
        });
      });

      return peopleList;
    },

    /**
     *
     * @return {number}
     */
    count() {
      return this.list.length;
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
    },
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
  Drupal.behaviors.unigData.allKeywords = {
    list: [],
    route: 'unig/term/keywords/json',

    load() {

      $.ajax({
        url: Drupal.url(this.route),
        type: 'GET',
        dataType: 'json',
      })
        .done(result => {

          const keywordsInProject = Drupal.behaviors.unigData.FileList.keywords;

          let keywordsList = [];
          if (keywordsInProject) {
            result.forEach(item => {
              if (keywordsInProject.includes(item.id)) {
                keywordsList.push(item);
              }
            });

          } else {
            keywordsList = result;
          }

          this.list = keywordsList;
          Drupal.behaviors.unigKeywords.searchAutocomplete(keywordsList);
          Drupal.behaviors.unigKeywords.buildTags(keywordsList);

        })
        .fail(xhr => {
        });
    },

    destroy() {
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
    },
  };

  Drupal.behaviors.unigData.keywordsStorage = {
    localStorageName: 'unig.keywords.',

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
        Drupal.behaviors.unigData.project.id
      }`;

      localStorage.setItem(localStorageName, cleanlist);
    },

    /**
     * load from localStorage
     */
    load() {
      const localStorageName = `${this.localStorageName +
      Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.id
      }`;

      const localString = localStorage.getItem(localStorageName);

      if (localString != null) {
        const list = localString.split(',');
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
    },
  };


  Drupal.behaviors.unigData.peopleList = {
    list: [],
    route: 'unig/term/people/json',

    load() {

      $.ajax({
        url: Drupal.url(this.route),
        type: 'GET',
        dataType: 'json',
      })
        .done(result => {

          const peopleInProject = Drupal.behaviors.unigData.FileList.people;

          let peopleList = [];
          if (peopleInProject) {
            result.forEach(item => {
              if (peopleInProject.includes(item.id)) {
                peopleList.push(item);
              }
            });

          } else {
            peopleList = result;
          }

          this.list = peopleList;
          Drupal.behaviors.unigPeople.searchAutocomplete(peopleList);
          Drupal.behaviors.unigPeople.buildTags(peopleList);

        })
        .fail(xhr => {
        });
    },

    destroy() {
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
    },
  };

  Drupal.behaviors.unigData.peopleStorage = {
    localStorageName: 'unig.people.',

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
        Drupal.behaviors.unigData.project.id
      }`;

      localStorage.setItem(localStorageName, this.list);
    },

    /**
     * load from localStorage
     */
    load() {
      const localStorageName = `${this.localStorageName +
      Drupal.behaviors.unigData.project.hostname}.${
        Drupal.behaviors.unigData.project.id
      }`;

      const localString = localStorage.getItem(localStorageName);

      if (localString != null) {
        this.list = localString.split(',');
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
    },
  };
})(jQuery, Drupal, drupalSettings);
