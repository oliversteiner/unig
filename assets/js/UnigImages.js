/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigImagesBehavior = {
    attach: function (context, settings) {


      // Debug
      console.log('unigImagesBehavior');

      // onload
      constructor(context, settings);


      // Event Handlers
      $('.unig-file-button-options').click(
          function (context, settings) {
            toggleTools(context);
          }
      );




      // New Album Form
      $('.ajax-container-new-album-trigger').click(function () {

        var $container = $('#ajax-container-new-album-container');
        $container.toggle();

        var $formElemProjectNid = $("input[name='project_nid']");
        var project_nid = $container.data('projectnid');
        $formElemProjectNid.val(project_nid);
      })
    }
  };

  function constructor(context, settings) {


    $("*[id^='lightgallery-']").lightGallery({
      selector: '.lightgallery-item'
    });


  }


  function toggleTools(context) {

    var $elem = $(context.target);
    var file_nid = $elem.data('unig-file-nid');

    var $toolbar = $('#unig-file-toolbar-' + file_nid);

    console.log($elem);
    $toolbar.toggle();





  }


  /**
   *
   *
   *
   */



})
(jQuery, Drupal, drupalSettings);

