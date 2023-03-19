<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\CssCommand;
use Drupal\Core\Ajax\HtmlCommand;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\unig\Utility\FileTrait;
use Drupal\unig\Utility\ProjectListTemplate;
use Drupal\unig\Utility\Project;
use Drupal\unig\Utility\ProjectTemplate;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\RatingTrait;
use Drupal\unig\Utility\SortTrait;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Controller routines for page example routes.
 */
class ProjectController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  protected function getModuleName(): string {
    return 'unig';
  }

  use FileTrait;
  use SortTrait;
  use RatingTrait;
  use ProjectTrait;

  /**
   *
   */
  public function project($project_id, $album_id = NULL): array {

    if (empty($project_id)) {
      return (new ProjectListTemplate())->getListTemplate();
    }
    return (new ProjectTemplate())->getTemplate($project_id, $album_id);
  }

  /**
   * Returns a page title.
   *
   * @param int|null $project_id
   * @param int|null $album_id
   *
   * @return string
   */
  public static function getTitle(int|null $project_id, int|null $album_id = NULL): string {
    $node = NULL;
    // Get Node from Project.
    if ($project_id !== NULL) {
      $node = Node::load($project_id);
    }

    // Get Node from Album.
    if ($album_id !== NULL) {
      $node = Node::load($album_id);
    }

    // Get Title from loaded Node.
    return $node !== NULL ? $node->getTitle() : t('Project');

  }

  /**
   * @return array
   */
  public function testPage() {
    return [
      '#markup' => '<p>' . $this->t('Test Page') . '</p>',
    ];
  }

  /**
   * @return \Drupal\Core\Ajax\AjaxResponse
   */
  public function ajaxTest($nid): AjaxResponse {
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

  /**
   *
   */
  public static function extractKeyword($project_id): JsonResponse {
    $output = new OutputController();

    $list = self::importKeywordsFromProject($project_id);

    if ($list && count($list) !== 0) {
      $number_of_images_with_keywords = count($list);
      $output->setMessages(
        'Found Keywords in ' . $number_of_images_with_keywords . ' Images',
        'info'
      );
    }
    else {
      $output->setMessages('No Keywords found', 'warning');
    }

    return $output->json();
  }

  /**
   *
   */
  public static function extractKeywordTest($nid): array {
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
        '</p>',
    ];
  }

  /**
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function ajaxSetCover($project_id, $image_nid): JsonResponse {
    $data = self::setCover($project_id, $image_nid);
    return $data->json();
  }

  /**
   * @param $file_id
   * @param $album_id
   *
   * @return \Drupal\Core\Ajax\AjaxResponse
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public function ajaxAddAlbum($file_id, $album_id): AjaxResponse {
    $album_name = AlbumTrait::getAlbum($album_id)->title;

    $cover_id = AlbumTrait::addAlbum($file_id, $album_id);

    if ($cover_id) {
      $message = "Das Bild wurde zum Album $album_name hinzugefügt";
    }
    else {
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
   * @param $file_id
   * @param $project_id
   *
   * @return \Drupal\Core\Ajax\AjaxResponse
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public function ajaxDeleteFile($file_id, $project_id): AjaxResponse {
    $response = new AjaxResponse();

    $result = FileTrait::deleteFile($file_id, $project_id);

    if ($result['status']) {
      $response->addCommand(
        new ReplaceCommand('li.unig-file-' . $file_id, '')
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
   * @return \Drupal\Core\Ajax\AjaxResponse
   */
  public function ajaxProjectDelete($project_id): AjaxResponse {
    $response = new AjaxResponse();

    $result = Project::projectDelete($project_id);

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
   * @return \Drupal\Core\Ajax\AjaxResponse
   */
  public function ajaxNewAlbumForm($project_id): AjaxResponse {
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
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function ajaxProjectInfo($project_id): JsonResponse {
    if (isset($_POST['project_id'])) {
      $project_id = $_POST['project_id'];
    }

    $response = new JsonResponse();
    $project = new Project();
    $result = $project->buildProject($project_id);

    if (!empty($result)) {
      $response->setData($result);
    }
    else {
      $response->setData(0);
    }

    return $response;
  }

  /**
   *
   */
  public function projectListTemplate(): array {
    $template = new ProjectListTemplate();
    return $template->getListTemplate();
  }

}
