<?php

namespace Drupal\unig\Plugin\Field\FieldFormatter;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldFormatter\EntityReferenceFormatterBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\unig\Utility\Project;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\Unig;

/**
 * Plugin implementation of the 'UnigProjectTeaser' formatter.
 *
 * @FieldFormatter(
 *   id = "unig_project_teaser",
 *   label = @Translation("UniG Project Teaser"),
 *   field_types = {
 *     "entity_reference"
 *   }
 * )
 */
class UnigProjectTeaser extends EntityReferenceFormatterBase
{
  use ProjectTrait;

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings()
  {
    $default_settings = [] + parent::defaultSettings();

    return $default_settings;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state)
  {
    $elements = [];

    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary()
  {
    $summary = [];
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode)
  {
    $element = [];

    $template_path = Unig::getTemplatePath().'unig-project-teaser.html.twig';
    $template = file_get_contents($template_path);

    foreach ($items as $delta => $item) {
      $value = $item->getValue();
      $nid = $value['target_id'];
      $unig = new Project();

      $element[$delta] = [
        '#type' => 'inline_template',
        '#template' => $template,
        '#context' => $unig->buildProject($nid),
      ];
    }

    $element['#attached']['library'][] = 'unig/unig.project.teaser';

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity)
  {
    return $entity->access('view label', null, true);
  }
}
