/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

      'use strict';

      Drupal.behaviors.unigAdmin = {
        attach: function (context, settings) {
          console.log('Drupal.behaviors.unigAdmin');


          // onload
          this.constructor(context, settings);

        },


        constructor: function (context, settings) {

          // Theme - Default
          $('.unig-theme-dark-trigger').click(function (context) {
            Drupal.behaviors.unigAdmin.changeTheme('dark');
            $('.unig-button-theme-dark').toggle();
            $('.unig-button-theme-default').toggle();
          });

          //  Theme - Dark
          $('.unig-theme-default-trigger').click(function (context) {
            Drupal.behaviors.unigAdmin.changeTheme('bright');
            $('.unig-button-theme-dark').toggle();
            $('.unig-button-theme-default').toggle();
          });

        },


        changeTheme: function (theme) {
          const class_prefix = 'unig-theme-';
          const theme_name = class_prefix + theme;

          const $main = $('#unig-main');
          const pattern = /\bunig-theme-\S+/g;
          // remove other Theme classes
          var matches = $main.attr('class').match(pattern);
          $.each(matches, function () {
            var className = this;
            $main.removeClass(className.toString());
          });


          // Add new Theme Class
          $main.addClass(theme_name);
        },

        saveThemeToLocalStorage: function () {



          return true;
        },

        showMessages: function (results) {

          var messageContainer = $('.unig-messages-container');
          var type = '';

          if (results) {

            results.messages.forEach(function (index, item) {

              console.log(' ', item.message);

            })

          }
        }
      }
    }
)
(jQuery, Drupal, drupalSettings);

