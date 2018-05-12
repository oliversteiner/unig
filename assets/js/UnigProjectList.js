(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigProjectList = {
    attach: function (context, drupalSettings) {
      console.log('Drupal.behaviors.unigProjectList');

      // Debug


      // onload
      constructor(context, drupalSettings);

      // Buttons
      $('.unig-project-save-trigger').click(function (context, drupalSettings) {
        saveProject(context, drupalSettings);
      });

      $('.unig-project-cancel-trigger').click(function (context) {
        resetProject(context);
      });

      $('.unig-project-edit-trigger').click(function (context) {
        toggleEdit(context);
      });


    }
  };

  /**
   *
   * @param context
   * @param settings
   */
  function constructor(context, drupalSettings) {


  }


  /**
   *
   *
   * @param context
   */
  function toggleEdit(context) {
    var $elem = $(context.target);
    var project_nid = $elem.data('unig-project-nid');

    var $elem = $('#unig-project-edit-container-' + project_nid);
    $elem.toggle();

    var $elem = $('#unig-project-normal-container-' + project_nid);
    $elem.toggle();

  }


  /**
   *
   *
   * @param context
   * @param drupalSettings
   */
  function saveProject(context, drupalSettings) {


    var $elem = $(context.target);
    var project_nid = $elem.data('unig-project-nid');

    var $article = $('.unig-project-' + project_nid);

    var title = $('#edit-unig-project-title-' + project_nid).val();
    var date = $('#edit-unig-project-date-' + project_nid).val();
    var weight = $('#edit-unig-project-weight-' + project_nid).val();
    var description = $('#edit-unig-project-description-' + project_nid).val();
    var copyright = $('#edit-unig-project-copyright-' + project_nid).val();

    var priv_status = $('#edit-unig-project-private-' + project_nid).is(':checked');
    var priv = Number(priv_status);


    var data = {
      title      : title,
      date       : date,
      weight     : weight,
      description: description,
      private    : priv,
      copyright  : copyright
    };
   // console.log('saveProject ', data);

    // load Inputs


    $('#unig-project-title-' + project_nid).html(title);
    $('#unig-project-weight-' + project_nid).html(weight);
    $('#unig-project-description-' + project_nid).html(description);
    $('#unig-project-copyright-' + project_nid).html(copyright);

    // Date
//    $.datepicker.setDefaults($.datepicker.regional["de"]);

    var formated_date = $.datepicker.formatDate('D. d. MM yy', new Date(date));
    $('#unig-project-date-' + project_nid).html(formated_date);

    // Private
    var $elem_privat = $('#unig-project-private-' + project_nid);

    // console.log('privat ', priv_status);

    
    if (priv_status) {

      $elem_privat.html('(privat)');
      $('.unig-project-' + project_nid).addClass('private');

    }
    else {
      $elem_privat.html('');
      $('.unig-project-' + project_nid).removeClass('private');


    }


    $.ajax({
      url     : Drupal.url('unig/project/save'),
      type    : 'POST',
      data    : {
        'project_nid': project_nid,
        'data'       : data
      },
      dataType: 'json',
      success : function (results) {
       // console.log(results);
      }
    });


    toggleEdit(context);

  }

  /**
   *
   *
   * @param context
   */

  function resetProject(context) {


    var $elem = $(context.target);
    var project_nid = $elem.data('unig-project-nid');
    var index = $elem.data('unig-project-index');

    var data = drupalSettings.projects[index];

    var $title = $('#edit-unig-project-title-' + project_nid);
    var $date = $('#edit-unig-project-date-' + project_nid);
    var $weight = $('#edit-unig-project-weight-' + project_nid);
    var $description = $('#edit-unig-project-description-' + project_nid);
    var $priv = $('#edit-unig-project-private-' + project_nid);


    // Title
    $title.val(data.title);

    // Description
    $description.val(data.description);

    // Date
    $date.val(data.date_drupal);

    // Private
    if (data.private) {
      $priv.prop('checked', true);
    }
    else {
      $priv.prop('checked', false);

    }

    toggleEdit(context);


  }


})(jQuery, Drupal, drupalSettings);