<?php

  namespace Drupal\unig\Form;

  use Drupal\Core\Ajax\AjaxResponse;
  use Drupal\Core\Ajax\AppendCommand;
  use Drupal\Core\Ajax\CssCommand;
  use Drupal\Core\Ajax\HtmlCommand;
  use Drupal\Core\Ajax\ReplaceCommand;
  use Drupal\Core\Form\FormBase;
  use Drupal\Core\Form\FormStateInterface;
  use Drupal\unig\Utility\AlbumTrait;
  use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
  use Drupal\Core\Form\ConfigFormBase;


  use Drupal\unig\Utility\UniGTrait;
  use Drupal\unig\Utility\ProjectTrait;
  use Drupal\unig\Utility\FileTrait;


  /**
   * Implements InputDemo form controller.
   *
   * This example demonstrates the different input elements that are used to
   * collect data in a form.
   */
  class NewAlbumForm extends FormBase {

    /**
     * UploadImages constructor.
     *
     * @param $project_nid
     */
    public function __construct() {

    }


    /**
     * {@inheritdoc}
     */
    public function getFormId() {
      return 'unig_new_album';
    }


    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state) {


      $form['project_nid'] = [
        '#type' => 'hidden',
        '#value' => '',
      ];

      $form['new_album'] = [
        '#type' => 'textfield',
        //  '#title' => t('Name Album:'),
        '#size' => 20,
        '#maxlength' => 20,
        '#class' => 'form-control',

        '#prefix' => '<div id="unig-form-new-album-input" class="">',
        '#suffix' => '</div>',
        '#ajax' => [
          'keypress' => TRUE,
          'callback' => 'Drupal\unig\Form\NewAlbumForm::submit',
          'event' => 'change',
          'wrapper' => 'js_wrapper',
          'progress' => [
            'type' => 'throbber',
            'message' => t('Verifying entry...'),
          ],
        ],
      ];

      $form['cancel'] = [
        '#markup' => '<div class="ajax-container-new-album-trigger">' . $this->t('abbrechen') . '</div>',
      ];


      return $form;
    }

    public function submit(array &$form, FormStateInterface $form_state): AjaxResponse {

      $response = new AjaxResponse();


      $values = $form_state->getValues();

      $album_name = $values['new_album'];
      $projekt_nid = $values['project_nid'];

      if (isset($album_name) && !empty($album_name)) {

        // Neues Album erstellen
        $album_nid = AlbumTrait::newAlbum($album_name);
        // Das Album dem Aktuellen Projekt zuweisen
        AlbumTrait::addAlbum($projekt_nid, $album_nid);


        $message = "Neues Album erstellt: $album_name ($album_nid)";
        $response->addCommand(new AppendCommand('#unig-form-new-album-input-messages', $message));

      }
      else {
        $message = 'kein Name angegeben';
        $response->addCommand(new AppendCommand('#unig-form-new-album-input-messages', $message));

      }


      if ($album_nid) {
        drupal_set_message('Neues Album "' . $album_name . '" erstellt');


      }


      $response->addCommand(new AppendCommand('.unig-albumlist-item', ''));
      return $response;
    }


    /**
     * {@inheritdoc}
     */
    public
    function submitForm(array &$form, FormStateInterface $form_state) {


      $values = $form_state->getValues();

      $album_name = $values['new_album'];
      $project_nid = $values['project_nid'];

      if (isset($album_name) && !empty($album_name)) {


        $album_nid = AlbumTrait::newAlbum($album_name);

        if ($album_nid) {

          AlbumTrait::addAlbum($project_nid, $album_nid);
          drupal_set_message('Neues Album "' . $album_name . '" erstellt');

        }


      }


      return 'submitForm';

    }


  }
