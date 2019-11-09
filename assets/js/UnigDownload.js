(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigDownload = {
    version: '1.0.0',

    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigDownload')
        .each(() => {
          this.constructor(context, settings);
        });
    },

    isToolbarOpen: false,

    downloadsize: {},

    $toolbar_sd: $(
      '.unig-bulk-download-table .unig-file-download-table-size-sd',
    ),
    $toolbar_hd: $(
      '.unig-bulk-download-table .unig-file-download-table-size-hd',
    ),
    $toolbar_xl: $(
      '.unig-bulk-download-table .unig-file-download-table-size-xl',
    ),

    $bulkDownloadMessageContainer: $('.unig-bulk-download-message-container'),

    updateFiles() {
      $('.unig-button-download-add-current-to-list').hide();

      Drupal.behaviors.unigPeople.Visible = [];
      const peopleIds = Drupal.behaviors.unigData.peopleStorage.get();
      const keywordIds = Drupal.behaviors.unigData.keywordsStorage.get();
      const number_of_all_items = Drupal.behaviors.unigData.FileList.count();
      const fullList = Drupal.behaviors.unigData.FileList.list;

      if (peopleIds.length > 0) {
        // hide all files with this tag
        // const peopleList = Drupal.behaviors.unigData.FileList.findKeyword(peopleIds );

        if (fullList && fullList.length > 0) {
          for (const item of fullList) {
            const $elem = $(`#unig-file-${item.nid}`);

            $elem.hide();
            $elem.data('current', false);

            // all people
            for (const people of item.people) {
              if (peopleIds.includes(parseInt(people.id))) {
                // if also keywords
                // all Keywords
                if (keywordIds.length > 0) {
                  for (const keywords of item.keywords) {
                    if (keywordIds.includes(parseInt(keywords.id))) {
                      $elem.show();
                      $elem.data('current', true);
                      Drupal.behaviors.unigPeople.Visible.push(item.nid);
                    }
                  }
                } else {
                  $elem.show();
                  $elem.data('current', true);
                  Drupal.behaviors.unigPeople.Visible.push(item.nid);
                }
              }
            }
          }
        }
      } else if (keywordIds.length > 0) {
        if (fullList && fullList.length > 0) {
          for (const item of fullList) {
            const $elem = $(`#unig-file-${item.nid}`);
            $elem.hide();
            $elem.data('current', false);

            for (const keywords of item.keywords) {
              if (keywordIds.includes(parseInt(keywords.id))) {
                $elem.show();
                $elem.data('current', true);
                Drupal.behaviors.unigPeople.Visible.push(item.nid);
              }
            }
          }
        }
      } else {
        // show all
        for (const item of fullList) {
          $(`#unig-file-${item.nid}`).show();
        }
      }

      Drupal.behaviors.unigData.FileList.updateNumberOf();

      $('.unig-button-download-add-current-to-list').show();
    },

    toggleToolbar(context) {
      if (this.isToolbarOpen) {
        this.closeToolbar(context);
      } else {
        this.openToolbar(context);
      }
    },

    openToolbar(context) {
      const $toolbarArea = $('.unig-toolbar-download', context);
      const $toolbarAreaTrigger = $(
        '.unig-toolbar-download-toggle-trigger',
        context,
      );

      $toolbarArea.slideDown();
      $toolbarArea.addClass('open');
      $toolbarAreaTrigger.addClass('active');
      this.isToolbarOpen = true;
    },

    closeToolbar(context) {
      const $toolbarArea = $('.unig-toolbar-download', context);
      const $toolbarAreaTrigger = $(
        '.unig-toolbar-download-toggle-trigger',
        context,
      );

      $toolbarArea.slideUp();
      $toolbarArea.removeClass('open');
      $toolbarAreaTrigger.removeClass('active');
      this.isToolbarOpen = false;
    },

    add(nid) {
      Drupal.behaviors.unigData.FilesForDownload.add(nid);
      Drupal.behaviors.unigData.FilesForDownload.save();
    },

    remove(nid) {
      Drupal.behaviors.unigData.FilesForDownload.remove(nid);
      Drupal.behaviors.unigData.FilesForDownload.save();
    },

    toggle(nid) {
      const itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();

      // if first Item in list toggle on
      if (itemsForDownload === false) {
        this.add(nid);
      } else {
        // search item in itemsForDownload List
        const IsInDownloadList = Drupal.behaviors.unigData.FilesForDownload.find(
          nid,
        );

        if (IsInDownloadList) {
          // if item in list. toggle off
          this.remove(nid);
        } else {
          // if item  not in list. toggle on
          this.add(nid);
        }
      }
    },

    save() {
      Drupal.behaviors.unigData.FilesForDownload.save();
    },

    addMark(nid) {
      if (nid) {
        // Mark Elem
        const elemTarget = document.querySelector(`#unig-file-${nid}`);
        elemTarget.classList.add('marked');

        // Button "add to download list"
        elemTarget
          .querySelector(`.unig-file-download-mark-add`)
          .setAttribute('style', 'display:none');
        elemTarget
          .querySelector(`.unig-file-download-mark-remove`)
          .setAttribute('style', 'display:block');
      }
    },

    removeMark(nid) {
      if (nid) {
        // Mark Elem
        const elemTarget = document.querySelector(`#unig-file-${nid}`);
        elemTarget.classList.remove('marked');

        // Button "remove from download list"
        elemTarget
          .querySelector(`.unig-file-download-mark-add`)
          .setAttribute('style', 'display:block');
        elemTarget
          .querySelector(`.unig-file-download-mark-remove`)
          .setAttribute('style', 'display:none');
      }
    },

    toggleMark(nid) {
      const elemTarget = document.querySelector(`#unig-file-${nid}`);

      if (elemTarget.classList.contains('marked')) {
        // if item in list. toggle off
        this.removeMark(nid);
      } else {
        // if item  not in list. toggle on
        this.addMark(nid);
      }
    },

    updateInfo() {
      // target
      const $targetButtonNumberOf = $('.unig-button .unig-dl-number-of');
      const $targetNumberOf = $('.unig-dl-number-of');

      // get Number
      const numberOfItems = Drupal.behaviors.unigData.FilesForDownload.count();

      // Append to DOM
      $targetButtonNumberOf.html(numberOfItems);
      $targetNumberOf.html(numberOfItems);

      if (numberOfItems > 0) {
        $targetButtonNumberOf.addClass('badge badge-marked');
      } else {
        $targetButtonNumberOf.removeClass('badge badge-marked');
      }

      $('.unig-file-download-list-size-sd').html('0');

      const sd = Drupal.behaviors.unig.humanFile_size(this.downloadsize.sd);
      const hd = Drupal.behaviors.unig.humanFile_size(this.downloadsize.hd);
      const xl = Drupal.behaviors.unig.humanFile_size(this.downloadsize.xl);

      this.$toolbar_sd.html(sd);
      this.$toolbar_hd.html(hd);
      this.$toolbar_xl.html(xl);
    },

    bulkDownloadStart(size) {
      $(`.unig-bulk-download-${size}-trigger`).addClass('active');

      // Set Download Message Container to Prozessing
      Drupal.behaviors.unigDownload.message_download_processing(size);

      const itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();
      const data = {
        size,
        projectName: size,
        items: itemsForDownload,
      };

      $.ajax({
        url: Drupal.url('unig/download/'),
        type: 'POST',
        data: {
          data,
          project_id: Drupal.behaviors.unigData.project.id,
        },
        dataType: 'json',
        success(results) {
          if (results.zip) {
            location.href = results.zip;
            Drupal.behaviors.unigDownload.message_download_ok(results.zip);
          } else {
            Drupal.behaviors.unigDownload.message_download_failed();
          }
        },
      });

      return true;
    },

    downloadFile(url, name) {
      download(url, name);
    },

    openDownloadMessageBox() {
      this.$bulkDownloadMessageContainer.slideDown('fast');
    },

    setDownloadMessage(status, icon, message) {
      Drupal.behaviors.unigDownload.openDownloadMessageBox();

      $('.unig-bulk-download-message-container > div')
        .removeClass()
        .addClass(status);

      $('.unig-message-box-picto').html();
      if (icon) {
        $('.unig-message-box-picto').html(`<i class="${icon}"></i>`);
      }

      $('.unig-message-box-body').html();
      $('.unig-message-box-body').html(message);
    },

    bulkDownloadCancel() {
      const $bulkDownloadSd = $('.unig-bulk-download-sd-trigger');
      const $bulkDownloadHd = $('.unig-bulk-download-hd-trigger');
      const $bulkDownloadXl = $('.unig-bulk-download-xl-trigger');

      $bulkDownloadSd.removeClass('active');
      $bulkDownloadHd.removeClass('active');
      $bulkDownloadXl.removeClass('active');

      // Reset Message Box
      const status = 'default';
      const icon = false;
      const message = '';
      Drupal.behaviors.unigDownload.setDownloadMessage(status, icon, message);
      Drupal.behaviors.unigDownload.closeDownloadMessageBox();
    },

    closeDownloadMessageBox() {
      this.$bulkDownloadMessageContainer.slideUp('fast', function() {});
    },

    message_download_processing(size) {
      // translate
      const textZip = Drupal.t(
        'A zip-archive with the pictures will be created. Please wait.',
      );
      const textCancel = Drupal.t('Cancel download');
      const textLoading = Drupal.t('Loading...');

      const status = 'working';
      const icon = 'fas fa-circle-notch fa-spin';
      const message =
        `<span class="sr-only">${textLoading}</span>` +
        `${textZip}<br>` +
        `<button onclick="Drupal.behaviors.unigDownload.bulkDownloadCancel()">${textCancel}</button>`;
      Drupal.behaviors.unigDownload.setDownloadMessage(status, icon, message);
    },

    message_download_ok(url) {
      const status = 'success';
      const icon = 'fas fa-check';
      const message = `Der Download ist bereit.<br>Sollte der Download nicht automatisch starten: <a href="${url}">hier klicken.</a>`;

      Drupal.behaviors.unigDownload.setDownloadMessage(status, icon, message);
    },

    message_download_failed() {
      const status = 'warning';
      const icon = 'fas fa-exclamation-triangle';
      const message =
        'Es ist ein Fehler aufgetreten beim erstellen des Zips.<br>Bitte die Seite neu laden und noch einmal versuchen.';
      Drupal.behaviors.unigDownload.setDownloadMessage(status, icon, message);
    },

    buildThumbnails() {
      // Target
      const $area = $('.unig-dl-thumbnails');

      // get Item List
      const itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();
      const itemList = Drupal.behaviors.unigData.FileList.get();

      let elemLi = '';
      if (itemsForDownload) {
        itemsForDownload.forEach(id => {
          // check
          const item = itemList.find(item => item.id == id);

          if (item && item.title) {
            const label = item.title;
            const imgSrc = item.image.unig_thumbnail.url;

            elemLi +=
              `<li class="unig-dl" id="unig-dl-${id}" data-nid = "${id}">` +
              ` <div class="unig-dl-nid">${id}</div>` +
              ` <div class="unig-dl-image item-overlay">` +
              `   <img src="${imgSrc}" alt=""/>` +
              ` <div class="item-overlay-canvas top">` +
              `   <span class="item-overlay-text"><i class="fas fa-times-circle" aria-hidden="true"></i>\n</span></div>` +
              ` </div>` +
              ` <div class="unig-dl-label">${label}</div>` +
              `</li>`;
          }
        });
      }

      const prefix = '<ul class="unig-dl">';
      const suffix = '</ul>';

      // Build DOM
      const html = prefix + elemLi + suffix;

      // Add tumbnail to dom
      $area.html(html);

      // Add Handler
      $('ul.unig-dl').on('click', 'li', function() {
        const nid = $(this).data('nid');
        Drupal.behaviors.unigDownload.remove(nid);
        Drupal.behaviors.unigDownload.removeMark(nid);
        Drupal.behaviors.unigDownload.calculateDownloadsize();
        Drupal.behaviors.unigDownload.refreshGUI();
        Drupal.behaviors.unigDownload.updateInfo();
      });
    },

    /**
     *
     *
     *
     */
    refreshGUI() {
      if (this.isFolderXl === true) {
        this.openToolbar();
      }
      this.isFolderActive = true;

      // Get Download Item List
      const itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();

      if (itemsForDownload) {
        itemsForDownload.forEach(elem => {
          if (elem) {
            Drupal.behaviors.unigDownload.addMark(elem);
          }
        });
      }

      this.buildThumbnails();
      this.updateInfo();
    },

    clearDownloadList() {
      this.removeAll();
      this.removeAllMarks();
      this.buildThumbnails();
      this.calculateDownloadsize();
      this.refreshGUI();
      this.updateInfo();
      this.save();
    },

    fillDownloadList() {
      this.addAll();
      this.addAllMarks();
      this.buildThumbnails();
      this.calculateDownloadsize();
      this.refreshGUI();
      this.updateInfo();
      this.save();
    },

    fillDownloadListWithCurrent() {
      this.addCurrent();
      this.addMarksToCurrent();
      this.buildThumbnails();
      this.calculateDownloadsize();
      this.refreshGUI();
      this.updateInfo();
      this.save();
    },

    /**
     *
     *
     */
    removeAll() {
      Drupal.behaviors.unigData.FilesForDownload.destroy();
    },

    /**
     *
     *
     */
    removeAllMarks() {
      const listItem = Drupal.behaviors.unigData.FileList.get();

      if (listItem) {
        for (const item of listItem) {
          this.removeMark(item.id);
        }
      }
    },

    addMarksToCurrent() {
      this.removeAllMarks();
      const listItem = Drupal.behaviors.unigData.FileList.get();

      if (listItem) {
        for (const item of listItem) {
          if ($(`#unig-file-${item.nid}`).data('current')) {
            this.addMark(item.id);
          }
        }
      }
    },

    addCurrent() {
      this.removeAll();
      const listItem = Drupal.behaviors.unigData.FileList.get();

      if (listItem) {
        for (const item of listItem) {
          if ($(`#unig-file-${item.nid}`).data('current')) {
            this.add(item.id);
          }
        }
      }
    },

    addAllMarks() {
      const listItem = Drupal.behaviors.unigData.FileList.get();

      if (listItem) {
        for (const item of listItem) {
          this.addMark(item.id);
        }
      }
    },

    addAll() {
      this.removeAll();
      const listItem = Drupal.behaviors.unigData.FileList.get();

      if (listItem) {
        for (const item of listItem) {
          this.add(item.id);
        }
      }
    },

    /**
     * calculate Downloadsize
     *
     *
     */

    calculateDownloadsize() {
      const itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();
      const itemList = Drupal.behaviors.unigData.FileList.get();

      //
      this.downloadsize = {
        sd: 0,
        hd: 0,
        xl: 0,
      };

      if (itemsForDownload) {
        itemsForDownload.forEach(id => {
          let Downloadsize = Drupal.behaviors.unigDownload.downloadsize;
          const file = itemList.find(item => item.id === id);

          if (file) {
            if (file.image.unig_sd) {
              const sd = file.image.unig_sd.file_size;
              Downloadsize.sd += sd;
            }
            if (file.image.unig_hd) {
              const hd = file.image.unig_hd.file_size;
              Downloadsize.hd += hd;
            }
            if (file.image.original) {
              const xl = file.image.original.file_size;
              Downloadsize.xl += xl;
            }
          }
        });
      }
    },

    /**
     *
     * @param context
     * @param settings
     */
    constructor(context, settings) {
      // promise : wait for data from server

      if (Drupal.behaviors.unigData.FileList.load()) {
        Drupal.behaviors.unigData.FileList.load().then(
          () => {
            // successCallback
            const itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.load();
            if (itemsForDownload) {
              const count = Drupal.behaviors.unigData.FilesForDownload.count();
              if (count > 0) {
                // After Success
                //  Drupal.behaviors.unigDownload.openToolbar();
                Drupal.behaviors.unigDownload.calculateDownloadsize();
                Drupal.behaviors.unigDownload.refreshGUI();
                Drupal.behaviors.unigDownload.updateInfo();
              }
            }
          },
          reason => {
            // failureCallback
          },
        );
      }
      // Trigger

      // Mark for Download
      $('.unig-file-download-mark-trigger', context).click(event => {
        const Scope = Drupal.behaviors.unigDownload;

        // get Node ID
        const id = Drupal.behaviors.unig.getFileId(event);

        // Add to Download-List
        Scope.toggle(id);

        // Mark as Download-Item
        Scope.toggleMark(id);

        // Update Infos
        Scope.calculateDownloadsize();

        // Build Download Area unig-message-box-success
        Scope.refreshGUI();

        // Save to localStorage
        Drupal.behaviors.unigData.FilesForDownload.save();
      });

      // Add All Files to Download
      $('.unig-button-download-add-all-to-list-trigger', context).click(
        event => {
          Drupal.behaviors.unigDownload.fillDownloadList(event);
        },
      );

      // Add current Files to Download
      $('.unig-button-download-add-current-to-list-trigger', context).click(
        event => {
          Drupal.behaviors.unigDownload.fillDownloadListWithCurrent(event);'^'
        },
      );

      // Clean Folder
      $('.unig-button-download-clear-list-trigger', context).click(event => {
        Drupal.behaviors.unigDownload.clearDownloadList(event);
      });

      // Close Toolbar
      $('.unig-toolbar-area-close-trigger', context).click(() => {
        Drupal.behaviors.unigDownload.closeToolbar(context);
      });

      // Open Toolbar
      $('.unig-toolbar-area-open-trigger', context).click(() => {
        Drupal.behaviors.unigDownload.closeToolbar(context);
      });

      // Toggle Toolbar
      $('.unig-toolbar-download-toggle-trigger', context).click(() => {
        Drupal.behaviors.unigDownload.toggleToolbar(context);
      });

      // Start Bulk Download
      $('.unig-bulk-download-sd-trigger', context).click(() => {
        Drupal.behaviors.unigDownload.bulkDownloadStart('sd');
      });

      $('.unig-bulk-download-hd-trigger', context).click(() => {
        Drupal.behaviors.unigDownload.bulkDownloadStart('hd');
      });

      $('.unig-bulk-download-xl-trigger', context).click(() => {
        Drupal.behaviors.unigDownload.bulkDownloadStart('xl');
      });

      $('.unig-message-box-close-trigger', context).click(() => {
        Drupal.behaviors.unigDownload.closeDownloadMessageBox();
      });

      // Single File Download Trigger
      $('.unig-file-download-trigger', context).click(elem => {
        const url = elem.currentTarget.dataset.unigFileUrl;
        const size = elem.currentTarget.dataset.size;
        const name = elem.currentTarget.dataset.name;

        const nameWithSize = name.replace(/\./, '-' + size + '.');
        console.log('url', url);
        console.log('Download', nameWithSize);


        // TODO implement Download for  other Files then JPG
         // download(url);

        let x=new XMLHttpRequest();
        x.open( "GET", url , true);
        x.responseType="blob";
        x.onload= function(e){download(e.target.response, nameWithSize, "image/jpg");};
        x.send();

      });
    },
  };
})(jQuery, Drupal, drupalSettings);
