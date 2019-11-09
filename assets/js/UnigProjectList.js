(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProjectList = {
    projectEditOpen: false,

    /**
     *
     * @param nid
     */
    toggleConfirmDeleteProject(id) {
      //  Confirm Dialog Elem
      const elem = document.querySelector(
        `.unig-project-${id} .unig-project-delete-confirm`,
      );

      // Toggle display
      if (elem.getAttribute('style') === 'display:block') {
        elem.setAttribute('style', 'display:none');
      } else {
        elem.setAttribute('style', 'display:block');
      }
    },

    /**
     *
     * @param id
     */
    cancelDeleteProject(id) {
      // Hide Confirm Dialog
      this.toggleConfirmDeleteProject(id);
    },

    /**
     *
     *
     * @param event
     */
    getProjectId(event) {
      const elem = event.target.closest('.unig-project-id'); // NO IE
      return elem.dataset.unigProjectId;
    },

    /**
     *
     * @param id
     */
    togglePrivate(id) {
      Drupal.behaviors.unigAdmin.togglePrivate(id);
    },

    /**
     *
     * @param event
     */
    edit(event) {
      // Elem
      const elemTarget = event.target.parentNode;

      // Data
      const id = elemTarget.dataset.unigProjectId;
      const field = elemTarget.dataset.unigField;
      const mode = elemTarget.dataset.unigMode;
      const form = elemTarget.dataset.unigForm;

      if (form === 'option_list') {
        Drupal.behaviors.unigAdmin.optionList(id, field, mode);
      } else {
        Drupal.behaviors.unigAdmin.edit(id, field, mode);
      }
    },
    /**
     *
     * @param context
     * @param settings
     */
    attach(context, settings) {
      const scope = this;
      const root = document.getElementById('unig-main');

      $('#unig-main', context)
        .once('unigProjectList')
        .each(() => {
          //  Delete Project Trigger
          root.querySelectorAll('.unig-project-delete-trigger').forEach(elem =>
            elem.addEventListener(
              'click',
              event => {
                const id = scope.getProjectId(event);
                scope.toggleConfirmDeleteProject(id);
              },
              false,
            ),
          );

          //  Cancel Delete Project Trigger
          root
            .querySelectorAll('.unig-project-delete-cancel-trigger')
            .forEach(elem =>
              elem.addEventListener(
                'click',
                event => {
                  const id = scope.getProjectId(event);
                  scope.cancelDeleteProject(id);
                },
                false,
              ),
            );

          //  Private Project Trigger
          root.querySelectorAll('.unig-project-private-trigger').forEach(elem =>
            elem.addEventListener(
              'click',
              event => {
                const id = scope.getProjectId(event);
                scope.togglePrivate(id);
              },
              false,
            ),
          );

          // Edit File Title
          root.querySelectorAll('.unig-edit-trigger').forEach(elem =>
            elem.addEventListener(
              'click',
              event => {
                scope.edit(event);
              },
              false,
            ),
          );
        });
    },
  };
})(jQuery, Drupal, drupalSettings);
