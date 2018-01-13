(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigSort = {
    attach: function (context, drupalSettings) {
      console.log('Drupal.behaviors.unigSort ');

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
    $(".unig-sortable").sortable("enable");

    // Fieldset
    $(".unig-toolbar-sort").slideDown();


    // Buttons
    $('.unig-button-sort-toggle').addClass('active');

    $(".unig-button-files-edit").addClass('disabled');
    $(".unig-button-files-preview").addClass('disabled');
    $('.unig-button-keywords-toggle-all').addClass('disabled');
    $('.unig-button-people-toggle-all').addClass('disabled');

    // Files
    $(".unig-sortable-only").show();
    $(".unig-sortable-hide").hide();


  }

  function sortDeactivate() {


    // Fieldset
    $(".unig-toolbar-sort").slideUp();


    // Buttons
    $('.unig-button-sort-toggle').removeClass('active');

    $(".unig-button-files-edit").removeClass('disabled');
    $(".unig-button-files-preview").removeClass('disabled');
    $('.unig-button-keywords-toggle-all').removeClass('disabled');
    $('.unig-button-people-toggle-all').removeClass('disabled');

    // Files
    $(".unig-sortable-only").hide();
    $(".unig-sortable-hide").show();

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