/* eslint-disable prettier/prettier */
(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProjectList = {
    projectEditOpen: false,

    confirmDeleteProject(projectNid) {
      // Show Confirm Dialog
      document
        .querySelector(`.unig-project-delete-confirm-${projectNid}`)
        .setAttribute("style", "display:block");

      // Hide Delete Button
      document
        .querySelector(`.unig-button-project-delete-${projectNid}`)
        .setAttribute("style", "display:none");
    },

    cancelDeleteProject(projectNid) {
      // Show Confirm Dialog
      document
        .querySelector(`.unig-project-delete-confirm-${projectNid}`)
        .setAttribute("style", "display:none");

      // Hide Delete Button
      document
        .querySelector(`.unig-button-project-delete-${projectNid}`)
        .setAttribute("style", "display:block");
    },

    /**
     *
     *
     * @param event
     */
    getProjectNid(event) {
      const $elem = $(event.target).parents(".unig-project-nid");
      return $elem.data("unig-project-nid");
    },

    /**
     *
     * @param nid
     */
    togglePrivat(nid) {
      Drupal.behaviors.unigAdmin.togglePrivat(nid);
    },

    /**
     *
     * @param event
     */
    edit(event) {
      // Elem
      const elemTarget = event.target.parentNode;

      // Data
      const nid = elemTarget.dataset.unigNid;
      const field = elemTarget.dataset.unigField;
      const mode = elemTarget.dataset.unigMode;

      // Test
      console.log("elemTarget", elemTarget);
      console.log("nid", nid);
      console.log("field", field);
      console.log("mode", mode);

      Drupal.behaviors.unigAdmin.edit(nid, field, mode);
    },
    /**
     *
     * @param context
     * @param settings
     */
    attach(context, settings) {
      console.log("Drupal.behaviors.unigProjectList");

      const scope = this;

      $("#unig-main", context)
        .once("unigProjectList4634b47")
        .each(() => {
          //  Delete Project Trigger
          document
            .querySelectorAll(".unig-project-delete-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                event => {
                  const nid = scope.getProjectNid(event);

                  scope.confirmDeleteProject(nid);
                },
                false
              )
            );

          //  Cancel Delete Project Trigger
          document
            .querySelectorAll(".unig-project-delete-cancel-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                event => {
                  const nid = scope.getProjectNid(event);
                  scope.cancelDeleteProject(nid);
                },
                false
              )
            );

          //  Private Project Trigger
          document
            .querySelectorAll(".unig-project-private-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                event => {
                  const nid = scope.getProjectNid(event);
                  scope.togglePrivat(nid);
                },
                false
              )
            );

          // Edit File Title
          document
            .querySelectorAll(".unig-edit-trigger", context)
            .forEach(elem =>
              elem.addEventListener(
                "click",
                event => {
                  scope.edit(event);
                },
                false
              )
            );
        });
    }
  };
})(jQuery, Drupal, drupalSettings);
