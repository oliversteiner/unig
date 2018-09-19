/* eslint-disable prettier/prettier */
(function($, Drupal, drupalSettings) {
  /**
   *
   *
   * @param context
   */
  function toggleEdit(projectNid) {
    $(`#unig-project-edit-container-${projectNid}`).toggle();
    $(`#unig-project-normal-container-${projectNid}`).toggle();
  }

  /**
   *
   *
   * @param context
   */
  function saveProject(projectNid) {
    const title = $(`#edit-unig-project-title-${projectNid}`).val();
    const date = $(`#edit-unig-project-date-${projectNid}`).val();
    const weight = $(`#edit-unig-project-weight-${projectNid}`).val();
    const description = $(`#edit-unig-project-description-${projectNid}`).val();
    const copyright = $(`#edit-unig-project-copyright-${projectNid}`).val();

    const privStatus = $(`#edit-unig-project-private-${projectNid}`).is(
      ":checked"
    );
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
    $(`#unig-project-title-${projectNid}`).html(title);
    $(`#unig-project-weight-${projectNid}`).html(weight);
    $(`#unig-project-description-${projectNid}`).html(description);
    $(`#unig-project-copyright-${projectNid}`).html(copyright);

    // Date
    //    $.datepicker.setDefaults($.datepicker.regional["de"]);

    const formatedDate = $.datepicker.formatDate("D. d. MM yy", new Date(date));
    $(`#unig-project-date-${projectNid}`).html(formatedDate);

    // Private
    const $elemPrivat = $(`#unig-project-private-${projectNid}`);

    // console.log('privat ', privStatus);

    if (privStatus) {
      $elemPrivat.html("(privat)");
      $(`.unig-project-${projectNid}`).addClass("private");
    } else {
      $elemPrivat.html("");
      $(`.unig-project-${projectNid}`).removeClass("private");
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

    toggleEdit(projectNid);
  }

  /**
   *
   *
   * @param context
   */

  function resetProject(projectNid, projectIndex) {
    const data = drupalSettings.projects[projectIndex];

    const $title = $(`#edit-unig-project-title-${projectNid}`);
    const $date = $(`#edit-unig-project-date-${projectNid}`);
    const $weight = $(`#edit-unig-project-weight-${projectNid}`);
    const $description = $(`#edit-unig-project-description-${projectNid}`);
    const $priv = $(`#edit-unig-project-private-${projectNid}`);

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

    toggleEdit(projectNid);
  }

  Drupal.behaviors.unigProjectList = {
    attach(context, settings) {
      console.log("Drupal.behaviors.unigProjectList");

      // Buttons
      $(".unig-project-save-trigger", context).click(event => {
        const $elem = $(event.target);
        const projectNid = $elem.data("unig-project-nid");
        saveProject(projectNid);
      });

      $(".unig-project-cancel-trigger", context).click(event => {
        const $elem = $(event.target);
        const projectNid = $elem.data("unig-project-nid");
        const projectIndex = $elem.data("unig-project-index");

        resetProject(projectNid, projectIndex);
      });

      $(".unig-project-edit-trigger", context).click(event => {
        const $elem = $(event.target);
        const projectNid = $elem.data("unig-project-nid");
        toggleEdit(projectNid);
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
