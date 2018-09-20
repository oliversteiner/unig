(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigDownload = {
    attach(context, settings) {
      // onload
      console.log("Drupal.behaviors.unigDownload ");

      this.constructor(context, settings);
    },

    isToolbarOpen: false,

    downloadsize: {},

    $toolbar_sd: $(".unig-file-download-table-size-sd"),
    $toolbar_hd: $(".unig-file-download-table-size-hd"),
    $toolbar_max: $(".unig-file-download-table-size-max"),

    $bulkDownloadMessageContainer: $(".unig-bulk-download-message-container"),

    toggleToolbar(context) {
      if (this.isToolbarOpen) {
        this.closeToolbar(context);
      } else {
        this.openToolbar(context);
      }
    },

    openToolbar(context) {
      const $toolbarArea = $(".unig-toolbar-download", context);
      const $toolbarAreaTrigger = $(
        ".unig-toolbar-download-toggle-trigger",
        context
      );

      $toolbarArea.slideDown();
      $toolbarArea.addClass("open");
      $toolbarAreaTrigger.addClass("active");
      this.isToolbarOpen = true;
    },

    closeToolbar(context) {
      const $toolbarArea = $(".unig-toolbar-download", context);
      const $toolbarAreaTrigger = $(
        ".unig-toolbar-download-toggle-trigger",
        context
      );

      $toolbarArea.slideUp();
      $toolbarArea.removeClass("open");
      $toolbarAreaTrigger.removeClass("active");
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
          nid
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
        const $target = $(`#unig-file-${nid} .unig-file-download-mark`);
        const $targetInList = $(
          `#unig-file-${nid} .unig-file-download-list-mark`
        );
        const $border = $(`#unig-file-${nid}`);

        $target.addClass("marked");
        $border.addClass("marked");
        $targetInList.addClass("marked");
      }
    },

    removeMark(nid) {
      if (nid) {
        const $target = $(`#unig-file-${nid} .unig-file-download-mark`);
        const $targetInList = $(
          `#unig-file-${nid} .unig-file-download-list-mark`
        );
        const $border = $(`#unig-file-${nid}`);

        $target.removeClass("marked");
        $border.removeClass("marked");
        $targetInList.removeClass("marked");
      }
    },

    toggleMark(nid) {
      const $target = $(`#unig-file-${nid} .unig-file-download-mark`);

      if ($target.hasClass("marked")) {
        // if item in list. toggle off
        this.removeMark(nid);
      } else {
        // if item  not in list. toggle on
        this.addMark(nid);
      }
    },

    updateInfo() {
      // target
      const $targetButtonNumberOf = $(".unig-button .unig-dl-number-of");
      const $targetNumberOf = $(".unig-dl-number-of");

      // get Number
      const numberOfItems = Drupal.behaviors.unigData.FilesForDownload.count();

      // Append to DOM
      $targetButtonNumberOf.html(numberOfItems);
      $targetNumberOf.html(numberOfItems);

      if (numberOfItems > 0) {
        $targetButtonNumberOf.addClass("badge badge-marked");
      } else {
        $targetButtonNumberOf.removeClass("badge badge-marked");
      }

      $(".unig-file-download-list-size-sd").html("0");

      const sd = Drupal.behaviors.unig.humanFileSize(this.downloadsize.sd);
      const hd = Drupal.behaviors.unig.humanFileSize(this.downloadsize.hd);
      const max = Drupal.behaviors.unig.humanFileSize(this.downloadsize.max);

      this.$toolbar_sd.html(sd);
      this.$toolbar_hd.html(hd);
      this.$toolbar_max.html(max);
    },

    bulkDownloadStart(size) {
      $(`.unig-bulk-download-${size}-trigger`).addClass("active");
      this.$bulk_download_message_container.html(
        `Start Download ${size} Paket`
      );

      const itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();
      const data = {
        size,
        projectname: size,
        items: itemsForDownload
      };

      // Set Download Message Container to Prozessing
      Drupal.behaviors.unigDownload.message_download_processing();

      $.ajax({
        url: Drupal.url("unig/download/"),
        type: "POST",
        data: {
          data,
          project_nid: Drupal.behaviors.unigData.project.nid
        },
        dataType: "json",
        success(results) {
          if (results.zip) {
            location.href = results.zip;
            Drupal.behaviors.unigDownload.message_download_ok(results.zip);
          } else {
            Drupal.behaviors.unigDownload.message_download_failed();
          }
        }
      });

      return true;
    },

    resetGui() {},

    bulkDownloadCancel() {
      const $bulkDownloadSd = $(".unig-bulk-download-sd-trigger");
      const $bulkDownloadHd = $(".unig-bulk-download-hd-trigger");
      const $bulkDownloadMax = $(".unig-bulk-download-max-trigger");

      this.$bulkDownloadMessageContainer.html();
      $bulkDownloadSd.removeClass("active");
      $bulkDownloadHd.removeClass("active");
      $bulkDownloadMax.removeClass("active");
    },

    message_box(mode) {
      if (mode) {
        mode = `-${mode}`;
      } else {
        mode = "";
      }
      this.$bulkDownloadMessageContainer.html(
        `<div class="unig-message-box${mode}">` +
          `   <div class="unig-message-box-close-trigger"><i class="fa fa-close" aria-hidden="true"></i></div>` +
          `   <div class="unig-message-box-body">` +
          `   </div>` +
          `</div>`
      );
      $(".unig-message-box-close-trigger").click(() => {
        $(".unig-bulk-download-message-container").slideUp("fast", function() {
          // remove content from div
          $(this).html("");
          // display empty div
          $(this).show();
        });
      });
    },

    message_download_processing() {
      const mode = "";
      this.message_box(mode);

      $(".unig-message-box-body").html(
        '<div class="unig-message-box-picto"><i class="fa fa-circle-o-notch fa-spin fa-fw"></i></div>' +
          '<span class="sr-only">Loading...</span>' +
          "Ein Zip-Archiv mit den Bildern wird erstellt. Bitte warten." +
          '<button onclick="Drupal.behaviors.unigDownload.bulkDownloadCancel()">' +
          "Download abbrechen</button>"
      );
    },

    message_download_ok(url) {
      const mode = "success";
      this.message_box(mode);

      $(".unig-message-box-body").html(
        `${'<div class="unig-message-box-picto">' +
          '<i class="fa fa-check-circle-o color-success"></i>' +
          '<span class="sr-only">OK</span>' +
          "</div>" +
          "<div>Der Download ist bereit.</div>" +
          "<div>" +
          "Sollte der Download nicht automatisch starten: " +
          '<a href="'}${url}">hier klicken.</a></div>`
      );
    },

    message_download_failed() {
      const mode = "warning";
      this.message_box(mode);

      $(".unig-message-box-body").html(
        '<div class="unig-message-box-picto" >' +
          '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>' +
          '<span class="sr-only">Error</span>' +
          "</div>" +
          "<div>Es ist ein Fehler aufgetreten beim erstellen des Zips.</div>" +
          "<div>Bitte die Seite neu laden und noch einmal versuchen.</div>"
      );
    },

    buildTumbnails() {
      // Target
      const $area = $(".unig-dl-tumbnails");

      // get Item List
      const itemsForDownload = Drupal.behaviors.unigData.FilesForDownload.get();
      const itemList = Drupal.behaviors.unigData.FileList.get();
      // console.log('itemList ', itemList);

      let elemLi = "";
      if (itemsForDownload) {
        itemsForDownload.forEach(elem => {
          // console.log('itemsForDownload.forEach ', elem);

          // check
          const item = itemList[elem];

          // console.log('item ', item);

          if (item && item.title) {
            const label = item.title;
            const imgSrc = item.image.unig_small.url;

            elemLi +=
              `<li class="unig-dl" id="unig-dl-${elem}" data-nid = "${elem}">` +
              ` <div class="unig-dl-nid">${elem}</div>` +
              ` <div class="unig-dl-image item-overlay">` +
              `   <img src="${imgSrc}" />` +
              ` <div class="item-overlay-canvas top">` +
              `   <span class="item-overlay-text"><i class="fa fa-times" aria-hidden="true"></i>\n</span></div>` +
              ` </div>` +
              ` <div class="unig-dl-label">${label}</div>` +
              `</li>`;
          }
        });
      }

      const prefix = '<ul class="unig-dl">';
      const suffix = "</ul>";

      // Build DOM
      const html = prefix + elemLi + suffix;

      // Add tumbnail to dom
      $area.html(html);

      // Add Handler
      $("ul.unig-dl").on("click", "li", function() {
        const nid = $(this).data("nid");
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
      if (this.isFolderMax == true) {
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

      this.buildTumbnails();
      this.updateInfo();
    },

    clearDownloadList() {
      this.removeAll();
      this.removeAllMarks();
      this.buildTumbnails();
      this.calculateDownloadsize();
      this.refreshGUI();
      this.updateInfo();
      this.save();
    },

    fillDownloadList() {
      this.addAll();
      this.addAllMarks();
      this.buildTumbnails();
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
        for (const key in listItem) {
          this.removeMark(key);
        }
      }
    },

    addAllMarks() {
      const listItem = Drupal.behaviors.unigData.FileList.get();

      if (listItem) {
        for (const key in listItem) {
          this.addMark(key);
        }
      }
    },

    addAll() {
      this.removeAll();
      const listItem = Drupal.behaviors.unigData.FileList.get();

      if (listItem) {
        for (const key in listItem) {
          this.add(key);
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
        max: 0
      };

      if (itemsForDownload) {
        itemsForDownload.forEach(item => {
          const Downloadsize = Drupal.behaviors.unigDownload.downloadsize;
          const file = itemList[item];

          const sd = file.image.unig_big.filesize;
          const hd = file.image.unig_hd.filesize;
          const max = file.image.original.filesize;

          Downloadsize.sd += sd;
          Downloadsize.hd += hd;
          Downloadsize.max += max;
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
          }
        );
      }
      // Trigger

      // Mark for Download
      $(".unig-file-download-mark-trigger", context).click(event => {
        const Scope = Drupal.behaviors.unigDownload;

        // get Node ID
        const nid = Drupal.behaviors.unig.getNodeId(event);

        // Add to Download-List
        Scope.toggle(nid);

        // Mark as Download-Item
        Scope.toggleMark(nid);

        // Update Infos
        Scope.calculateDownloadsize();

        // Build Download Area
        Scope.refreshGUI();

        // Save to localStorage
        Drupal.behaviors.unigData.FilesForDownload.save();
      });

      // Add All Files to Download
      $(".unig-button-download-add-all-to-list-trigger", context).click(
        event => {
          Drupal.behaviors.unigDownload.fillDownloadList(event);
        }
      );

      // Clean Folder
      $(".unig-button-download-clear-list-trigger", context).click(event => {
        Drupal.behaviors.unigDownload.clearDownloadList(event);
      });

      // Close Toolbar
      $(".unig-toolbar-area-close-trigger", context).click(() => {
        Drupal.behaviors.unigDownload.closeToolbar(context);
      });

      // Open Toolbar
      $(".unig-toolbar-area-open-trigger", context).click(() => {
        Drupal.behaviors.unigDownload.closeToolbar(context);
      });

      // Toggle Toolbar
      $(".unig-toolbar-download-toggle-trigger", context).click(() => {
        Drupal.behaviors.unigDownload.toggleToolbar(context);
      });

      // Start Bulk Download
      $(".unig-bulk-download-sd-trigger", context).click(() => {
        Drupal.behaviors.unigDownload.bulkDownloadStart("sd");
      });

      $(".unig-bulk-download-hd-trigger", context).click(() => {
        Drupal.behaviors.unigDownload.bulkDownloadStart("hd");
      });

      $(".unig-bulk-download-max-trigger", context).click(() => {
        Drupal.behaviors.unigDownload.bulkDownloadStart("max");
      });

      $(".unig-file-download-list-direct").click(function() {
        const $target = $(this).find("unig-file-download-list-picto");
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
