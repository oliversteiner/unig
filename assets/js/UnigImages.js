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
      // mouseover
      $('.unig-file-edit-col.views-col').click(
          function () {
            alert('go');
          }
      );

      $('.unig-file-edit-col').hover(
          function (context, settings) {
            showTools(context, settings);
          },
          function (context, settings) {
            console.log('aut');
          });


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
    loadAllImages();
  }


  function showTools(context, settings) {


    var currentId = $(this).attr('id');
    $(this).toggleClass("result_hover");
    console.log('hover - ' + currentId);

  }


  /**
   *
   *
   *
   */

  function loadAllImages() {

    // hole alle bilder
    var $unig_file_set_cover = $('.unig-file-set-cover');
    console.log($unig_file_set_cover);

    $unig_file_set_cover.each(function (key, value) {

      var nid = $(value).data('unig-cover');
      console.log(nid);


    });


  } // loadAllImages


})
(jQuery, Drupal, drupalSettings);

