<?php

namespace Drupal\unig\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class UniGSettingsForm extends ConfigFormBase
{

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'unig_settings_form';
    }


    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state) {
        // Form constructor.
        $form = parent::buildForm($form, $form_state);

        // Default settings.
        $config = $this->config('unig.settings');

        // Page title field.

        // Page title field.
        $form['default_project'] = array(
            '#type' => 'textfield',
            '#title' => $this->t('Default Project'),
            '#default_value' => $config->get('unig.default_project'),
            '#description' => $this->t('default_project'),
        );
        // Source text field.
        $form['file_validate_extensions'] = array(
            '#type' => 'textfield',
            '#title' => $this->t('Erlaubte Dateitypen'),
            '#default_value' => $config->get('unig.plupload.file_validate_extensions'),
            '#description' => $this->t('Gültige dateiendungen. ohne Punkt. Mit Abstand trennen.'),
        );

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function validateForm(array &$form, FormStateInterface $form_state) {

    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        $config = $this->config('unig.settings');
        $config->set('unig.default_project', $form_state->getValue('default_project'));
        $config->set('unig.plupload.file_validate_extensions', $form_state->getValue('file_validate_extensions'));
        $config->save();
        return parent::submitForm($form, $form_state);
    }

    /**
     * {@inheritdoc}
     */
    protected function getEditableConfigNames() {
        return [
            'unig.settings',
        ];
    }

}