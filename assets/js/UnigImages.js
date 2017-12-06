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

            var $trigger = $(this);
            if ($trigger.hasClass('active')) {
              toggleAllToolbox('keywords', 'hide');
            }
            else {
              toggleAllToolbox('keywords', 'show');
            }
          }
      );

      // Toggle all People
      $('.unig-button-people-toggle-all').click(
          function (context, settings) {


            var $trigger = $(this);
            if ($trigger.hasClass('active')) {
              toggleAllToolbox('people', 'hide');
            }
            else {
              toggleAllToolbox('people', 'show');
            }

          }
      );

      // Edit - Show all buttons
      $('.unig-button-files-edit').click(function (context) {
        toggleEditButtons(context);
      });

      // Preview - Hide all buttons
      $('.unig-button-files-preview').click(function (context) {
        toggleEditButtons(context);
      });


      // Theme - Default
      $('.unig-button-files-theme-dark').click(function (context) {
        changeTheme('dark');
        $('.unig-button-files-theme-dark').toggle();
        $('.unig-button-files-theme-default').toggle();
      });

      //  Theme - Dark
      $('.unig-button-files-theme-default').click(function (context) {
        changeTheme('default');
        $('.unig-button-files-theme-dark').toggle();
        $('.unig-button-files-theme-default').toggle();
      });


      // Event Handlers
      $('.unig-gallery-preview-wrapper img').hover(
          function (context, settings) {
            $(this).parents(".unig-file-edit").toggleClass('active');
          }
      );

      // Rating Down
      $('.unig-file-rating-down-trigger').click(
          function (context, settings) {

            var nid = getNodeId(context);
            setRating(nid, 'down');

            console.log(nid + ': Down!');
          }
      );

      // Rating Up
      $('.unig-file-rating-up-trigger').click(
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

  function toggleAllToolbox(name, modus) {

    // toggle Div
    var $target = $('.unig-file-' + name + '-toolbox');
    // toggle Button
    var $button = $('.unig-file-' + name + '-toolbox-trigger');
    var $button_all = $('.unig-button-' + name + '-toggle-all');


    switch (modus) {
      case 'hide':
        $button.removeClass('active');
        $button_all.removeClass('active');
        $target.slideUp('fast');
        break;
      case 'show':

        $button.addClass('active');
        $button_all.addClass('active');
        $target.slideDown('fast');

        break;

      default:
        $button.toggleClass('active');
        $target.slideToggle('fast');
        break;
    }


  }


  function toggleEditButtons() {


    $('.unig-file-download-mark').toggle();
    $('.unig-file-rating').toggle();
    $('.unig-file-head-info').toggle();
    $('.unig-file-middle').toggle();

    $('.unig-button-files-edit').toggle();
    $('.unig-button-files-preview').toggle();
    $('.unig-button-sort-toggle').toggle();
    $('.unig-fieldset-keywords').toggle();
    $('.unig-button-files-add').toggle();

  }


  function markForDownload(nid) {

    var $target = $('#unig-file-' + nid + ' .unig-file-download-mark');
    var $target_in_list = $('#unig-file-' + nid + ' .unig-file-download-list-mark');

    var $border = $('#unig-file-' + nid);

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

    var $badge = $('#unig-file-' + nid + ' .unig-file-rating-badge');
    var $input = $('#unig-file-' + nid + ' .unig-file-rating-input');

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
    if (number_new !== 0) {
      $badge.addClass('active');
    }
    else {
      $badge.removeClass('active');

    }
    if (number_new > 0) {
      $badge.removeClass('negativ');
      $badge.addClass('positiv');

    }
    if (number_new < 0) {
      $badge.addClass('negativ');
      $badge.removeClass('positiv');
    }
    if (number_new === 0) {
      $badge.removeClass('negativ');
      $badge.removeClass('positiv');
    }

  }

  /**
   *
   *
   *
   */
  function changeTheme(theme) {
    const class_prefix = 'unig-theme-';
    const theme_name = class_prefix + theme;

    const $main = $('main#content');
    const pattern = /\bunig-theme-\S+/g;
    // remove other Theme classes
    var matches = $main.attr('class').match(pattern);
    $.each(matches, function () {
      var className = this;
      $main.removeClass(className.toString());
    });


    // Add new Theme Class
    $main.addClass(theme_name);
  }

})
(jQuery, Drupal, drupalSettings);

