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

      // Toggle all Keywords
      $('.unig-button-keywords-toggle-all').click(
          function (context, settings) {

            toggleAllToolbox('keywords');
            $(this).toggleClass('active');
          }
      );

      // Toggle all People
      $('.unig-button-people-toggle-all').click(
          function (context, settings) {

            toggleAllToolbox('people');
            $(this).toggleClass('active');

          }
      );

      // Event Handlers
      $('.unig-gallery-preview-wrapper img').hover(
          function (context, settings) {
            $(this).parents(".unig-file-edit").toggleClass('active');
          }
      );

      // Rating Down
      $('.unig-image-rating-down-trigger').click(
          function (context, settings) {

            var nid = getNodeId(context);
            setRating(nid, 'down');

            console.log(nid + ': Down!');
          }
      );

      // Rating Up
      $('.unig-image-rating-up-trigger').click(
          function (context, settings) {

            var nid = getNodeId(context);

            setRating(nid, 'up');
            console.log(nid + ': Up!');
          }
      );

      // Mark for Download
      $('.unig-file-download-mark-trigger').click(
          function (context, settings) {

            var nid = getNodeId(context);

            markForDownload(nid);
          }
      );


      // Toggle Keywords Toolbox
      $('.unig-file-keywords-toolbox-trigger').click(
          function (context, settings) {

            var name = 'keywords';
            var nid = getNodeId(context);
            toggleToolbox(nid, name);
          }
      );

      // Toggle People Toolbox
      $('.unig-file-people-toolbox-trigger').click(
          function (context, settings) {

            var name = 'people';
            var nid = getNodeId(context);
            toggleToolbox(nid, name);
          }
      );

      // Toggle Download Toolbox
      $('.unig-file-download-toolbox-trigger').click(
          function (context, settings) {

            var name = 'download';
            var nid = getNodeId(context);
            toggleToolbox(nid, name);
          }
      );

      // Toggle Options Toolbox
      $('.unig-file-options-toolbox-trigger').click(
          function (context, settings) {

            var name = 'options';
            var nid = getNodeId(context);
            toggleToolbox(nid, name);
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

  function toggleToolbox(nid, name) {

    // toggle Div
    var $target = $('#unig-file-' + nid + ' .unig-file-' + name + '-toolbox');
    $target.slideToggle('fast');

    // toggle Button
    var $button = $('#unig-file-' + nid + ' .unig-file-' + name + '-toolbox-trigger');
    $button.toggleClass('active');
  }

  function toggleAllToolbox(name) {

    // toggle Div
    var $target = $('.unig-file-' + name + '-toolbox');
    $target.slideToggle('fast');

    // toggle Button
    var $button = $('.unig-file-' + name + '-toolbox-trigger');
    $button.toggleClass('active');
  }


  function markForDownload(nid) {

    var $target = $('#unig-file-' + nid + ' .unig-file-download-mark');
    var $target_in_list = $('#unig-file-' + nid + ' .unig-file-download-list-mark');

    var $border = $('#unig-file-' + nid);

    console.log('target download marked ', $target);

    $target.toggleClass('marked');
    $border.toggleClass('marked');
    $target_in_list.toggleClass('marked');

  }


  function getNodeId(context) {

    var $elem = $(context.target).parents(".unig-file-item");
    var nid = $elem.data('unig-file-nid');
    return nid;
  }

  function setRating(nid, direction) {

    var $badge = $('#unig-file-' + nid + ' .unig-image-rating-badge');
    var $input = $('#unig-file-' + nid + ' .unig-image-rating-input');

    var number = parseInt($input.val());
    console.log('number ', number);

    var number_new = 0;
    if (direction === 'up') {
      number_new = number + 1;
    }
    else {
      number_new = number - 1;

    }
    $input.val(number_new);
    $badge.html(number_new);

  }

  /**
   *
   *
   *
   */


})
(jQuery, Drupal, drupalSettings);

