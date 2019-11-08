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

  public function project($project_id, $album_nid = null)
  {
    if (empty($project_id)) {
      return $this->projectListTemplate();
    }

    return $this->projectTemplate($project_id, $album_nid);
  }

  /**
   * Returns a page title.
   * @param $project_id
   * @param null $album_nid
   * @return string
   */
  public function getTitle($project_id, $album_nid = null): string
  {
    // Get Node from Project
    if ($project_id !== null) {
      $node = Node::load($project_id);
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

  public static function extractKeyword($project_id): JsonResponse
  {
    $output = new OutputController();

    $list = self::importKeywordsFromProject($project_id);

    if ($list && count($list) !== 0) {
      $number_of_images_with_keywords = count($list);
      $output->setMessages(
        'Found Keywords in ' . $number_of_images_with_keywords . ' Images',
        'info'
      );
    } else {
      $output->setMessages('No Keywords found', 'warning');
    }

    return $output->json();
  }

  public static function extractKeywordTest($nid): array
  {
    $version = 3;
    $result = self::importKeywordsFromNode($nid);

    return [
      '#markup' =>
        '
   <p>Version: ' .
        $version .
        '</p>
   <p>extractKeywordTestAction: ' .
        $result .
        '</p>'
    ];
  }

  /**
   * @return JsonResponse
   */
  public function ajaxSetCover($project_id, $image_nid): JsonResponse
  {
    $data = ProjectTrait::setCover($project_id, $image_nid);
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
  public function ajaxProjectDelete($project_id): AjaxResponse
  {
    $response = new AjaxResponse();

    $result = ProjectTrait::projectDelete($project_id);

    if ($result['status']) {
      $response->addCommand(
        new ReplaceCommand('article.unig-project-' . $project_id, '')
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
   * @param $project_id
   *
   * @return AjaxResponse
   */
  public function ajaxNewAlbumForm($project_id): AjaxResponse
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
   * @param $project_id
   *
   * @return JsonResponse
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public function ajaxProjectInfo($project_id): JsonResponse
  {
    if (isset($_POST['project_id'])) {
      $project_id = $_POST['project_id'];
    }

    $response = new JsonResponse();
    $result = ProjectTrait::buildProject($project_id);

    if (!empty($result)) {
      $response->setData($result);
    } else {
      $response->setData(0);
    }

    return $response;
  }
}
