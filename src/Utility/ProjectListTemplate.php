<?php

namespace Drupal\unig\Utility;

/**
 *
 * @see \Drupal\Core\Render\Element\InlineTemplate
 * @see https://www.drupal.org/developing/api/8/localization
 */
class ProjectListTemplate {

  /**
   *
   */
  public function getModuleName(): string {
    return "unig";
  }

  /**
   * @param $cat_id
   *
   * @return string
   */
  public function getCategoryTitle($cat_id): string {
    if ($cat_id) {
      $cat_id = trim($cat_id);
      $cat_id = (int) $cat_id;
      return MolloUtils::getTermNameByID($cat_id);
    }
    return t('Category');
  }

  /**
   * Generate a render array with our Admin content.
   *
   * @param null $cat_id
   *   term-id from taxonomy Vocabulary unig_category.
   *
   * @return array
   *   A render array.
   */
  public function getListTemplate($cat_id = NULL): array {
    if ($cat_id) {
      $cat_id = trim($cat_id);
      $cat_id = (int) $cat_id;

      // Check if  cat_id is valid term.
      $term = MolloUtils::getTermNameByID($cat_id);
    }

    $template_path = $this->getProjectListPath();
    $template = file_get_contents($template_path);
    $variables = $this->getProjectListVariables($cat_id);
    $build = [
      'description' => [
        '#type' => 'inline_template',
        '#template' => $template,
        '#context' => $variables,
      ],
    ];

    $build['#attached']['drupalSettings']['projects'] = $variables;

    if (\Drupal::currentUser()->hasPermission('access unig admin')) {
      $build['#attached']['library'] = 'unig/unig.list.admin';
    }
    else {
      $build['#attached']['library'] = 'unig/unig.list.public';
    }

    return $build;
  }

  /**
   * Variables to act as context to the twig template file.
   *
   * @param null $cat_id
   *
   * @return array
   *   Associative array that defines context for a template.
   */
  protected function getProjectListVariables($cat_id = NULL): array {
    // Module.
    $variables['module'] = $this->getModuleName();
    $config = \Drupal::config('unig.settings');

    // Language.
    $language = \Drupal::languageManager()
      ->getCurrentLanguage()
      ->getId();
    $variables['language'] = $language;

    // User.
    $user = \Drupal::currentUser();
    $variables['user'] = clone $user;
    // Remove password and session IDs,
    // since themes should not need nor see them.
    unset(
      $variables['user']->pass,
      $variables['user']->sid,
      $variables['user']->ssid
    );

    $variables['is_admin'] = $user->hasPermission('access unig admin');
    $variables['can_download'] = $user->hasPermission('access unig download');
    $variables['show_private'] = $user->hasPermission('access unig admin');
    $variables['logged_in'] = $user->isAuthenticated();
    $variables['dark_mode'] = $config ->get('unig.dark_mode');

    // Projects.
    $projectTrait = new Project();
    $variables['project_list'] = $projectTrait->buildProjectList($cat_id);

    return $variables;
  }

  /**
   * Get full path to the template.
   *
   * @return string
   *   Path string.
   */
  protected function getProjectListPath(): string {

    return \Drupal::service('extension.list.module')->getPath($this->getModuleName()) .
      '/templates/unig.list.html.twig';
  }

}
