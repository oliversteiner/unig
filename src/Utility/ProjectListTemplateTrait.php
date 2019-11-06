<?php

namespace Drupal\unig\Utility;

/**
 *
 * @see \Drupal\Core\Render\Element\InlineTemplate
 * @see https://www.drupal.org/developing/api/8/localization
 */
trait ProjectListTemplateTrait
{


  /**
   * @param $cat_id
   * @return string
   */
  public function getCategoryTitle($cat_id): string
  {
    if ($cat_id) {
      $cat_id = trim($cat_id);
      $cat_id = (int) $cat_id;
    return Helper::getTermNameByID($cat_id);
    }
    return t('Category');
  }

  /**
   * Generate a render array with our Admin content.
   *
   * @param null $cat_id term-id from taxonomy Vocabulary unig_category
   * @return array
   *   A render array.
   *
   */
  public function projectListTemplate($cat_id = null): array
  {
    if ($cat_id) {
      $cat_id = trim($cat_id);
      $cat_id = (int) $cat_id;

      // check if  cat_id is valid term
      $term = Helper::getTermNameByID($cat_id);
    }



    $template_path = $this->getProjectListPath();
    $template = file_get_contents($template_path);
    $variables = $this->getProjectListVariables($cat_id);
    $build = [
      'description' => [
        '#type' => 'inline_template',
        '#template' => $template,
        '#context' => $variables
      ]
    ];

    $build['#attached']['drupalSettings']['projects'] = $variables;

    if (\Drupal::currentUser()->hasPermission('access unig admin')) {
      $build['#attached']['library'] = 'unig/unig.admin.project_list';
    } else {
      $build['#attached']['library'] = 'unig/unig.project_list';
    }

    return $build;
  }

  /**
   * Variables to act as context to the twig template file.
   *
   * @param null $cat_id
   * @return array
   *   Associative array that defines context for a template.
   */
  protected function getProjectListVariables($cat_id = null): array
  {
    // Module
    $variables['module'] = $this->getModuleName();

    // language
    $language = \Drupal::languageManager()
      ->getCurrentLanguage()
      ->getId();
    $variables['language'] = $language;

    // User
    $user = \Drupal::currentUser();
    $variables['user'] = clone $user;
    // Remove password and session IDs, since themes should not need nor see them.
    unset(
      $variables['user']->pass,
      $variables['user']->sid,
      $variables['user']->ssid
    );

    $variables['is_admin'] = $user->hasPermission('access unig admin');
    $variables['is_member'] = $user->hasPermission('access unig user');
    $variables['show_private'] = $user->hasPermission('access unig admin');
    $variables['logged_in'] = $user->isAuthenticated();

    // Projects
    $variables['project_list'] = ProjectTrait::buildProjectList($cat_id);

    return $variables;
  }

  /**
   * Get full path to the template.
   *
   * @return string
   *   Path string.
   */
  protected function getProjectListPath()
  {
    return drupal_get_path('module', $this->getModuleName()) .
      '/templates/unig.project-list.html.twig';
  }
}
