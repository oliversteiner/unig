/* eslint-disable prettier/prettier */
/**
 * Created by ost on 14.05.17.
 */

(function ($, Drupal, drupalSettings) {
    Drupal.behaviors.unigAdmin = {
        attach(context, settings) {
            console.log('Drupal.behaviors.unigAdmin');


            // Theme - Default
            $('.unig-theme-dark-trigger',context).click(() => {
                Drupal.behaviors.unigAdmin.changeTheme('dark');
                $('.unig-button-theme-dark', context).toggle();
                $('.unig-button-theme-default', context).toggle();
            });

            //  Theme - Dark
            $('.unig-theme-default-trigger', context).click(() => {
                Drupal.behaviors.unigAdmin.changeTheme('bright');
                $('.unig-button-theme-dark', context).toggle();
                $('.unig-button-theme-default', context).toggle();
            });
        },

        changeTheme(theme) {
            const classPrefix = 'unig-theme-';
            const themeName = classPrefix + theme;

            const $main = $('#unig-main');
            const pattern = /\bunig-theme-\S+/g;
            // remove other Theme classes
            const matches = $main.attr('class').match(pattern);
            $.each(matches, function () {
                const className = this;
                $main.removeClass(className.toString());
            });

            // Add new Theme Class
            $main.addClass(themeName);
        },

        saveThemeToLocalStorage() {
            return true;
        },

        showMessages(results) {
            const messageContainer = $('.unig-messages-container');
            const type = '';

            if (results) {
                results.messages.forEach((index, item) => {
                });
            }
        }
    };
})(jQuery, Drupal, drupalSettings);
