(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigProjectList = {
    projectEditOpen: false,

    /**
     *
     * @param nid
     */
    toggleConfirmDeleteProject(nid) {
      //  Confirm Dialog Elem
      const elem = document.querySelector(
        `.unig-project-${nid} .unig-project-delete-confirm`,
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
     * @param nid
     */
    cancelDeleteProject(nid) {
      // Hide Confirm Dialog
      this.toggleConfirmDeleteProject(nid);
    },

    /**
     *
     *
     * @param event
     */
    getProjectNid(event) {
      const elem = event.target.closest('.unig-project-nid'); // NO IE
      return elem.dataset.unigProjectNid;
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
      // TODO This function is double ->  Drupal.behaviors.unigProject.edit
      const elemTarget = event.target.parentNode;

      // Data
      const nid = elemTarget.dataset.unigNid;
      const field = elemTarget.dataset.unigField;
      const mode = elemTarget.dataset.unigMode;
      const form = elemTarget.dataset.unigForm;

      // Test
      console.log('elemTarget', elemTarget);
      console.log('nid', nid);
      console.log('field', field);
      console.log('mode', mode);
      console.log('form', form);
      if (form === 'option_list') {
        Drupal.behaviors.unigAdmin.optionList(nid, field, mode);
      } else {
        Drupal.behaviors.unigAdmin.edit(nid, field, mode);
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
          console.log('Drupal.behaviors.unigProjectList');

          //  Delete Project Trigger
          root.querySelectorAll('.unig-project-delete-trigger').forEach(elem =>
            elem.addEventListener(
              'click',
              event => {
                const nid = scope.getProjectNid(event);
                scope.toggleConfirmDeleteProject(nid);
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
                  const nid = scope.getProjectNid(event);
                  scope.cancelDeleteProject(nid);
                },
                false,
              ),
            );

          //  Private Project Trigger
          root.querySelectorAll('.unig-project-private-trigger').forEach(elem =>
            elem.addEventListener(
              'click',
              event => {
                const nid = scope.getProjectNid(event);
                scope.togglePrivat(nid);
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
