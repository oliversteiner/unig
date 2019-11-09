<?php

namespace Drupal\unig\Controller;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\unig\Models\UnigFile;
use Drupal\unig\Utility\AlbumTrait;
use Drupal\unig\Utility\ProjectTemplateTrait;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\UnigCache;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Class APIController.
 */
class UnigAPIController extends ControllerBase
{
  use projectTemplateTrait;

  /**
   * @param $id
   * @return JsonResponse
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   * @throws EntityStorageException
   */
  public function project($id): JsonResponse
  {
    // Get HTTP Vars
    $post_as_json = \Drupal::request()->getContent();
    $methode = \Drupal::request()->getMethod();

    $data = json_decode($post_as_json, true);

    // CREATE

    // DELETE

    // UPDATE

    // GET

    $label = 'Unig Project Variables';
    $name = 'project';
    $base = 'unig/api/';
    $version = '1.0.0';

    $project = $this->getProjectVariables($id, null);

    $response = [
      'label' => $label,
      'path' => $base . $name,
      'version' => $version,
      'project' => $project
    ];

    return new JsonResponse($response);
  }

  /**
   * Name of our module.
   *
   * @return string
   *   A module name.
   */
  protected function getModuleName(): string
  {
    return 'unig';
  }

  /**
   * @param $id
   * @return JsonResponse
   * @throws EntityStorageException
   */
  public function clearCache($id): JsonResponse
  {
    $label = 'Unig Project Clear Cache';
    $name = 'cc';
    $base = 'unig/api/';
    $version = '1.0.0';

    $result = UnigCache::clearProjectCache($id);

    $response = [
      'label' => $label,
      'path' => $base . $name,
      'version' => $version,
      'projectId' => $id,
      'clearCache' => $result
    ];

    return new JsonResponse($response);
  }

  public function file(): JsonResponse
  {
    $post_as_json = \Drupal::request()->getContent();
    $methods = \Drupal::request()->getMethod();

    $data = json_decode($post_as_json, true);

    return new JsonResponse($methods);
  }

  /**
   * @param $file_id
   * @param $project_id
   * @return JsonResponse
   * @Method("DELETE")
   * @Route(unig.api.file.delete)
   * @throws EntityStorageException
   */
  public function fileDelete($file_id, $project_id): JsonResponse
  {

    $result = UnigFile::delete($file_id, $project_id);

    return new JsonResponse($result);
  }

  /**
   * @param $file_id
   * @param $value
   * @param $project_id
   * @return JsonResponse
   */
  public function fileFavorite($file_id, $value, $project_id): JsonResponse
  {
    $result = UnigFile::favorite($file_id, $value, $project_id);

    return new JsonResponse($result);
  }

  /**
   * @param $id
   * @return JsonResponse
   * @throws EntityStorageException
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public function rebuildCache($id): JsonResponse
  {
    $label = 'Unig Project Rebuild Clear Cache';
    $name = 'rc';
    $base = 'unig/api/';
    $version = '1.0.0';

    $result = UnigCache::clearProjectCache($id);
    $variables = [];
    $variables['album'] = AlbumTrait::getAlbumList($id);
    $variables['project'] = ProjectTrait::buildProject($id);
    $variables['files'] = ProjectTrait::buildFileList($id, null);
    $result = UnigCache::saveProjectCache($id, $variables);

    $response = [
      'label' => $label,
      'path' => $base . $name,
      'version' => $version,
      'projectId' => $id,
      'rebuildCache' => $result
    ];

    return new JsonResponse($response);
  }
}
