<?php

namespace Drupal\unig\Controller;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\unig\Utility\AlbumTrait;
use Drupal\unig\Utility\CacheTrait;
use Drupal\unig\Utility\ProjectTemplateTrait;
use Drupal\unig\Utility\ProjectTrait;
use Symfony\Component\HttpFoundation\JsonResponse;

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

    $result = self::clearProjectCache($id);

    $response = [
      'label' => $label,
      'path' => $base . $name,
      'version' => $version,
      'projectId' => $id,
      'clearCache' => $result
    ];

    return new JsonResponse($response);
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

    $result = self::clearProjectCache($id);
    $variables = [];
    $variables['album'] = AlbumTrait::getAlbumList($id);
    $variables['project'] = ProjectTrait::buildProject($id);
    $variables['files'] = ProjectTrait::buildFileList($id, null);
    $result = self::saveProjectCache($id, $variables);

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
