<?php

namespace Drupal\unig\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\unig\Utility\FileTrait;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\Unig;
use Drupal\unig\Utility\UniGTrait;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Implements InputDemo form controller.
 *
 * This example demonstrates the different input elements that are used to
 * collect data in a form.
 */
class UploadForm extends FormBase {

  use ProjectTrait;

  public array $projectList;

  public $counter;

  public array $config;

  /**
   * @var string
   */
  private string $upload_location;

  use UniGTrait;
  use FileTrait;

  /**
   * UploadImages constructor.
   */
  public function __construct() {
    $this->config = Unig::getConfigAsArray();
    $this->projectList = self::getProjectlistSelected();
    $this->upload_location = 'private://uploads/unig';
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'unig_upload_files';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(
    array $form,
    FormStateInterface $form_state,
                       $project_id = NULL
  ): array {
    if ($project_id !== NULL) {
      // Make sure you don't trust the URL to be safe!
      // Always check for exploits.
      if (!is_numeric($project_id)) {
        // We will just show a standard "access denied" page in this case.
        throw new AccessDeniedHttpException();
      }

      $form['project_id'] = [
        '#type' => 'hidden',
        '#value' => $project_id,
      ];
    }
    // JS.
    $form['#attached']['library'][] = 'unig/unig.upload';

    // Link to Dashboard.
    $form['go_to_projects'] = [
      '#theme' => '',
      '#title' => t('Show all projects'),
    ];

    // Input Text "Name new Project".
    $form['new_project'] = [
      '#type' => 'textfield',
      '#title' => t('Name new project'),
      '#size' => 60,
      '#maxlength' => 128,
      '#class' => 'form-control',

      '#prefix' => '<div id="unig_form_upload_new_project" class="">',
      '#suffix' => '</div>',
    ];

    // Input Option Select width Projectlist.
    $form['project'] = [
      '#title' => $this->t('Choose Project'),
      '#type' => 'select',
      '#options' => self::getProjectlistSelected(),
      '#default_value' => self::getDefaultProjectNid($project_id),
      '#prefix' =>
      '<div id="unig_form_upload_project" class="" style="display:none">',
      '#suffix' => '</div>',
    ];

    $form['file_upload'] = [
      '#type' => 'managed_file',
      '#title' => t('Upload Images / Files'),
      '#required' => FALSE,
      '#multiple' => TRUE,
      '#upload_location' => $this->upload_location,
      '#upload_validators' => [
        'file_validate_extensions' => [
          $this->config['file_validate_extensions'],
        ],
      ],
    ];

    $form['js_wrapper'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'js-wrapper'],
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
    // string - keine Abklärung nötig.
    $project = $values['project'];
    // Sting  - nicht leer wenn "project" auf "neu".
    $new_project = $values['new_project'];
    // Array - nicht leer sein.
    $file_upload = $values['file_upload'];

    if ($project === 'neu' && $new_project == '') {
      // Set an error for the form element with a key of "title".
      $form_state->setErrorByName(
        'new_project',
        $this->t('Type a name for the new project')
      );
    }

    if (count($file_upload) == 0) {
      // Set an error for the form element with a key of "title".
      $form_state->setErrorByName('file_upload', $this->t('No files selected'));
    }
  }

  /**
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *
   * @return string
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public function submitForm(
    array &$form,
    FormStateInterface $form_state
  ): string {
    $create_new_project = FALSE;
    $values = $form_state->getValues();

    // New Album?
    $new_project = $values['new_project'];

    if (isset($new_project) && !empty($new_project)) {
      $create_new_project = TRUE;
      $project_id = self::newUniGProject($new_project);

      // Get Title.
      $project_title = $new_project;
    }
    else {
      $project_id = $values['project'];

      // Get Title.
      $project_title = $form['project']['#options'][$project_id];
    }

    // Create Nodes.
    $values['project_id'] = $project_id;

    // Move Files to destination.
    $node_ids = $this->createMultiNode($values);
    $count = count($node_ids);

    // Build Message.
    if ($count > 1) {
      // Multiple Images.
      if ($create_new_project) {
        $variant = 'new_many';
      }
      else {
        $variant = 'add_many';
      }
    }
    else {
      // Just one Image.
      if ($create_new_project) {
        $variant = 'new_one';
      }
      else {
        $variant = 'add_one';
      }
    }

    // Messages:
    $message_new_one = t('Added 1 item to the new project %project.', [
      '%project' => $project_title,
    ]);

    $message_new_many = t('Added %count items to the new project %project.', [
      '%count' => $count,
      '%project' => $project_title,
    ]);

    $message_add_one = t('Added 1 item to the project %project.', [
      '%project' => $project_title,
    ]);

    $message_add_many = t('Added %count items to the project %project.', [
      '%count' => $count,
      '%project' => $project_title,
    ]);

    switch ($variant) {
      case 'new_one':
        $message = $message_new_one;
        break;

      case 'new_many':
        $message = $message_new_many;
        break;

      case 'add_one':
        $message = $message_add_one;
        break;

      case 'add_many':
        $message = $message_add_many;
        break;
    }

    // Go to Gallery Page.
    $arr_args = ['project_id' => $project_id];
    $form_state->setRedirect('unig.project.admin', $arr_args);

    return 'submitForm';
  }

}
