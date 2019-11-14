/**
 * Created by ost on 14.05.17.
 */

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigData = {
    project: {},
    files: [],

    attach(context, settings) {
      $('#unig-main', context)
        .once('unigData')
        .each(() => {
          if (!drupalSettings.unigDataOnce) {
            drupalSettings.unigDataOnce = true;
            console.log('project loading...');

            this.project = drupalSettings.unig.project.project;
            this.files = drupalSettings.unig.project.files;

            const projectId = this.project.id;
            console.log('Done.');

            console.log('FileList loading...');
            Drupal.behaviors.unigData.FileList.load();
            console.log('Done.');

            console.log('Images loading...');
          }
        });
    },
  };

  Drupal.behaviors.unigData.FileList = {
    list: [],
    keywords: [],
    people: [],
    route: 'unig/project/json',

    remove(id) {
      // Remove item from List
      this.list = this.list.filter(item => item.id !== id);
      Drupal.behaviors.unigProject.updateBrowser();
    },



    load() {
      const fileList = drupalSettings.unig.project.files;

      this.list = fileList;

      // Keywords
      this.keywords = this.getKeywords(fileList);
      Drupal.behaviors.unigData.projectKeywords.load(fileList);

      // People
      this.people = this.getPeople(fileList);
      Drupal.behaviors.unigData.projectPeople.load(fileList);
    },

    clear() {
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
  };

  /**
   * Keywords
   */
  Drupal.behaviors.unigData.projectKeywords = {
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
          // Drupal.behaviors.unigKeywords.searchAutocomplete(keywordsList);
          Drupal.behaviors.unigKeywords.buildTags(keywordsList);
          Drupal.behaviors.unigKeywords.update();
        })
        .fail(xhr => {
        });
    },

    clear() {
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

  /**
   * People
   */
  Drupal.behaviors.unigData.projectPeople = {
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

    clear() {
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
})(jQuery, Drupal, drupalSettings);
