/**
 * Created by ost on 14.05.17.
 */


(function ($, Drupal, drupalSettings) {

    'use strict';

    Drupal.behaviors.unigUploadBehavior = {
        attach: function (context, settings) {

            // Debug
             console.log('unigUploadBehavior');

            // onload
            constructor(context, settings);

            // Event Handlers
            // Change
            $('#edit-project').change(function (context, settings) {
                selectChange(context, settings);
            });

            // wenn ein Projekt gewählt ist, den Selector einstellen:
            // werk einlesen
            var project_nid = $("input[name=project_nid]").val();
            // Option wechseln
            $('#edit-project').val(project_nid);

            console.log(project_nid);
        }
    };

    /**
     *
     * @param context
     * @param settings
     */
    function constructor(context, settings) {
        selectChange(context, settings);
    }

    /**
     *
     * @param context
     * @param settings
     */
    function selectChange(context, settings) {

        // Get the selected Option
        var e = document.getElementById("edit-project");
        var select = e.options[e.selectedIndex].value;

        if (select === 'neu') {
            $('#unig_form_upload_new_project').show();
        }
        else {
            $('#unig_form_upload_new_project').hide();
        }
    }


})(jQuery, Drupal, drupalSettings);

