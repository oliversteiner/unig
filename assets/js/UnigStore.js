(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigStore = {
    attach(context, settings) {
      // onload
    },

    name: 'unig',
    module: 'none',
    items: [],

    init(name) {
      this.module = name;
      const host = Drupal.behaviors.unigData.project.host;
      const projectId = Drupal.behaviors.unigData.project.id;
      this.name = host + '.unig.' + name + '.' + projectId;
      this.load();
    },

    add(id) {
      id = parseInt(id, 10);
      this.items.push(id);
      this.save();
    },

    toggle(id) {

      if (this.find(id)) {
        this.remove(id);
      } else {
        this.add(id);
      }
      this.save();
    },

    /**
     * remove from list
     *
     */
    remove(id) {
      const index = this.items.indexOf(id);
      if (index > -1) {
        this.items.splice(index, 1);
        this.save();
      }
    },

    destroy() {
      this.items = [];
      this.save();
    },

    /**
     * save to localStorage
     */
    save() {
      // const cleanArray = Drupal.behaviors.unig.cleanArray(this.items);
      localStorage.setItem(this.name, this.items);
    },

    /**
     * load from localStorage
     */
    load() {
      const storeContent = localStorage.getItem(this.name);
      let items = [];

      if (storeContent != null) {
        const storeArray = storeContent.split(',');
        items = Drupal.behaviors.unig.cleanArray(storeArray);
      }

      this.items = items;
      return items;
    },

    /**
     * returns array or false
     */
    get() {
      return this.items;
    },

    count() {
      return this.items.length;
    },

    find(id) {
      id = parseInt(id, 10);

      const search = this.items.indexOf(id);

      return search !== -1;
    },
  };
})(jQuery, Drupal, drupalSettings);
