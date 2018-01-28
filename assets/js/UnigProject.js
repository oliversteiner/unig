/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

      'use strict';

      Drupal.behaviors.unigProject = {
        attach: function (context, settings) {
          console.log('Drupal.behaviors.unigAdmin');


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
          $('.unig-project-edit-trigger').click(function (context) {
            toggleEditButtons(context);
          });

          // Preview - Hide all buttons
          $('.unig-project-preview-trigger').click(function (context) {
            toggleEditButtons(context);
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

               // console.log(nid + ': Down!');
              }
          );

          // Rating Up
          $('.unig-file-rating-up-trigger').click(
              function (context, settings) {

                var nid = getNodeId(context);

                setRating(nid, 'up');
              // console.log(nid + ': Up!');
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


          // Toggle Meta Info Toolbox
          $('.unig-file-metainfo-toolbox-trigger').click(
              function (context, settings) {

                var name = 'metainfo';
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





      function getNodeId(context) {

        var $elem = $(context.target).parents(".unig-file-item");
        var nid = $elem.data('unig-file-nid');
        return nid;
      }

      function setRating(nid, direction) {

        var $badge = $('#unig-file-' + nid + ' .unig-file-rating-badge');
        var $input = $('#unig-file-' + nid + ' .unig-file-rating-input');

        var number = parseInt($input.val());
        // console.log('number ', number);

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

        var data = {
          nid  : nid,
          value: number_new
        };

        var route = 'rating/save';

        save(data, route);

      }




      function save(data, route) {



        $.ajax({
          url     : Drupal.url('unig/' + route),
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

        var messageContainer = $('.unig-messages-container');
        var type = '';

        if (results) {

          results.messages.forEach(function (index, item) {


          })

        }
      }
    }

)
(jQuery, Drupal, drupalSettings);

