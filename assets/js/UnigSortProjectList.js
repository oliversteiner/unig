(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigSortProjectList = {
    attach: function (context, drupalSettings) {
      console.log('Drupal.behaviors.unigSortProjectList ');

      // onload
      this.constructor(context, drupalSettings);
    },

    $sort_toggle_trigger: $('.unig-sort-toggle-trigger'),


    /**
     *
     * @param context
     * @param settings
     */
    constructor: function (context, drupalSettings) {

// Buttons
      this.$sort_toggle_trigger.click(function () {


        if ($('.unig-button-sort-toggle').hasClass('active')) {
          Drupal.behaviors.unigSortProjectList.sortDeactivate();
        }
        else {
          Drupal.behaviors.unigSortProjectList.sortActivate();

        }
      });

      $('.unig-sort-save-trigger').click(function () {
        Drupal.behaviors.unigSortProjectList.saveSortOrder();
      });

      $('.unig-sort-cancel-trigger').click(function () {
        Drupal.behaviors.unigSortProjectList.sortCancel();
      });

      $('.unig-sort-alphanumeric-trigger').click(function () {
        Drupal.behaviors.unigSortProjectList.resetToAlphanumeric();
      });


    },

    sortActivate: function () {

      $(".unig-sortable").sortable({
        placeholder: "unig-sortable-placeholder",
        items      : "> li.unig-sortable-item",
        tolerance  : "pointer"
      });
      $(".unig-sortable").sortable("enable");

      // Fieldset
      $(".unig-toolbar-sort").slideDown();


      // Buttons
      $('.unig-button-sort-toggle').addClass('active');


    },

    sortDeactivate: function () {


      // Fieldset
      $(".unig-toolbar-sort").slideUp();

      // Buttons
      $('.unig-button-sort-toggle').removeClass('active');

      $(".unig-sortable").sortable("disable");


    },

    sortCancel: function () {
      $(".unig-sortable").sortable("cancel");
      Drupal.behaviors.unigSortProjectList.sortDeactivate();
    },

    resetToAlphanumeric: function () {
      Drupal.behaviors.unigSortProjectList.sortDeactivate();

      var name = 'reset';
      var data = $(".unig-sortable").sortable("serialize", {key: 'nid'});
      Drupal.behaviors.unigSortProjectList.save(data, name);


      // save(data);
    },

    saveSortOrder: function () {
      Drupal.behaviors.unigSortProjectList.sortDeactivate();

      var name = 'save';
      var data = $(".unig-sortable").sortable("serialize", {key: 'nid'});
      Drupal.behaviors.unigSortProjectList.save(data, name);

    },

    save: function (data, name) {



      $.ajax({
        url     : Drupal.url('unig/sort/' + name),
        type    : 'POST',
        data    : {
          'data': data
        },
        dataType: 'json',
        success : function (results) {
          Drupal.behaviors.unig.showMessages(results)
        }
      }).then(function (value) {
        location.reload();

      });

      return true;

    },


  }
})(jQuery, Drupal, drupalSettings);