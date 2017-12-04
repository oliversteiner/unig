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
      $('.unig-file-options-trigger').click(
          function (context, settings) {
            toggleTools(context);
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
            console.log(nid + ': Mark for Download!');
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


  function toggleDownloadToolbox(nid) {

    // toggle Div
    var $target = $('#unig-file-' + nid + ' .unig-file-download-toolbox');
    $target.slideToggle('fast');

    // toggle Button
    var $button = $('#unig-file-' + nid + ' .unig-file-download-toolbox-trigger');
    $button.toggleClass('active');
  }


  function toggleOptionsToolbox(nid) {

    // toggle Div
    var $target = $('#unig-file-' + nid + ' .unig-file-options-toolbox');
    $target.slideToggle('fast');

    // toggle Button
    var $button = $('#unig-file-' + nid + ' .unig-file-options-toolbox-trigger');
    $button.toggleClass('active');

  }

  function toggleTools(context) {

    var $elem = $(context.target);
    var file_nid = $elem.data('unig-file-nid');

    var $toolbar = $('#unig-file-toolbar-' + file_nid);

    console.log($elem);
    $toolbar.toggle();

  }

  function markForDownload(nid) {

    var $target = $('#unig-file-' + nid + '.unig-file-download-mark');
    $target.toggleClass('marked');
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

