/* eslint-disable prettier/prettier,no-console */
/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {


    function toggleToolbox(nid, name) {

        // toggle Div
        const $target = $(`#unig-file-${  nid  } .unig-file-${  name  }-toolbox`);
        $target.slideToggle('fast');

        // toggle Button
        const $button = $(`#unig-file-${  nid  } .unig-file-${  name  }-toolbox-trigger`);
        $button.toggleClass('active');
    }

    function toggleAllToolbox(name, modus) {

        // toggle Div
        const $target = $(`.unig-file-${  name  }-toolbox`);
        // toggle Button
        const $button = $(`.unig-file-${  name  }-toolbox-trigger`);
        const $buttonAll = $(`.unig-button-${  name  }-toggle-all`);


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

        const $elem = $(context.target).parents('.unig-file-item');
        const nid = $elem.data('unig-file-nid');
        return nid;
    }


    function showMessages(results) {

        const messageContainer = $('.unig-messages-container');
        const type = '';

        if (results) {

            results.messages.forEach((index, item) => {


            })

        }
    }


    function save(data, route) {

        $.ajax({
            url: Drupal.url(`unig/${  route}`),
            type: 'POST',
            data: {
                'data': data
            },
            dataType: 'json',
            success(results) {
                showMessages(results)
            }
        });

        return true;
    }

    function setRating(nid, direction) {

        const $badge = $(`#unig-file-${  nid  } .unig-file-rating-badge`);
        const $input = $(`#unig-file-${  nid  } .unig-file-rating-input`);

        const number = parseInt($input.val(), 10);
        // console.log('number ', number);

        let numberNew = 0;
        if (direction === 'up') {
            numberNew = number + 1;
        }
        else {
            numberNew = number - 1;

        }
        $input.val(numberNew);
        $badge.html(numberNew);
        if (numberNew !== 0) {
            $badge.addClass('active');
        }
        else {
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

        save(data, route);

    }


    function replaceImage(id, result) {

        const styleNames = ['unig_thumbnail', 'unig_medium', 'unig_hd'];
        let mode = '';
        const display = false;

        if (result.data) {

            for (const styleName of styleNames) {

                switch (styleName) {

                    case 'unig_thumbnail':
                        mode = 'small';
                        break;

                    case 'unig_medium':
                        mode = 'medium';
                        break;

                    case 'unig_hd':
                        mode = 'big';
                        break;

                    default :
                        mode = 'medium';
                        break;
                }
                console.log('mode:', mode);

                const src = result.data[styleName];
                const imgId = `img-${id}-${styleName}`;


                const NODEImg = document.createElement('img');
                NODEImg.setAttribute('src', src);
                NODEImg.setAttribute('alt', mode);
                NODEImg.setAttribute('id', imgId);

                console.log(`#unig-file-${id} .img-preview-${mode}`);

                const DomTarget = document.querySelector(`#unig-file-${id} .img-preview-${mode}`);
                DomTarget.innerHTML = '';
                DomTarget.appendChild(NODEImg);

                const DomTargetPreview = document.querySelector(`#no-preview-${mode}-${id}`);
                if (DomTargetPreview) {
                    DomTargetPreview.parentElement.removeChild(DomTargetPreview);
                }


                if (mode === 'medium') {
                    DomTarget.setAttribute('style', 'block')
                }

            }

                const DomTargetPreviewSpinner = document.querySelector(`#no-preview-spinner-${id}`);
                if (DomTargetPreviewSpinner) {
                    DomTargetPreviewSpinner.parentElement.removeChild(DomTargetPreviewSpinner);
                }


        }

    }

    function spinnerPlaceholder(id, context) {
        $('#unig-main', context).once(`preview-${id}`).each(() => {


            const ElemSpinner = document.createElement('div');
            ElemSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            ElemSpinner.setAttribute('id', `no-preview-spinner-${id}`);
            ElemSpinner.setAttribute('class', `no-preview-spinner`);

            const DomTarget = document.querySelector(`#unig-file-${id} .unig-lazyload-container`);
            DomTarget.append(ElemSpinner);


            const DomTargetPreviewSmall = document.querySelector(`#no-preview-small-${id}`);
            if (DomTargetPreviewSmall) {
                DomTargetPreviewSmall.parentElement.removeChild(DomTargetPreviewSmall);
            }

            const DomTargetPreviewMedium = document.querySelector(`#no-preview-medium-${id}`);
            if (DomTargetPreviewMedium) {
                DomTargetPreviewMedium.parentElement.removeChild(DomTargetPreviewMedium);
            }

            const DomTargetPreviewBig = document.querySelector(`#no-preview-big-${id}`);
            if (DomTargetPreviewBig) {
                DomTargetPreviewBig.parentElement.removeChild(DomTargetPreviewBig);
            }

            var logo = document.getElementById('sologo');


        });

    }

    Drupal.behaviors.unigProject = {
        attach(context, settings) {

            $('#unig-main', context).once('unigProject2').each(() => {

                console.log('Drupal.behaviors.unigProject');


                // onload
                $('*[id^=\'lightgallery-\']').lightGallery({
                    selector: '.lightgallery-item'
                });

                // Toggle all Keywords
                $('.unig-button-keywords-toggle-all', context).click(() => {

                        const $trigger = $(this);
                        if ($trigger.hasClass('active')) {
                            toggleAllToolbox('keywords', 'hide');
                        }
                        else {
                            toggleAllToolbox('keywords', 'show');
                        }
                    }
                );

                // Toggle all People
                $('.unig-button-people-toggle-all', context).click(
                    () => {


                        const $trigger = $(this);
                        if ($trigger.hasClass('active')) {
                            toggleAllToolbox('people', 'hide');
                        }
                        else {
                            toggleAllToolbox('people', 'show');
                        }

                    }
                );

                // Edit - Show all buttons
                $('.unig-project-edit-trigger', context).click(() => {
                    toggleEditButtons(context);
                });

                // Preview - Hide all buttons
                $('.unig-project-preview-trigger', context).click(() => {
                    toggleEditButtons(context);
                });


                // Event Handlers
                $('.unig-gallery-preview-wrapper img', context).hover(
                    () => {
                        $(this).parents('.unig-file-edit').toggleClass('active');
                    }
                );

                // Rating Down
                $('.unig-file-rating-down-trigger', context).click(
                    (elem) => {

                        const nid = getNodeId(elem);
                        setRating(nid, 'down');

                        console.log(`${nid  }: Down!`);
                    }
                );

                // Rating Up
                $('.unig-file-rating-up-trigger', context).click(
                    (elem) => {

                        const nid = getNodeId(elem);

                        setRating(nid, 'up');
                        // console.log(nid + ': Up!');
                    }
                );


                // Toggle Keywords Toolbox
                $('.unig-file-keywords-toolbox-trigger', context).click(
                    (elem) => {

                        const name = 'keywords';
                        const nid = getNodeId(elem);
                        toggleToolbox(nid, name);
                    }
                );

                // Toggle People Toolbox
                $('.unig-file-people-toolbox-trigger', context).click(
                    (elem) => {

                        const name = 'people';
                        const nid = getNodeId(elem);
                        toggleToolbox(nid, name);
                    }
                );

                // Toggle Download Toolbox
                $('.unig-file-download-toolbox-trigger', context).click(
                    (elem) => {

                        const name = 'download';
                        const nid = getNodeId(elem);
                        toggleToolbox(nid, name);
                    }
                );

                // Toggle Options Toolbox
                $('.unig-file-options-toolbox-trigger', context).click(
                    (elem) => {

                        const name = 'options';
                        const nid = getNodeId(elem);
                        toggleToolbox(nid, name);
                    }
                );


                // Toggle Meta Info Toolbox
                $('.unig-file-metainfo-toolbox-trigger', context).click(
                    (elem) => {

                        const name = 'metainfo';
                        const nid = getNodeId(elem);
                        toggleToolbox(nid, name);
                    }
                );

                // New Album Form
                $('.ajax-container-new-album-trigger', context).click(() => {

                    const $container = $('#ajax-container-new-album-container');
                    $container.toggle();

                    const $formElemProjectNid = $('input[name=\'projectNid\']');
                    const projectNid = $container.data('projectnid');
                    $formElemProjectNid.val(projectNid);
                });

                // Button Generate Preview Images
                $('#unig-main', context).once('previewimagestrigger').each(() => {

                    $('.unig-generate-preview-images-trigger', context).click(() => {


                        const nids = Drupal.behaviors.unigLazyLoad.nodeIDsWithNoPreviews;
                        console.log(nids);

                        nids.forEach(nid => {


                            // add spinner
                            spinnerPlaceholder(nid, context);

                            $.ajax({
                                url: Drupal.url(`unig/imagestyles/${nid}`),
                                type: 'get',
                                dataType: 'json',
                                success(results) {
                                    console.log(results);
                                    replaceImage(nid, results);
                                }
                            });
                        });


                        return true;


                    });
                });
            });

        }
    }


})(jQuery, Drupal, drupalSettings);
