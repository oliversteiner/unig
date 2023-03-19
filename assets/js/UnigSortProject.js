(function($, Drupal, drupalSettings) {
  function save(data, name) {
    console.log('Sort Data', data);

    $.ajax({
      url: Drupal.url(`unig/sort/${name}`),
      type: 'POST',
      data: {
        data,
      },
      dataType: 'json',
      success: results => {

        const text = results.messages[0][0];
        const type = results.messages[0][1];
        Drupal.behaviors.unigMessages.addMessage(text, type);
      },
    });

    return true;
  }

  function sortActivate(context) {
    $('.unig-sortable', context).sortable({
      placeholder: 'unig-sortable-placeholder',
      items: '> li.unig-sortable-item',
      tolerance: 'pointer',
    });

    $('.unig-sortable', context).sortable('enable');

    // Fieldset
    $('.unig-toolbar-sort', context).slideDown();

    // Buttons
    $('.unig-button-sort-toggle', context).addClass('active');

    $('.unig-button-files-edit', context).addClass('disabled');
    $('.unig-button-files-preview', context).addClass('disabled');
    $('.unig-button-keywords-toggle-all', context).addClass('disabled');
    $('.unig-button-people-toggle-all', context).addClass('disabled');

    // Files
    $('.unig-sortable-only').show();
    $('.unig-sortable-hide').hide();
  }

  function sortDeactivate(context) {
    // Fieldset
    $('.unig-toolbar-sort', context).slideUp();

    // Buttons
    $('.unig-button-sort-toggle', context).removeClass('active');

    $('.unig-button-files-edit', context).removeClass('disabled');
    $('.unig-button-files-preview', context).removeClass('disabled');
    $('.unig-button-keywords-toggle-all', context).removeClass('disabled');
    $('.unig-button-people-toggle-all', context).removeClass('disabled');

    // Files
    $('.unig-sortable-only', context).hide();
    $('.unig-sortable-hide', context).show();

    $('.unig-sortable', context).sortable('disable');
  }

  function sortCancel(context) {
    $('.unig-sortable', context).sortable('cancel');

    sortDeactivate(context);
  }

  function resetToAlphanumeric(context) {
    sortDeactivate(context);

    const name = 'reset';
    const data = $('.unig-sortable', context).sortable('serialize', {
      key: 'nid',
    });

    save(data, name);
  }


  function orderByDate(context) {
    alert('This function has not yet been implemented.')
  }

  function saveSortOrder(context) {
    sortDeactivate(context);

    const name = 'save';
    const data = $('.unig-sortable', context).sortable('serialize', {
      key: 'nid',
    });
    save(data, name);
  }

  Drupal.behaviors.unigSort = {
    attach(context) {
      // Buttons
      $('.unig-button-sort-toggle', context).click(() => {
        const $trigger = $(this);

        if ($trigger.hasClass('active')) {
          sortDeactivate();
        } else {
          sortActivate(context);
        }
      });

      $('.unig-sort-save-trigger', context).click(() => {
        saveSortOrder(context);
      });

      $('.unig-sort-cancel-trigger', context).click(() => {
        sortCancel(context);
      });

      $('.unig-order-alphanumeric-trigger', context).click(() => {
        resetToAlphanumeric(context);
      });

      $('.unig-order-by-date-trigger', context).click(() => {
        orderByDate(context);
      });
    },
  };
})(jQuery, Drupal, drupalSettings);
