<?php

namespace Drupal\unig\Utility;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 *
 * @see \Drupal\Core\Render\Element\InlineTemplate
 * @see https://www.drupal.org/developing/api/8/localization
 */
trait projectTemplateTrait
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
   * @param      $project_nid
   * @param null $album_nid
   *
   * @return array A render array.
   * A render array.
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public function projectTemplate($project_nid, $album_nid = null): array
  {
    // Make sure you don't trust the URL to be safe! Always check for exploits.
    if (!is_numeric($project_nid)) {
      // We will just show a standard "access denied" page in this case.
      throw new AccessDeniedHttpException();
    }

    $template_path = $this->getProjectPath();
    $template = file_get_contents($template_path);
    $build = [
      'description' => [
        '#type' => 'inline_template',
        '#template' => $template,
        '#context' => $this->getProjectVariables($project_nid, $album_nid)
      ]
    ];

    // Project Variables for JS
    $build['#attached']['drupalSettings']['unig'][
      'project'
    ] = $this->getProjectVariables($project_nid, $album_nid);

    // Adding JS Library depends of admin or not
    if (Drupal::currentUser()->hasPermission('access unig admin')) {
      $build['#attached']['library'] = 'unig/unig.admin.project';
    } else {
      $build['#attached']['library'] = 'unig/unig.project';
    }

    return $build;
  }

  /**
   * Variables to act as context to the twig template file.
   *
   * @param $project_nid
   * @param null $album_nid
   * @return array
   *   Associative array that defines context for a template.
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  protected function getProjectVariables($project_nid, $album_nid = null): array
  {
    $variables['module'] = $this->getModuleName();

    $language = Drupal::languageManager()
      ->getCurrentLanguage()
      ->getId();
    $variables['language'] = $language;

    $user = Drupal::currentUser();
    $variables['user'] = clone $user;
    // Remove password and session IDs, since themes should not need nor see them.
    unset(
      $variables['user']->pass,
      $variables['user']->sid,
      $variables['user']->ssid
    );

    $variables['is_admin'] = $user->hasPermission('access unig admin');
    $variables['access_private_project'] = $user->hasPermission(
      'access private project'
    );
    $variables['logged_in'] = $user->isAuthenticated();
    $variables['album'] = AlbumTrait::getAlbumList($project_nid);
    $variables['project'] = ProjectTrait::buildProject($project_nid);
    $variables['files'] = ProjectTrait::buildFileList($project_nid, $album_nid);

    return $variables;
  }

  /**
   * Get full path to the template.
   *
   * @return string
   *   Path string.
   */
  protected function getProjectPath(): string
  {
    return drupal_get_path('module', $this->getModuleName()) .
      '/templates/unig.project.html.twig';
  }
}
