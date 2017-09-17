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
  var all_col = $('.unig-file-edit-col');
  console.log(all_col);

  all_col.each(function (key, value) {

    var currentId = $(this).attr('id');
    console.log(currentId);

  });


} // loadAllImages


})
(jQuery, Drupal, drupalSettings);

