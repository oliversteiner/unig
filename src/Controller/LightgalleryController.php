<?php

namespace Drupal\unig\Controller;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Controller\ControllerBase;
use Drupal\unig\Utility\Unig;
use Drupal\unig\Utility\Album;
use Drupal\unig\Utility\FileTrait;
use Drupal\unig\Utility\Project;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Controller routines for page example routes.
 */
class LightgalleryController extends ControllerBase
{
  use FileTrait;

  /**
   * {@inheritdoc}
   */
  protected function getModuleName(): string
  {
    return 'unig';
  }

  /**
   * Generate a render array with our Admin content.
   *
   * @param      $project_id
   * @param null $album_id
   *
   * @return array A render array.
   * A render array.
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public function getTemplate($project_id, $album_id = null): array
  {
    // Make sure you don't trust the URL to be safe! Always check for exploits.
    if (!is_numeric($project_id)) {
      // We will just show a standard "access denied" page in this case.
      throw new AccessDeniedHttpException();
    }

    $template_path = $this->getTemplatePath();
    $template = file_get_contents($template_path);
    $build = [
      'description' => [
        '#type' => 'inline_template',
        '#template' => $template,
        '#context' => $this->getTemplateVariables($project_id, $album_id)
      ]
    ];
    $build['#attached']['library'] = 'unig/unig.project.public';
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
   */
  protected function getTemplateVariables($project_id, $album_id = null): array
  {
    $project = new Project();
    $variables['module'] = Unig::getModulName();
    $variables['album'] = Album::getAlbumList($project_id);
    $variables['project'] = $project->buildProject($project_id);
    $variables['files'] = $project->buildFileList($project_id, $album_id);
    $user = Drupal::currentUser();
    $variables['user'] = clone $user;
    return $variables;
  }

  /**
   * Get full path to the template.
   *
   * @return string
   *   Path string.
   */
  protected function getTemplatePath(): string
  {
    return Unig::getTemplatePath() .
      '/unig.project-public.html.twig';
  }
}
