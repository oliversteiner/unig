(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.unigProjects = {
    attach: function (context, drupalSettings) {

      // Debug


      // onload
      constructor(context, drupalSettings);

      $('.unig-button-update-project').click(function (context, drupalSettings) {
        updateProject(context, drupalSettings);
      });

      $('.unig-button-project-cancel').click(function (context) {
        resetProject(context);
      });

      $('.unig-button-open-edit').click(function (context) {
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
  function updateProject(context, drupalSettings) {

    var $elem = $(context.target);
    var project_nid = $elem.data('unig-project-nid');

    var $article = $('.unig-project-' + project_nid);

    var title = $('#edit-unig-project-title-' + project_nid).val();
    var date = $('#edit-unig-project-date-' + project_nid).val();
    var weight = $('#edit-unig-project-weight-' + project_nid).val();
    var description = $('#edit-unig-project-description-' + project_nid).val();

    var priv = $('#edit-unig-project-private-' + project_nid).is(':checked');

    console.log(priv);

    console.log(Number(priv));

    var data = {
      title      : title,
      date       : date,
      weight     : weight,
      description: description,
      private    : Number(priv)
    };

    // load Inputs


    $('#unig-project-title-' + project_nid).html(title);
    $('#unig-project-weight-' + project_nid).html(weight);
    $('#unig-project-description-' + project_nid).html(description);

    // Date
//    $.datepicker.setDefaults($.datepicker.regional["de"]);

    var formated_date = $.datepicker.formatDate('D. d. MM yy', new Date(date));
    $('#unig-project-date-' + project_nid).html(formated_date);

    // Private
    var $elem_privat = $('#unig-project-private-' + project_nid);
    if (priv) {
      $elem_privat.html('(privat)');
      $article.addClass('unig-project-private');

      // change Class
    }
    else {
      $elem_privat.html('');
      $article.removeClass('unig-project-private');

    }


    $.ajax({
      url     : Drupal.url('unig/update_project'),
      type    : 'POST',
      data    : {
        'project_nid': project_nid,
        'data'       : data
      },
      dataType: 'json',
      success : function (results) {
        console.log(results);
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