<?php

namespace Drupal\unig\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\unig\Utility\Helper;

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
  public function buildForm(array $form, FormStateInterface $form_state)
  {
    // Form constructor.
    $form = parent::buildForm($form, $form_state);

    $options_unig_category = [];
    $vocabulary = 'unig_category';
    $terms = Helper::getTerms($vocabulary);

    if ($terms) {
      foreach ($terms as $term) {
        $options_unig_category[$term->tid] = $term->name;
      }
    }


    // Default settings.
    $config = $this->config('unig.settings');

    // Page title field.
    $form['default_project'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Default Project'),
      '#default_value' => $config->get('unig.default_project')
    );

    // Category.
    $form['default_category'] = array(
      '#type' => 'select',
      '#options' => $options_unig_category,
      '#title' => $this->t('Default Category'),
      '#default_value' => $config->get('unig.default_category')
    );

    // Source text field.
    $form['file_validate_extensions'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Allowed file types'),
      '#default_value' => $config->get(
        'unig.plupload.file_validate_extensions'
      ),
      '#description' => $this->t(
        'Allowed file types, no points, separated by space.'
      )
    );

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state)
  {
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $config = $this->config('unig.settings');
    $config->set(
      'unig.default_project',
      $form_state->getValue('default_project')
    );

    $config->set(
      'unig.default_category',
      $form_state->getValue('default_category')
    );

    $config->set(
      'unig.plupload.file_validate_extensions',
      $form_state->getValue('file_validate_extensions')
    );
    $config->save();
    return parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames()
  {
    return ['unig.settings'];
  }
}
