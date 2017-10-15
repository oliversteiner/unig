(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigSort = {
    attach: function (context, drupalSettings) {

      // Debug


      // onload
      constructor(context, drupalSettings);


      $('.unig-button-sort-activate').click(function () {
        sortActivate(context);
      });

      $('.unig-button-sort-save').click(function () {
        sortSave(context);
      });

      $('.unig-button-sort-cancel').click(function () {
        sortCancel(context);
      });

      // Sortable

      $(".unig-sortable").sortable({
        placeholder: "unig-sortable-placeholder",
        items      : "> li.unig-sortable-item",
        tolerance: "pointer"


      });

      $(".unig-sortable").on("sortactivate", function (event, ui) {
        sortActivate();

      });


    }
  };

  /**
   *
   * @param context
   * @param settings
   */
  function constructor(context, drupalSettings) {

  }

  function sortActivate() {

    $(".unig-sortable-reducer").addClass('unig-sortable-reducer-active');
    $(".unig-sortable-reducer-content").show();
    $(".unig-sortable-reducer-hide").hide();

    // Buttons
    $(".unig-button-sort-activate").hide();
    $(".unig-button-sort-save").show();
    $(".unig-button-sort-cancel").show();

  }

  function sortCancel() {

    $(".unig-sortable-reducer").removeClass('unig-sortable-reducer-active');
    $(".unig-sortable-reducer-content").hide();
    $(".unig-sortable-reducer-hide").show();


    // Buttons
    $(".unig-button-sort-activate").show();
    $(".unig-button-sort-save").hide();
    $(".unig-button-sort-cancel").hide();

    $(".unig-sortable").sortable( "cancel" );

  }

  function sortSave() {

    $(".unig-sortable-reducer").removeClass('unig-sortable-reducer-active');
    $(".unig-sortable-reducer-content").hide();
    $(".unig-sortable-reducer-hide").show();


    // Buttons
    $(".unig-button-sort-activate").show();
    $(".unig-button-sort-save").hide();
    $(".unig-button-sort-cancel").hide();

    var sorted = $( ".unig-sortable" ).sortable( "serialize" ,{ key:'nid'});

    console.log(sorted);

    $.ajax({
      url     : Drupal.url('unig/sort_project'),
      type    : 'POST',
      data    : {
        'data'       : sorted
      },
      dataType: 'json',
      success : function (results) {
        console.log(results);
      }
    });
  }




})(jQuery, Drupal, drupalSettings);