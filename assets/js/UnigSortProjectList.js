/* eslint-disable prettier/prettier,no-console */
(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigSortProjectList = {
    attach(context, drupalSettings) {
      console.log("Drupal.behaviors.unigSortProjectList ");

      // onload
      this.constructor(context, drupalSettings);
    },

    $sort_toggle_trigger: $(".unig-sort-list-toggle-trigger"),

    /**
     *
     * @param context
     * @param settings
     */
    constructor(context, settings) {
      // Buttons
      this.$sort_toggle_trigger.click(() => {
        if ($(".unig-button-sort-list-toggle").hasClass("active")) {
          Drupal.behaviors.unigSortProjectList.sortDeactivate();
        } else {
          Drupal.behaviors.unigSortProjectList.sortActivate();
        }
      });

      $(".unig-sort-list-save-trigger", context).click(() => {
        Drupal.behaviors.unigSortProjectList.saveSortOrder();
      });

      $(".unig-sort-list-cancel-trigger", context).click(() => {
        Drupal.behaviors.unigSortProjectList.sortCancel();
      });

      $(".unig-sort-list-alphanumeric-trigger", context).click(() => {
        Drupal.behaviors.unigSortProjectList.resetToAlphanumeric();
      });

      $(".unig-sort-list-date-trigger", context).click(() => {
        Drupal.behaviors.unigSortProjectList.resetToDate();
      });
    },

    sortActivate() {
      $(".unig-sortable").sortable({
        placeholder: "unig-sortable-placeholder",
        items: "> li.unig-sortable-item",
        tolerance: "pointer"
      });
      $(".unig-sortable").sortable("enable");

      // Fieldset
      $(".unig-toolbar-sort").slideDown();

      // Buttons
      $(".unig-button-sort-toggle").addClass("active");
    },

    sortDeactivate() {
      // Fieldset
      $(".unig-toolbar-sort").slideUp();

      // Buttons
      $(".unig-button-sort-toggle").removeClass("active");

      $(".unig-sortable").sortable("disable");
    },

    sortCancel() {
      $(".unig-sortable").sortable("cancel");
      Drupal.behaviors.unigSortProjectList.sortDeactivate();
    },

    resetToDate() {
      Drupal.behaviors.unigSortProjectList.sortDeactivate();

      const mode = "date";
      const nids = $(".unig-sortable")
        .sortable("serialize", { key: "nid" })
        .toString();
      const data = `${nids}&mode=${mode}`;
      const url = "mode";

      Drupal.behaviors.unigSortProjectList.save(data, url);
    },

    resetToAlphanumeric() {
      Drupal.behaviors.unigSortProjectList.sortDeactivate();

      const mode = "alphanumeric";
      const nids = $(".unig-sortable")
        .sortable("serialize", { key: "nid" })
        .toString();
        const data = `${nids}&mode=${mode}`;
        const url = "mode";

        Drupal.behaviors.unigSortProjectList.save(data, url);
    },

    saveSortOrder() {
      Drupal.behaviors.unigSortProjectList.sortDeactivate();

      const name = "save";
      const data = $(".unig-sortable").sortable("serialize", { key: "nid" });
      Drupal.behaviors.unigSortProjectList.save(data, name);
    },

    save(data, name) {
      $.ajax({
        url: Drupal.url(`unig/sort/${name}`),
        type: "POST",
        data: {
          data
        },
        dataType: "json",
        success(results) {
          Drupal.behaviors.unig.showMessages(results);
        }
      }).then(value => {
      //  location.reload();
      });

      return true;
    }
  };
})(jQuery, Drupal, drupalSettings);
