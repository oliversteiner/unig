<?php

  namespace Drupal\unig\Form;

  use Drupal\Core\Ajax\AjaxResponse;
  use Drupal\Core\Ajax\ReplaceCommand;
  use Drupal\Core\Form\FormBase;
  use Drupal\Core\Form\FormStateInterface;


  /**
   * Implements InputDemo form controller.
   *
   * This example demonstrates the different input elements that are used to
   * collect data in a form.
   */
  class StylesForm extends FormBase {


    /**
     * UploadImages constructor.
     */
    public function __construct() {


    }


    /**
     * {@inheritdoc}
     */
    public function getFormId() {
      return 'unig_styles';
    }


    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state, $project_nid = NULL) {


      if ($_POST['project_nid']) {
        $project_nid = $_POST['project_nid'];
      }

      if ($project_nid != NULL) {
        {
          // Make sure you don't trust the URL to be safe! Always check for exploits.
          if (!is_numeric($project_nid)) {
            // We will just show a standard "access denied" page in this case.
            throw new AccessDeniedHttpException();
          }

          $form['project_nid'] = [
            '#type' => 'hidden',
            '#value' => $project_nid,
          ];
        }
      }
      // JS einbinden
     //  $form['#attached']['library'][] = 'unig/unig.upload';

      // link zu allen Projekten/Alben
      $form['go_to_projects'] = [
        '#theme' => '',
        '#title' => t('Create Styles'),
      ];



      $form['image_styles_generated'] = [
        '#type' => 'textfield',
        '#size' => '60',
        '#disabled' => TRUE,
        '#value' => 'Test Image-Styles',
        '#attributes' => [
          'id' => ['image-styles-output'],
        ],
        '#ajax' => [
          'callback' => '::createAllImageStyles',
          'event' => 'ready',
          'wrapper' => 'image-styles-output',
          'progress' => array(
            'type' => 'throbber',
            'message' => t('Searching Users...'),
          ),
        ],
      ];


      // Group submit handlers in an actions element with a key of "actions" so
      // that it gets styled correctly, and so that other modules may add actions
      // to the form.
      $form['actions'] = [
        '#type' => 'actions',
      ];


      // Add a submit button that handles the submission of the form.
      $form['actions']['submit'] = [
        '#type' => 'submit',
        '#value' => $this->t('Submit'),
      ];


      return $form;
    }


    /**
     * {@inheritdoc}
     */
    public function validateForm(array &$form, FormStateInterface $form_state) {
      $values = $form_state->getValues();


      // Inputs:
      $project = $values['project'];         // string - keine Abklärung nötig
      $new_project = $values['new_project'];   // sting  - nicht leer wenn "project" auf "neu"
      $file_upload = $values['file_upload'];   // array - nicht leer sein


      if ($project === 'neu' && $new_project == '') {
        // Set an error for the form element with a key of "title".
        $form_state->setErrorByName('new_project',
          $this->t('Type a name for the new project'));
      }

      if (count($file_upload) == 0) {
        // Set an error for the form element with a key of "title".
        $form_state->setErrorByName('file_upload',
          $this->t('No files selected'));
      }

    }


    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {



      return 'submitForm';
    }



    function createImageStyles($image_uri) {

      // generate Styles for Images

      $styles = \Drupal::entityTypeManager()
        ->getStorage('image_style')
        ->loadMultiple();


      dpm($image_uri);


      /** @var \Drupal\image\Entity\ImageStyle $style */
      foreach ($styles as $style) {
        $destination = $style->buildUri($image_uri);
        $style->createDerivative($image_uri, $destination);
      }


      $elem = [
        '#type' => 'textfield',
        '#size' => '60',
        '#disabled' => TRUE,
        '#value' => $image_uri,
        '#attributes' => [
          'id' => ['image-styles-output'],
        ],
      ];

      $renderer = \Drupal::service('renderer');
      $response = new AjaxResponse();
      $response->addCommand(new ReplaceCommand('#image-styles-output', $renderer->render($elem)));
      return $response;


    }


  }
