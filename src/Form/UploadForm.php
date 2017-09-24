<?php

namespace Drupal\unig\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
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
class UploadForm extends FormBase
{
    // Albums
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
    public function __construct()
    {
        $this->config = $this->defaultConfiguration();
        $this->projectList = $this->getProjectlistSelected();

    }


    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'unig_upload_files';
    }





    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state, $project_nid = NULL)
    {
        if ($project_nid != Null) {
            {
                // Make sure you don't trust the URL to be safe! Always check for exploits.
                if (!is_numeric($project_nid)) {
                    // We will just show a standard "access denied" page in this case.
                    throw new AccessDeniedHttpException();
                }

                $form['project_nid'] = [
                    '#type' => 'hidden',
                    '#value' => $project_nid
                ];
            }
        }
        // JS einbinden
        $form['#attached']['library'][] = 'unig/unig.upload';

        // link zu allen Projekten/Alben
        $form['go_to_projects'] = [
            '#theme' => '',
            '#title' => t('alle Projekte anzeigen'),
        ];

        // Textinput "neues Projekt"
        $form['new_project'] = [
            '#type' => 'textfield',
            '#title' => t('Name neues Projekt:'),
            '#size' => 60,
            '#maxlength' => 128,
            '#class' => 'form-control',

            '#prefix' => '<div id="unig_form_upload_new_project" class="">',
            '#suffix' => '</div>',
        ];

        // Select Element mit  Projektliste
        $form['project'] = [
            '#title' => $this->t('Projekt wählen'),
            '#type' => 'select',
            '#options' => $this->getProjectlistSelected(),
            '#default_value' => $this->getDefaultProjectNid(),
          /*  '#ajax' => [
                'callback' => '::selectNewProject',
            ],*/

            '#prefix' => '<div id="unig_form_upload_project" class="" style="display:none">',
            '#suffix' => '</div>',
        ];


        // Plupload
        //  https://www.drupal.org/node/1647890
        $form['file_upload'] = [
            '#type' => 'plupload',
            '#title' => t('Dateien / Bilder hochladen'),
            '#description' => t(''),
            '#upload_validators' => array(
                'file_validate_extensions' => array($this->config['file_validate_extensions']),
                'my_custom_file_validator' => array(''),
            ),
            '#plupload_settings' => array(
                'runtimes' => 'html5',
                'chunk_size' => '1mb',
            ),
        ];


        $form['js_wrapper'] = [
            '#type' => 'container',
            '#attributes' => ['id' => 'js-wrapper']

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
            '#description' => $this->t('Submit, #type = submit'),

        ];


        return $form;
    }





    /**
     * {@inheritdoc}
     */
    public function validateForm(array &$form, FormStateInterface $form_state)
    {
        $values = $form_state->getValues();


        // Inputs:
        $project = $values['project'];         // string - keine Abklärung nötig
        $new_project = $values['new_project'];   // sting  - nicht leer wenn "project" auf "neu"
        $file_upload = $values['file_upload'];   // array - nicht leer sein


        if ($project === 'neu' && $new_project == '') {
            // Set an error for the form element with a key of "title".
            $form_state->setErrorByName('new_project',
                $this->t('Namen für das neue Projekt eingeben'));
        }

        if (count($file_upload) == 0) {
            // Set an error for the form element with a key of "title".
            $form_state->setErrorByName('file_upload',
                $this->t('Keine Dateien ausgewählt'));
        }

    }


    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {


        $create_new_project = FALSE;

        $values = $form_state->getValues();

        // neues Album?
        $new_project = $values['new_project'];

        if (isset($new_project) && !empty($new_project)) {
            $create_new_project = TRUE;
            $project_nid = $this->createUniGProject($new_project);

            // Titel herausfinden
            $project_title = $new_project;

        } else {
            $project_nid = $values['project'];

            // Titel herausfinden
            $project_title = $form['project']['#options'][$project_nid];

        }

        // Nodes erstellen

        $values['project_nid'] = $project_nid;
        $node_ids = $this->createMultiNode($values);
        $anzahl = count($node_ids);

        // Nachricht ausrechnen
        if ($anzahl > 1) {
            // Mehr als ein Bild
            if ($create_new_project) {
                $variante = 'new_many';
            } else {
                $variante = 'con_many';
            }
        } else {
            // nur 1 Bild
            if ($create_new_project) {
                $variante = 'new_one';
            } else {
                $variante = 'con_one';
            }
        }

        // Messages:

        $message_new_one = "Es wurde ein Bild in das neue Projekt  \"$project_title\" hinzugefügt";
        $message_new_many = "Es wurden $anzahl Bilder in das neue Projekt \"$project_title\" hinzugefügt";
        $message_con_one = "Es wurde ein Bild in das Projekt  \"$project_title\" hinzugefügt";
        $message_con_many = "Es wurden $anzahl Bilder in das Projekt \"$project_title\" hinzugefügt";

        $message_go_to = "<a href=\"/unig/project/$project_nid\">Die UniG <strong>$project_title</strong> anzeigen</a>";
        $rendered_message = \Drupal\Core\Render\Markup::create($message_go_to);


        switch ($variante) {
            case 'new_one' :
                $message = $message_new_one;
                break;
            case 'new_many' :
                $message = $message_new_many;
                break;
            case 'con_one' :
                $message = $message_con_one;
                break;
            case 'con_many' :
                $message = $message_con_many;
                break;

        }

        // Feedback Album und Bilder
        drupal_set_message($message);
        drupal_set_message($rendered_message);

        return 'submitForm';

    }


}
