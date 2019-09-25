<?php

namespace Drupal\unig\Utility;

/**
 *
 * @see \Drupal\Core\Render\Element\InlineTemplate
 * @see https://www.drupal.org/developing/api/8/localization
 */
trait projectListTemplateTrait
{
  /**
   * Name of our module.
   *
   * @return string
   *   A module name.
   */
  abstract protected function getModuleName(): string;

  /**
   * Generate a render array with our Admin content.
   *
   * @return array
   *   A render array.
   */
  public function projectListTemplate(): array
  {
    $template_path = $this->getProjectListPath();
    $template = file_get_contents($template_path);
    $variables = $this->getProjectListVariables();
    $build = [
      'description' => [
        '#type' => 'inline_template',
        '#template' => $template,
        '#context' => $variables,
      ],
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
   * @return array
   *   Associative array that defines context for a template.
   */
  protected function getProjectListVariables(): array
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
    $variables['show_private'] = $user->hasPermission('access unig admin');
    $variables['logged_in'] = $user->isAuthenticated();

    // Projects
    $variables['project_list'] = ProjectTrait::buildProjectList();

    return $variables;
  }

  /**
   * Get full path to the template.
   *
   * @return string
   *   Path string.
   */
  protected function getProjectListPath(): string
  {
    return drupal_get_path('module', $this->getModuleName()) .
      "/templates/unig.project-list.html.twig";
  }
}
