<?php

namespace Drupal\unig\Form;

use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;
use Drupal\unig\Utility\FileTrait;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\UniGTrait;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Implements InputDemo form controller.
 *
 * This example demonstrates the different input elements that are used to
 * collect data in a form.
 */
class FilesForm extends FormBase {
  /**
   * Albums.
   */
  public $projectList;
  public $projectNids;
  public $zaehler;
  public $config;

  use UniGTrait;
  use ProjectTrait;
  use FileTrait;

  /**
   * UploadImages constructor.
   */
  public function __construct() {
    $this->config = $this->defaultConfiguration();
    $this->projectList = $this->getProjectlistSelected();
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'unig_files';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(
    array $form,
    FormStateInterface $form_state,
    $project_id = NULL
  ) {
    if ($project_id != NULL) {
      // Make sure you don't trust the URL to be safe! Always check for exploits.
      if (!is_numeric($project_id)) {
        // We will just show a standard "access denied" page in this case.
        throw new AccessDeniedHttpException();
      }
    }

    $form['new_project'] = [
      '#type' => 'textfield',
      '#title' => t('Project name'),
      '#size' => 60,
      '#maxlength' => 128,
      '#class' => 'form-control',
      '#prefix' => '<div id="unig_form_upload_new_project" class="">',
      '#suffix' => '</div>',
    ];

    $form['project'] = [
      '#title' => $this->t('Chose project'),
      '#type' => 'select',
      '#options' => $this->getProjectlistSelected(),
      '#default_value' => $this->getDefaultProjectNid(),
      '#prefix' =>
      '<div id="unig_form_upload_project" class="" style="display:none">',
      '#suffix' => '</div>',
    ];

    $form['container_images'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'js-wrapper'],
      '#attached' => [
        'library' => ['unig/unig.upload'],
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
    // string - keine Abklärung nötig.
    $project = $values['project'];
    // Sting  - nicht leer wenn "project" auf "neu".
    $new_project = $values['new_project'];
    // Array - nicht leer sein.
    $file_upload = $values['file_upload'];

    if ($project === 'neu' && $new_project == '') {
      // Set an error for the form element with a key of "title".
      $form_state->setErrorByName('new_project', $this->t('Name new Project'));
    }

    if (count($file_upload) == 0) {
      // Set an error for the form element with a key of "title".
      $form_state->setErrorByName('file_upload', $this->t('No files selected'));
    }
  }

  /**
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   * @return string
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function submitForm(
    array &$form,
    FormStateInterface $form_state
  ): string {
    $create_new_project = FALSE;

    $values = $form_state->getValues();

    // Neues Album?
    $new_project = $values['new_project'];

    if (isset($new_project) && !empty($new_project)) {
      $create_new_project = TRUE;
      try {
        $project_id = self::newUniGProject($new_project);
      }
      catch (InvalidPluginDefinitionException $e) {
      }
      catch (PluginNotFoundException $e) {
      }
      catch (EntityStorageException $e) {
      }

      // Find out the title.
      $project_title = $new_project;
    }
    else {
      $project_id = $values['project'];

      // Find out the title.
      $project_title = $form['project']['#options'][$project_id];
    }

    // Create Nodes.
    $values['project_id'] = $project_id;
    $node_ids = $this->createMultiNode($values);
    $number_of = count($node_ids);

    // Nachricht ausrechnen.
    if ($number_of > 1) {
      // Multiple images.
      if ($create_new_project) {
        $variant = 'new_many';
      }
      else {
        $variant = 'con_many';
      }
    }
    elseif ($create_new_project) {
      // Just one Image.
      $variant = 'new_one';
    }
    else {
      $variant = 'con_one';
    }

    // @todo Translate
    // Messages:
    $message_new_one = "Es wurde ein Bild in das neue Projekt  \"$project_title\" hinzugefügt";
    $message_new_many = "Es wurden $number_of Bilder in das neue Projekt \"$project_title\" hinzugefügt";
    $message_con_one = "Es wurde ein Bild in das Projekt  \"$project_title\" hinzugefügt";
    $message_con_many = "Es wurden $number_of Bilder in das Projekt \"$project_title\" hinzugefügt";

    // Link to Image Gallery.
    $message_go_to = "<a href=\"/unig/project/$project_id\">Die UniG <strong>$project_title</strong> anzeigen</a>";
    $rendered_message = Markup::create($message_go_to);

    switch ($variant) {
      case 'new_one':
        $message = $message_new_one;
        break;

      case 'new_many':
        $message = $message_new_many;
        break;

      case 'con_one':
        $message = $message_con_one;
        break;

      case 'con_many':
        $message = $message_con_many;
        break;

      default:
        $message = '';
        break;
    }

    // Feedback Album und Bilder.
    $this->messenger->addMessage($message);
    $this->messenger->addMessage($rendered_message);

    return 'submitForm';
  }

}
