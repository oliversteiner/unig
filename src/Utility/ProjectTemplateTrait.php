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
trait ProjectTemplateTrait
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
   * @param      $project_id
   * @param null $album_id
   *
   * @return array A render array.
   * A render array.
   * @throws Drupal\Core\Entity\EntityStorageException
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public function projectTemplate($project_id, $album_id = null): array
  {
    // Times to Load
    // build without cache : 8.2914
    // load from cache field : 0.0619

    $time = microtime();
    $time = explode(' ', $time);
    $time = $time[1] + $time[0];
    $start = $time;

    // Make sure you don't trust the URL to be safe! Always check for exploits.
    if (!is_numeric($project_id)) {
      // We will just show a standard "access denied" page in this case.
      throw new AccessDeniedHttpException();
    }

    $project_variables = $this->getProjectVariables($project_id, $album_id);

    $template_path = $this->getProjectPath();
    $template = file_get_contents($template_path);
    $build = [
      'description' => [
        '#type' => 'inline_template',
        '#template' => $template,
        '#context' => $project_variables
      ]
    ];

    // Project Variables for JS
    $build['#attached']['drupalSettings']['unig']['project'] = $project_variables;

    $host = \Drupal::request()->getSchemeAndHttpHost();
    $module = drupal_get_path('module', $this->getModuleName());
    $build['#attached']['drupalSettings']['unig']['path'] = $host . '/' . $module;


    // Adding JS Library depends of admin or not
    if (
      Drupal::currentUser()->hasPermission('access unig admin') ||
      Drupal::currentUser()->hasPermission('access unig download')
    ) {
      $build['#attached']['library'] = 'unig/unig.project.admin';
    } else {
      $build['#attached']['library'] = 'unig/unig.project.public';
    }

    $time = microtime();
    $time = explode(' ', $time);
    $time = $time[1] + $time[0];
    $finish = $time;
    $total_time = round($finish - $start, 4);

    $build['#attached']['drupalSettings']['unig']['project']['time'] = $total_time;

    return $build;
  }

  /**
   * Variables to act as context to the twig template file.
   *
   * @param $project_id
   * @param null $album_id
   * @return array
   *   Associative array that defines context for a template.
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   * @throws Drupal\Core\Entity\EntityStorageException
   */
  protected function getProjectVariables($project_id, $album_id = null): array
  {
    // load Cache
    $cache = UnigCache::loadProjectCache($project_id);

    if (!empty($cache)) {
      $variables['album'] = $cache['album'];
      $variables['project'] = $cache['project'];
      $variables['files'] = $cache['files'];
      $variables['keywords'] = $cache['keywords'];
      $variables['people'] = $cache['people'];
    } else {
      // generate Project items
      $variables['album'] = AlbumTrait::getAlbumList($project_id);
      $variables['keywords'] = ProjectTrait::getKeywordTerms($project_id);
      $variables['people'] = ProjectTrait::getPeopleTerms($project_id);
      $variables['project'] = ProjectTrait::buildProject($project_id);
      $variables['files'] = ProjectTrait::buildFileList(
        $project_id,
        $album_id
      );

      // save project variables to cache
      // TODO: activate Cache
   //   UnigCache::saveProjectCache($project_id, $variables);
    }

    // Module
    $variables['module'] = $this->getModuleName();

    // Language
    $language = Drupal::languageManager()
      ->getCurrentLanguage()
      ->getId();
    $variables['language'] = $language;

    // Generate User Items
    $user = Drupal::currentUser();

    // TODO: Remove deprecated Code
    /*    $variables['user'] = clone $user;
    // Remove password and session IDs, since themes should not need nor see them.
    unset(
      $variables['user']->pass,
      $variables['user']->sid,
      $variables['user']->ssid
    );*/

    $variables['is_admin'] = $user->hasPermission('access unig admin');
    $variables['can_download'] = $user->hasPermission('access unig download');
    $variables['access_private_project'] = $user->hasPermission(
      'access private project'
    );
    $variables['logged_in'] = $user->isAuthenticated();

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
    $user = Drupal::currentUser();
    $template = 'unig.project-public.html.twig';

    // User is logged in
    if ($user->hasPermission('access unig download')) {
      $template = 'unig.project-download.html.twig';
    }

    // User is Admin
    if ($user->hasPermission('access unig admin')) {
      $template = 'unig.project-admin.html.twig';
    }

    return drupal_get_path('module', $this->getModuleName()) .
      '/templates/' .
      $template;
  }
}
