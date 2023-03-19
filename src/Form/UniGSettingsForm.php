<?php

namespace Drupal\unig\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\unig\Utility\Helper;
use Drupal\unig\Utility\Unig;

/**
 * Fields:
 *
 */
class UniGSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'unig_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
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
    $form['default_project'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Default Project Node ID'),
      '#default_value' => Unig::getDefaultProjectNid(),
    ];

    // Category.
    $form['default_category'] = [
      '#type' => 'select',
      '#options' => $options_unig_category,
      '#title' => $this->t('Default Category'),
      '#default_value' => Unig::getDefaultCategory(),
    ];

    // Source text field.
    $form['file_validate_extensions'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Allowed file types'),
      '#default_value' => Unig::getAllowedExtensions(),
      '#description' => $this->t(
        'Allowed file types, no points, separated by space.'
      ),
    ];

    // Set Dark Mode.
    $form['dark_mode'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Use Dark Mode?'),
      '#default_value' => Unig::useDarkMode(),
    ];

    // Set Dark Mode.
    $form['page_title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Page Title'),
      '#default_value' => Unig::getPageTitle(),
    ];

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
    $config->set(
      'unig.default_project',
      $form_state->getValue('default_project')
    );

    $config->set(
      'unig.default_category',
      $form_state->getValue('default_category')
    );

    $config->set(
      'unig.file_validate_extensions',
      $form_state->getValue('file_validate_extensions')
    );
    $config->set(
      'unig.dark_mode',
      $form_state->getValue('dark_mode')
    );
    $config->set(
      'unig.page_title',
      $form_state->getValue('page_title')
    );
    $config->save();
    return parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['unig.settings'];
  }

}
