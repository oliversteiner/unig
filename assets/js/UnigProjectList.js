/* eslint-disable prettier/prettier */
(function($, Drupal, drupalSettings) {
  /**
   *
   *
   * @param context
   */
  function toggleEdit(context) {
    const $elem = $(context.target);
    const projectNid = $elem.data("unig-project-nid");

    $(`#unig-project-edit-container-${projectNid}`, context).toggle();
    $(`#unig-project-normal-container-${projectNid}`, context).toggle();
  }

  /**
   *
   *
   * @param context
   */
  function saveProject(context) {
    const $elem = $(context.target);
    const projectNid = $elem.data("unig-project-nid");

    const title = $(`#edit-unig-project-title-${projectNid}`, context).val();
    const date = $(`#edit-unig-project-date-${projectNid}`, context).val();
    const weight = $(`#edit-unig-project-weight-${projectNid}`, context).val();
    const description = $(
      `#edit-unig-project-description-${projectNid}`,
      context
    ).val();
    const copyright = $(
      `#edit-unig-project-copyright-${projectNid}`,
      context
    ).val();

    const privStatus = $(
      `#edit-unig-project-private-${projectNid}`,
      context
    ).is(":checked");
    const priv = Number(privStatus);

    const data = {
      title,
      date,
      weight,
      description,
      private: priv,
      copyright
    };

    // load Inputs
    $(`#unig-project-title-${projectNid}`, context).html(title);
    $(`#unig-project-weight-${projectNid}`, context).html(weight);
    $(`#unig-project-description-${projectNid}`, context).html(description);
    $(`#unig-project-copyright-${projectNid}`, context).html(copyright);

    // Date
    //    $.datepicker.setDefaults($.datepicker.regional["de"]);

    const formatedDate = $.datepicker.formatDate("D. d. MM yy", new Date(date));
    $(`#unig-project-date-${projectNid}`).html(formatedDate);

    // Private
    const $elemPrivat = $(`#unig-project-private-${projectNid}`, context);

    // console.log('privat ', privStatus);

    if (privStatus) {
      $elemPrivat.html("(privat)");
      $(`.unig-project-${projectNid}`, context).addClass("private");
    } else {
      $elemPrivat.html("");
      $(`.unig-project-${projectNid}`, context).removeClass("private");
    }

    $.ajax({
      url: Drupal.url("unig/project/save"),
      type: "POST",
      data: {
        project_nid: projectNid,
        data
      },
      dataType: "json",
      success(results) {
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
    const $elem = $(context.target);
    const projectNid = $elem.data("unig-project-nid", context);
    const index = $elem.data("unig-project-index", context);

    const data = drupalSettings.projects[index];

    const $title = $(`#edit-unig-project-title-${projectNid}`, context);
    const $date = $(`#edit-unig-project-date-${projectNid}`, context);
    const $weight = $(`#edit-unig-project-weight-${projectNid}`, context);
    const $description = $(
      `#edit-unig-project-description-${projectNid}`,
      context
    );
    const $priv = $(`#edit-unig-project-private-${projectNid}`, context);

    // Title
    $title.val(data.title);

    // Description
    $description.val(data.description);

    // Date
    $date.val(data.dateDrupal);

    // Private
    if (data.private) {
      $priv.prop("checked", true);
    } else {
      $priv.prop("checked", false);
    }

    toggleEdit(context);
  }

  Drupal.behaviors.unigProjectList = {
    attach(context, settings) {
      console.log("Drupal.behaviors.unigProjectList");

      // Buttons
      $(".unig-project-save-trigger").click(() => {
        saveProject(context, settings);
      });

      $(".unig-project-cancel-trigger").click(() => {
        resetProject(context);
      });

      $(".unig-project-edit-trigger").click(() => {
        toggleEdit(context);
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
