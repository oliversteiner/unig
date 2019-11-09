(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigDownload = {
    version: '1.0.0',
    isToolbarOpen: false,
    Store: {},
    downloadSize: {
      sd: 0,
      hd: 0,
      xl: 0,
    },
    downloadList: [],

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

    attach(context, settings) {
      // onload

      $('#unig-main', context)
        .once('unigDownload')
        .each(() => {
          this.constructor(context, settings);
        });
    },

    updateDownloadList() {
      this.calculateDownloadSize();
      this.buildThumbnails();
      this.updateInfo();
    },

    updateFiles() {
      $('.unig-button-download-add-current-to-list').hide();

      Drupal.behaviors.unigPeople.Visible = [];
      const peopleIds = Drupal.behaviors.unigPeople.Store.get();
      const keywordIds = Drupal.behaviors.unigKeywords.Store.get();
      const fullList = Drupal.behaviors.unigData.FileList.list;

      if (peopleIds.length > 0) {
        // hide all files with this tag

        if (fullList && fullList.length > 0) {
          for (const item of fullList) {
            const $elem = $(`#unig-file-${item.id}`);

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
                      Drupal.behaviors.unigPeople.Visible.push(item.id);
                    }
                  }
                } else {
                  $elem.show();
                  $elem.data('current', true);
                  Drupal.behaviors.unigPeople.Visible.push(item.id);
                }
              }
            }
          }
        }
      } else if (keywordIds.length > 0) {
        if (fullList && fullList.length > 0) {
          for (const item of fullList) {
            const $elem = $(`#unig-file-${item.id}`);
            $elem.hide();
            $elem.data('current', false);

            for (const keywords of item.keywords) {
              if (keywordIds.includes(parseInt(keywords.id))) {
                $elem.show();
                $elem.data('current', true);
                Drupal.behaviors.unigPeople.Visible.push(item.id);
              }
            }
          }
        }
      } else {
        // show all
        for (const item of fullList) {
          $(`#unig-file-${item.id}`).show();
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

    add(id) {
      this.Store.add(id);
      this.updateDownloadList();
      this.addMark(id);
    },

    remove(id) {
      this.Store.remove(id);
      this.updateDownloadList();
      this.removeMark(id);
    },

    toggle(id) {
      const result = this.Store.toggle(id);

      if (result) {
        this.removeMark(id);
      } else {
        this.addMark(id);
      }
    },

    addMark(id) {
      if (id) {
        // Mark Elem
        const elemTarget = document.querySelector(`#unig-file-${id}`);
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

    removeMark(id) {
      if (id) {
        // Mark Elem
        const elemTarget = document.querySelector(`#unig-file-${id}`);
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

    updateInfo() {
      // target
      const $targetButtonNumberOf = $('.unig-button .unig-dl-number-of');
      const $targetNumberOf = $('.unig-dl-number-of');

      // get Number
      const numberOfItems = this.Store.count();

      // Append to DOM
      $targetButtonNumberOf.html(numberOfItems);
      $targetNumberOf.html(numberOfItems);

      if (numberOfItems > 0) {
        $targetButtonNumberOf.addClass('badge badge-marked');
      } else {
        $targetButtonNumberOf.removeClass('badge badge-marked');
      }

      const sd = Drupal.behaviors.unig.humanFile_size(this.downloadSize.sd);
      const hd = Drupal.behaviors.unig.humanFile_size(this.downloadSize.hd);
      const xl = Drupal.behaviors.unig.humanFile_size(this.downloadSize.xl);

      this.$toolbar_sd.html(sd);
      this.$toolbar_hd.html(hd);
      this.$toolbar_xl.html(xl);
    },

    bulkDownloadStart(size) {
      $(`.unig-bulk-download-${size}-trigger`).addClass('active');

      // Set Download Message Container to Prozessing
      Drupal.behaviors.unigDownload.message_download_processing(size);

      const itemsForDownload = this.Store.get();
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
        `<button class="unig-button unig-button-cancel-download" onclick="Drupal.behaviors.unigDownload.bulkDownloadCancel()">${textCancel}</button>`;
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
      const itemsForDownload = this.Store.get();
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
              `<li class="unig-dl" id="unig-dl-${id}" data-id = "${id}">` +
              ` <div class="unig-dl-id">${id}</div>` +
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
        const id = $(this).data('id');
        Drupal.behaviors.unigDownload.remove(id);
        //   Drupal.behaviors.unigDownload.removeMark(id);
        //   Drupal.behaviors.unigDownload.calculateDownloadSize();
        //   Drupal.behaviors.unigDownload.updateInfo();
      });
    },

    clearDownloadList() {
      this.removeAll();
      this.updateDownloadList();
    },

    fillDownloadList() {
      this.addAll();
      this.updateDownloadList();
    },

    fillDownloadListWithCurrent() {
      this.addCurrent();
      this.addMarksToCurrent();
      this.updateDownloadList();
    },

    /**
     *
     *
     */
    removeAll() {
      this.Store.clear();
      this.removeAllMarks();
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
          if ($(`#unig-file-${item.id}`).data('current')) {
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
          if ($(`#unig-file-${item.id}`).data('current')) {
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

    restore() {
      console.log('Restore Download List');

      this.updateDownloadList();

      const downloadIDs = this.Store.get();
      downloadIDs.forEach(id => () => {
        this.addMark(id);
      });
    },

    /**
     * calculate download size
     *
     *
     */

    calculateDownloadSize() {
      const downloadIDs = this.Store.get();
      const allItems = Drupal.behaviors.unigData.FileList.get();

      // clear
      this.downloadSize = {
        sd: 0,
        hd: 0,
        xl: 0,
      };
      downloadIDs.forEach(id => {
        const file = allItems.find(item => item.id === id);

        if (file) {
          if (file.image.unig_sd) {
            const sd = file.image.unig_sd.file_size;
            this.downloadSize.sd += sd;
          }
          if (file.image.unig_hd) {
            const hd = file.image.unig_hd.file_size;
            this.downloadSize.hd += hd;
          }
          if (file.image.original) {
            const xl = file.image.original.file_size;
            this.downloadSize.xl += xl;
          }
        }
      });
    },

    /**
     *
     * @param context
     * @param settings
     */
    constructor(context, settings) {
      this.downloadList = [];

      this.Store = Object.assign(this.Store, Drupal.behaviors.unigStore);
      this.Store.init('download');
      this.restore();

      // Mark for Download
      $('.unig-file-download-mark-trigger', context).click(event => {
        // get Node ID
        const id = Drupal.behaviors.unig.getFileId(event);

        // Add to Download-List
        this.toggle(id);

        // Update Infos
        this.updateDownloadList();
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
          Drupal.behaviors.unigDownload.fillDownloadListWithCurrent(event);
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

        // TODO implement Download for  other Files then JPG
        // download(url);

        let x = new XMLHttpRequest();
        x.open('GET', url, true);
        x.responseType = 'blob';
        x.onload = function(e) {
          download(e.target.response, nameWithSize, 'image/jpg');
        };
        x.send();
      });
    },
  };
})(jQuery, Drupal, drupalSettings);
