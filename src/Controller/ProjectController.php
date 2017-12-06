<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\CssCommand;
use Drupal\Core\Ajax\HtmlCommand;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Controller\ControllerBase;
use Drupal\unig\Utility\AlbumTrait;
use Drupal\unig\Utility\FileTrait;
use Drupal\unig\Utility\ProjectListTemplateTrait;
use Drupal\unig\Utility\ProjectTemplateTrait;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\SortTrait;


/**
 * Controller routines for page example routes.
 */
class ProjectController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'unig';
  }

  use ProjectTrait;
  use FileTrait;
  use ProjectListTemplateTrait;
  use ProjectTemplateTrait;
  use SortTrait;


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
  public function ajaxTest($nid) {

    $response = new AjaxResponse();
    $response->addCommand(new ReplaceCommand('#ajax-container', '<div id="ajax-container">' . $nid . '</div>'));
    return $response;

  }

  /**
   * @return \Drupal\Core\Ajax\AjaxResponse
   */
  public function ajaxSetCover($project_nid, $image_nid) {

    $cover_id = ProjectTrait::setCover($project_nid, $image_nid);

    $message = 'Neues Coverbild gesetzt';

    $response = new AjaxResponse();
    $response->addCommand(new ReplaceCommand('#ajax-container', '<div id="ajax-container">' . $message . '</div>'));
    return $response;

  }


  /**
   * @return \Drupal\Core\Ajax\AjaxResponse
   */
  public function ajaxAddAlbum($file_nid, $album_nid) {

    dpm('ajax_setCover: ' . $file_nid, $album_nid);

    $album_name = AlbumTrait::getAlbum($album_nid)->title;

    $cover_id = AlbumTrait::addAlbum($file_nid, $album_nid);

    if ($cover_id) {
      $message = "Das Bild wurde zum Album $album_name hinzugefügt";

    }
    else {
      $message = "Fehler: Das Bild konnte dem Album $album_name nicht hinzugefügt werden";

    }

    $response = new AjaxResponse();
    $response->addCommand(new ReplaceCommand('#ajax-container', '<div id="ajax-container">' . $message . '</div>'));
    return $response;

  }


  /**
   * @return \Drupal\Core\Ajax\AjaxResponse
   */
  public function ajaxDeleteFile($file_nid) {


    $response = new AjaxResponse();

    $result = FileTrait::deleteFile($file_nid);


    if ($result['status']) {
      $response->addCommand(new ReplaceCommand('li.unig-file-' . $file_nid, ''));
    }
    $message = $result['message'];

    $response->addCommand(new ReplaceCommand('#ajax-container', '<div id="ajax-container">' . $message . '</div>'));

    return $response;

  }

  /**
   * @return \Drupal\Core\Ajax\AjaxResponse
   */
  public function ajaxProjectDelete($project_nid) {


    $response = new AjaxResponse();

    $result = ProjectTrait::projectDelete($project_nid);


    if ($result['status']) {
      $response->addCommand(new ReplaceCommand('article.unig-project-' . $project_nid, ''));
    }

    $message = $result['message'];
    $response->addCommand(new ReplaceCommand('#ajax-container', '<div id="ajax-container">' . $message . '</div>'));

    return $response;

  }


  /**
   * @return \Drupal\Core\Ajax\AjaxResponse
   */
  public function ajaxNewAlbumForm($project_nid) {

    $message = 'new form';

    $css = ['display' => 'block'];

    $response = new AjaxResponse();
    $response->addCommand(new CssCommand('#unig-form-new-album-input', $css));
    $response->addCommand(new HtmlCommand('.unig-form-new-album-input-messages', $message));
    return $response;

  }

}
