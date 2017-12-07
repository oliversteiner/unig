(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigSort = {
    attach: function (context, drupalSettings) {

      // Debug

      // onload
      constructor(context, drupalSettings);

    }
  };

  /**
   *
   * @param context
   * @param settings
   */
  function constructor(context, drupalSettings) {

// Buttons
    $('.unig-button-sort-toggle').click(function () {

      var $trigger = $(this);

      if ($trigger.hasClass('active')) {
        sortDeactivate();
      }
      else {
        sortActivate();

      }
    });

    $('.unig-button-sort-save').click(function () {
      saveSortOrder();
    });

    $('.unig-button-sort-cancel').click(function () {
      sortCancel();
    });

    $('.unig-button-sort-alphanumeric').click(function () {
      console.log('click', 'reset to alphabetical');
      resetToAlphanumeric();
    });


  }

  function sortActivate() {

    $(".unig-sortable").sortable({
      placeholder: "unig-sortable-placeholder",
      items      : "> li.unig-sortable-item",
      tolerance  : "pointer"
    });

    // Fieldset
    $(".unig-fieldset-sort").show();
    $(".unig-fieldset-keywords").hide();


    // Buttons
    $(".unig-button-sort-activate").show();
    $(".unig-button-files-edit").hide();
    $(".unig-button-files-preview").hide();
    $('.unig-button-sort-toggle').addClass('active');

    // Files
    $(".unig-sortable-reducer").addClass('unig-sortable-reducer-active');
    $(".unig-sortable-reducer-content").show();
    $(".unig-sortable-reducer-hide").hide();


  }

  function sortDeactivate() {


    // Fieldset
    $(".unig-fieldset-sort").hide();
    $(".unig-fieldset-keywords").show();


    // Buttons
    $(".unig-button-sort-activate").hide();
    $(".unig-button-files-edit").show();
    $(".unig-button-files-preview").show();
    $('.unig-button-sort-toggle').removeClass('active');


    // Files
    $(".unig-sortable-reducer").removeClass('unig-sortable-reducer-active');
    $(".unig-sortable-reducer-content").hide();
    $(".unig-sortable-reducer-hide").show();

    $(".unig-sortable").sortable("disable");


  }

  function sortCancel() {
    $(".unig-sortable").sortable("cancel");
    sortDeactivate();
  }

  function resetToAlphanumeric() {
    sortDeactivate();

    var name = 'reset';
    var data = $(".unig-sortable").sortable("serialize", {key: 'nid'});
    save(data, name);


    // save(data);
  }

  function saveSortOrder() {
    sortDeactivate();

    var name = 'save';
    var data = $(".unig-sortable").sortable("serialize", {key: 'nid'});
    save(data, name);

  }


  function save(data, name) {

    console.log(data);


    $.ajax({
      url     : Drupal.url('unig/sort/' + name),
      type    : 'POST',
      data    : {
        'data': data
      },
      dataType: 'json',
      success : function (results) {
        showMessages(results)
      }
    });

    return true;
  }

  function showMessages(results) {

    var messageContainer = $('.unig-message-container');
    var type = '';

    if (results) {


    }

  }


})(jQuery, Drupal, drupalSettings);