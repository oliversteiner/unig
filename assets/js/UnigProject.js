/* eslint-disable prettier/prettier,no-console */
/**
 * Created by ost on 14.05.17.
 */

(function ($, Drupal, drupalSettings) {
    Drupal.behaviors.unigProject = {



        toggleToolbox(nid, name) {
            // toggle Div
            const $target = $(`#unig-file-${nid} .unig-file-${name}-toolbox`);
            $target.slideToggle('fast');

            // toggle Button
            const $button = $(`#unig-file-${nid} .unig-file-${name}-toolbox-trigger`);
            $button.toggleClass('active');
        },

        toggleAllToolbox(name, modus) {
            // toggle Div
            const $target = $(`.unig-file-${name}-toolbox`);
            // toggle Button
            const $button = $(`.unig-file-${name}-toolbox-trigger`);
            const $buttonAll = $(`.unig-button-${name}-toggle-all`);

            switch (modus) {
                case 'hide':
                    $button.removeClass('active');
                    $buttonAll.removeClass('active');
                    $target.slideUp('fast');
                    break;
                case 'show':
                    $button.addClass('active');
                    $buttonAll.addClass('active');
                    $target.slideDown('fast');

                    break;

                default:
                    $button.toggleClass('active');
                    $target.slideToggle('fast');
                    break;
            }
        },

        toggleEditButtons() {
            $('.unig-file-download-mark').toggle();
            $('.unig-file-rating').toggle();
            $('.unig-file-head-info').toggle();
            $('.unig-file-middle').toggle();

            $('.unig-button-files-edit').toggle();
            $('.unig-button-files-preview').toggle();
            $('.unig-button-sort-toggle').toggle();
            $('.unig-fieldset-keywords').toggle();
            $('.unig-button-files-add').toggle();
        },

        getNodeId(context) {
            const $elem = $('.unig-file-item', context).parents('.unig-file-item');
            const nid = $elem.data('unig-file-nid');
            return nid;
        },

        showMessages(results) {
            const messageContainer = $('.unig-messages-container');
            const type = '';

            if (results) {
                results.messages.forEach((index, item) => {
                });
            }
        },

        save(data, route) {
            $.ajax({
                url: Drupal.url(`unig/${route}`),
                type: 'POST',
                data: {
                    data: data
                },
                dataType: 'json',
                success(results) {
                    this.showMessages(results);
                }
            });

            return true;
        },

        setRating(nid, direction) {
            const $badge = $(`#unig-file-${nid} .unig-file-rating-badge`);
            const $input = $(`#unig-file-${nid} .unig-file-rating-input`);

            const number = parseInt($input.val(), 10);
            // console.log('number ', number);

            let numberNew = 0;
            if (direction === 'up') {
                numberNew = number + 1;
            } else {
                numberNew = number - 1;
            }
            $input.val(numberNew);
            $badge.html(numberNew);
            if (numberNew !== 0) {
                $badge.addClass('active');
            } else {
                $badge.removeClass('active');
            }
            if (numberNew > 0) {
                $badge.removeClass('negativ');
                $badge.addClass('positiv');
            }
            if (numberNew < 0) {
                $badge.addClass('negativ');
                $badge.removeClass('positiv');
            }
            if (numberNew === 0) {
                $badge.removeClass('negativ');
                $badge.removeClass('positiv');
            }

            const data = {
                nid,
                value: numberNew
            };

            const route = 'rating/save';

            this.save(data, route);
        },

        attach(context, settings) {



            $('#unig-main', context)
                .once('unigProject2')
                .each(() => {
                    console.log('Drupal.behaviors.unigProject');

                    // onload
                    $('*[id^=\'lightgallery-\']').lightGallery({
                        selector: '.lightgallery-item'
                    });

                    // Toggle all Keywords
                    $('.unig-button-keywords-toggle-all', context).click(() => {
                        const $trigger = $(this);
                        if ($trigger.hasClass('active')) {
                            this.toggleAllToolbox('keywords', 'hide');
                        } else {
                            this.toggleAllToolbox('keywords', 'show');
                        }
                    });

                    // Toggle all People
                    $('.unig-button-people-toggle-all', context).click(() => {
                        const $trigger = $(this);
                        if ($trigger.hasClass('active')) {
                            this.toggleAllToolbox('people', 'hide');
                        } else {
                            this.toggleAllToolbox('people', 'show');
                        }
                    });

                    // Edit - Show all buttons
                    $('.unig-project-edit-trigger', context).click(() => {
                        this.toggleEditButtons(context);
                    });

                    // Preview - Hide all buttons
                    $('.unig-project-preview-trigger', context).click(() => {
                        this.toggleEditButtons(context);
                    });

                    // Event Handlers
                    $('.unig-gallery-preview-wrapper img', context).hover(() => {
                        $(this)
                            .parents('.unig-file-edit')
                            .toggleClass('active');
                    });

                    // Rating Down
                    $('.unig-file-rating-down-trigger', context).click(elem => {
                        const nid = this.getNodeId(elem);
                        this.setRating(nid, 'down');

                        console.log(`${nid}: Down!`);
                    });

                    // Rating Up
                    $('.unig-file-rating-up-trigger', context).click(elem => {
                        const nid = this.getNodeId(elem);

                        this.setRating(nid, 'up');
                        // console.log(nid + ': Up!');
                    });

                    // Toggle Keywords Toolbox
                    $('.unig-file-keywords-toolbox-trigger', context).click(elem => {
                        const name = 'keywords';
                        const nid = this.getNodeId(elem);
                        this.toggleToolbox(nid, name);
                    });

                    // Toggle People Toolbox
                    $('.unig-file-people-toolbox-trigger', context).click(elem => {
                        const name = 'people';
                        const nid = this.getNodeId(elem);
                        this.toggleToolbox(nid, name);
                    });

                    // Toggle Download Toolbox
                    $('.unig-file-download-toolbox-trigger', context).click(elem => {
                        const name = 'download';
                        const nid = this.getNodeId(elem);
                        this.toggleToolbox(nid, name);
                    });

                    // Toggle Options Toolbox
                    $('.unig-file-options-toolbox-trigger', context).click(elem => {
                        const name = 'options';
                        const nid = this.getNodeId(elem);
                        this.toggleToolbox(nid, name);
                    });

                    // Toggle Meta Info Toolbox
                    $('.unig-file-metainfo-toolbox-trigger', context).click(elem => {
                        const name = 'metainfo';
                        const nid = this.getNodeId(elem);
                        this.toggleToolbox(nid, name);
                    });

                    // Close Message Generate Images
                    $('.unig-messages-generate-images-close-trigger', context).click(() => {
                       $('.unig-messages-generate-images').hide();
                    });

                    // New Album Form
                    $('.ajax-container-new-album-trigger', context).click(() => {
                        const $container = $('#ajax-container-new-album-container');
                        $container.toggle();

                        const $formElemProjectNid = $('input[name=\'projectNid\']');
                        const projectNid = $container.data('projectnid');
                        $formElemProjectNid.val(projectNid);
                    });





                        // Button Generate Preview Images
                        $('#unig-main', context)
                            .once('previewimagestrigger')
                            .each(() => {
                                $('.unig-generate-preview-images-trigger', context).click(() => {
                                    Drupal.behaviors.unigLazyLoad.generatePreviewImages(context);
                                });
                            });

                });

        }
    };
})(jQuery, Drupal, drupalSettings);
