/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

      'use strict';

      Drupal.behaviors.unigAdmin = {
        attach: function (context, settings) {
          console.log('Drupal.behaviors.unigAdmin');


          // onload
          constructor(context, settings);


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



        }
      };

      function constructor(context, settings) {


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

      function saveThemeToLocalStorage(data, route) {

        console.log(data);


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

            console.log(' ', item.message);

          })

        }
      }
    }

)
(jQuery, Drupal, drupalSettings);

