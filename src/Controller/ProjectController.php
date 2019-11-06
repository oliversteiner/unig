<?php

namespace Drupal\unig\Controller;

use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\CssCommand;
use Drupal\Core\Ajax\HtmlCommand;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Drupal\unig\Utility\AlbumTrait;
use Drupal\unig\Utility\FileTrait;
use Drupal\unig\Utility\ProjectListTemplateTrait;
use Drupal\unig\Utility\ProjectTemplateTrait;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\RatingTrait;
use Drupal\unig\Utility\SortTrait;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Controller routines for page example routes.
 */
class ProjectController extends ControllerBase
{
  /**
   * {@inheritdoc}
   */
  protected function getModuleName()
  {
    return 'unig';
  }

  use ProjectTrait;
  use FileTrait;
  use ProjectListTemplateTrait;
  use ProjectTemplateTrait;
  use SortTrait;
  use RatingTrait;

  public function project($project_nid, $album_nid = null)
  {
    if (empty($project_nid)) {
      return $this->projectListTemplate();
    }

    return $this->projectTemplate($project_nid, $album_nid);
  }

  /**
   * Returns a page title.
   * @param $project_nid
   * @param null $album_nid
   * @return string
   */
  public function getTitle($project_nid, $album_nid = null): string
  {
    // Get Node from Project
    if ($project_nid !== null) {
      $node = Node::load($project_nid);
    }

    // Get Node from Album
    if ($album_nid !== null) {
      $node = Node::load($album_nid);
    }

    // Get Title from loaded Node
    return !empty($node) ? $node->getTitle() : t('Project');
  }

  /**
   * @return array
   */
  public function testPage()
  {
    return [
      '#markup' => '<p>' . $this->t('Test Page') . '</p>'
    ];
  }

  /**
   * @return AjaxResponse
   */
  public function ajaxTest($nid): AjaxResponse
  {
    $message = $nid;
    $response = new AjaxResponse();
    $response->addCommand(
      new ReplaceCommand(
        '.unig-ajax-container',
        '<div class="unig-ajax-container active">' . $message . '</div>'
      )
    );
    return $response;
  }

  public function extractKeyword(): JsonResponse
  {

    $output = new OutputController();

    $output->setMessages('test', 'info');

    return $output->json();
  }

  /**
   * @return JsonResponse
   */
  public function ajaxSetCover($project_nid, $image_nid): JsonResponse
  {
    $data = ProjectTrait::setCover($project_nid, $image_nid);
    return $data->json();
  }

  /**
   * @param $file_nid
   * @param $album_nid
   * @return AjaxResponse
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   * @throws EntityStorageException
   */
  public function ajaxAddAlbum($file_nid, $album_nid): AjaxResponse
  {
    $album_name = AlbumTrait::getAlbum($album_nid)->title;

    $cover_id = AlbumTrait::addAlbum($file_nid, $album_nid);

    if ($cover_id) {
      $message = "Das Bild wurde zum Album $album_name hinzugefügt";
    } else {
      $message = "Fehler: Das Bild konnte dem Album $album_name nicht hinzugefügt werden";
    }

    $response = new AjaxResponse();
    $response->addCommand(
      new ReplaceCommand(
        '.unig-ajax-container',
        '<div class="unig-ajax-container active">' . $message . '</div>'
      )
    );
    return $response;
  }

  /**
   * @param $file_nid
   * @return AjaxResponse
   * @throws EntityStorageException
   */
  public function ajaxDeleteFile($file_nid): AjaxResponse
  {
    $response = new AjaxResponse();

    $result = FileTrait::deleteFile($file_nid);

    if ($result['status']) {
      $response->addCommand(
        new ReplaceCommand('li.unig-file-' . $file_nid, '')
      );
    }
    $message = $result['message'];

    $response->addCommand(
      new ReplaceCommand(
        '.unig-ajax-container',
        '<div class="unig-ajax-container active">' . $message . '</div>'
      )
    );

    return $response;
  }

  /**
   * @return AjaxResponse
   */
  public function ajaxProjectDelete($project_nid): AjaxResponse
  {
    $response = new AjaxResponse();

    $result = ProjectTrait::projectDelete($project_nid);

    if ($result['status']) {
      $response->addCommand(
        new ReplaceCommand('article.unig-project-' . $project_nid, '')
      );
    }

    $message = $result['message'];
    $response->addCommand(
      new ReplaceCommand(
        '.unig-ajax-container',
        '<div class="unig-ajax-container active">' . $message . '</div>'
      )
    );

    return $response;
  }

  /**
   * @param $project_nid
   *
   * @return AjaxResponse
   */
  public function ajaxNewAlbumForm($project_nid): AjaxResponse
  {
    $message = 'new form';
    $css = ['display' => 'block'];
    $response = new AjaxResponse();
    $response->addCommand(new CssCommand('#unig-form-new-album-input', $css));
    $response->addCommand(
      new HtmlCommand('.unig-form-new-album-input-messages', $message)
    );
    return $response;
  }

  /**
   * @param $project_nid
   *
   * @return JsonResponse
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public function ajaxProjectInfo($project_nid): JsonResponse
  {
    if (isset($_POST['project_nid'])) {
      $project_nid = $_POST['project_nid'];
    }

    $response = new JsonResponse();
    $result = ProjectTrait::buildProject($project_nid);

    if (!empty($result)) {
      $response->setData($result);
    } else {
      $response->setData(0);
    }

    return $response;
  }
}
