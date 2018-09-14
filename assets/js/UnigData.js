/* eslint-disable prettier/prettier,no-restricted-syntax,prefer-destructuring */
/**
 * Created by ost on 14.05.17.
 */

(function ($, Drupal, drupalSettings) {

    Drupal.behaviors.unigData = {
        attach(context, settings) {


            if (!settings.unigCounter) {
                console.log('Drupal.behaviors.unigData');

                // fire just once
                drupalSettings.unigCounter = 1;
                Drupal.behaviors.unigData.project.load().then(
                    result => {
                        const nid = result.nid;
                        Drupal.behaviors.unigData.FileList.load(nid).then(
                            data => {
                                console.log(data);
                                Drupal.behaviors.unigLazyLoad.loadImages(data);
                            }
                        );

                    }
                );
            } else {
                settings.unigCounter++;

            }
            console.warn(settings.unigCounter);
        }
    };

    Drupal.behaviors.unigData.project = {
        route: 'unig/project/info/json',
        hostname: 'default',
        name: '',
        name_url: '',
        nid: 0,
        data: {},

        load() {
            const ProjectNid = $('#unig-project-nid').val();
            this.nid = ProjectNid;

            const data = {
                project_nid: ProjectNid
            };

            return $.ajax({
                url: Drupal.url(this.route),
                type: 'POST',
                data,
                dataType: 'json'
            }).done(result => {
                Drupal.behaviors.unigData.project.set(result);
                console.log('result project load:', result);
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
            this.name = '';
            this.name_url = '';
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
        local_storage_name: 'unig.itemsForDownload.',
        list: [],

        add(nid) {
            // console.log('UnigDownloadList - add()', nid);

            const int_nid = parseInt(nid, 10);
            if (int_nid) {
                this.list.push(int_nid);
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
            const storagename = `${this.local_storage_name +
            Drupal.behaviors.unigData.project.hostname}.${
                Drupal.behaviors.unigData.project.nid
                }`;

            localStorage.setItem(storagename, this.list);
        },

        /**
         * load from localStorage
         */
        load() {
            const storagename = `${this.local_storage_name +
            Drupal.behaviors.unigData.project.hostname}.${
                Drupal.behaviors.unigData.project.nid
                }`;
            const local_string = localStorage.getItem(storagename);

            if (local_string != null) {
                this.list = local_string.split(',');
                this.clean();
            }
            return true;
        },

        /**
         * returns array or false
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

            return search != -1;

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
        route: 'unig/project/json',

        load(projectNid) {
            console.warn('unigData.FileList NID:', projectNid);

            // Route : unig/unig.ajax.project

            if (!projectNid) {
                projectNid = $('#unig-project-nid').val();
            }

            if (!projectNid) {

                console.warn('No Project NID set');

            } else {
                const data = {
                    project_nid: projectNid,
                    album_nid: 0
                };

                return $.ajax({
                    url: Drupal.url(this.route),
                    type: 'POST',
                    data,
                    dataType: 'json'
                })
                    .done(result => {
                        //  console.log('FileList ', result);

                        Drupal.behaviors.unigData.FileList.set(result);
                    })
                    .fail(xhr => {
                        // DEBUG
                        console.error('cannot load UniG FileList');
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
            let size = 0,
                key;
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

            return results;
        },

        countKeyword(array_id) {
            const results = [];
            const list = this.list;

            for (let i = 0; i < array_id.length; i++) {
                const id = parseInt(array_id[i]);

                let key;
                for (key in list) {
                    if (list.hasOwnProperty(key)) {
                        const keywords = list[key].keywords;

                        for (const index in keywords) {
                            const keyword_id = parseInt(keywords[index].id, 10);

                            // Keyword-ID in File ?
                            if (keyword_id === id) {
                                // add file to Resultlist
                                const nid = parseInt(list[key].nid, 10);
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
        list: [],
        route: 'unig/term/keywords/json',

        load() {
            const data = {};

            return $.ajax({
                url: Drupal.url(this.route),
                type: 'POST',
                data,
                dataType: 'json'
            })
                .done(result => {
                    Drupal.behaviors.unigData.keywordsList.set(result);
                })
                .fail(xhr => {
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
        local_storage_name: 'unig.keywords.',

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
            const local_storage_name = `${this.local_storage_name +
            Drupal.behaviors.unigData.project.hostname}.${
                Drupal.behaviors.unigData.project.nid
                }`;

            localStorage.setItem(local_storage_name, cleanlist);
        },

        /**
         * load from localStorage
         */
        load() {
            const local_storage_name = `${this.local_storage_name +
            Drupal.behaviors.unigData.project.hostname}.${
                Drupal.behaviors.unigData.project.nid
                }`;

            const local_string = localStorage.getItem(local_storage_name);

            if (local_string != null) {
                const list = local_string.split(',');
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
        route: 'unig/term/people/json',

        load() {
            const data = {};

            return $.ajax({
                url: Drupal.url(this.route),
                type: 'POST',
                data,
                dataType: 'json'
            })
                .done(result => {
                    Drupal.behaviors.unig.keywords.set(result);
                })
                .fail(xhr => {
                });
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
            let size = 0,
                key;
            for (key in this) {
                if (this.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        }
    };

    Drupal.behaviors.unigData.peopleStorage = {
        local_storage_name: 'unig.people.',

        list: [],

        add(nid) {
            const int_nid = parseInt(nid, 10);
            if (int_nid) {
                this.list.push(int_nid);
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
            const local_storage_name = `${this.local_storage_name +
            Drupal.behaviors.unigData.project.hostname}.${
                Drupal.behaviors.unigData.project.nid
                }`;

            localStorage.setItem(local_storage_name, this.list);
        },

        /**
         * load from localStorage
         */
        load() {
            const local_storage_name = `${this.local_storage_name +
            Drupal.behaviors.unigData.project.hostname}.${
                Drupal.behaviors.unigData.project.nid
                }`;

            const local_string = localStorage.getItem(local_storage_name);

            if (local_string != null) {
                this.list = local_string.split(',');
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

            if (search == -1) {
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
