<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\unig\Utility\AlbumTrait;
use Drupal\unig\Utility\FileTrait;
use Drupal\unig\Utility\ProjectTrait;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;


/**
 * Controller routines for page example routes.
 */
class LightgalleryController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'unig';
  }

  use ProjectTrait;
  use FileTrait;


  /**
   * Generate a render array with our Admin content.
   *
   * @param      $project_nid
   * @param null $album_nid
   *
   * @return array A render array.
   * A render array.
   */
  public function getTemplate($project_nid, $album_nid = NULL) {

    // Make sure you don't trust the URL to be safe! Always check for exploits.
    if (!is_numeric($project_nid)) {
      // We will just show a standard "access denied" page in this case.
      throw new AccessDeniedHttpException();
    }


    $template_path = $this->getTemplatePath();
    $template = file_get_contents($template_path);
    $build = [
      'description' => [
        '#type' => 'inline_template',
        '#template' => $template,
        '#context' => $this->getTemplateVariables($project_nid, $album_nid),
      ],
    ];
    return $build;
  }


  /**
   * Variables to act as context to the twig template file.
   *
   * @return array
   *   Associative array that defines context for a template.
   */
  protected function getTemplateVariables($project_nid, $album_nid = NULL) {


    $variables['module'] = $this->getModuleName();
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
  protected function getTemplatePath() {
    return drupal_get_path('module', $this->getModuleName()) . "/templates/unig.lightgallery.html.twig";
  }

}
