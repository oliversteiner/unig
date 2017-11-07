<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\unig\Utility\AdminTemplateTrait;
use Drupal\unig\Utility\AlbumTrait;
use Drupal\unig\Utility\FileTrait;
use Drupal\unig\Utility\ProjectTrait;

/**
 * Controller routines for page example routes.
 */
class AdminController extends ControllerBase {

  use ProjectTrait;
  use FileTrait;
  use AdminTemplateTrait;

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'unig';
  }

  /**
   * @return array
   */
  public function testConfig() {

    // Default settings.
    $config = \Drupal::config('unig.settings');
    // Page title and source text.
    $page_title = $config->get('unig.page_title');
    $source_text = $config->get('unig.source_text');

    return [
      '#markup' => '<p>page_title = ' . $page_title . '</p>' .
        '<p>source_text = ' . $source_text . '</p>',
    ];
  }

  /**
   * @return array
   */
  public function sandboxPage() {

    $nid_project = 43;
    //  $result_1 = ProjectTrait::getListofFilesInProject($nid_project);


    // Test setPrevewImage

    $target_nid = 43;
    $album_nid = 82;




    //  $result_2 = ProjectTrait::setCover($nid_project, $nid_image);
    //  $result_3 = ProjectTrait::countFilesInProject($nid_project);

    $result_4 = AlbumTrait::addAlbum($target_nid, $album_nid);


    $result_5 = AlbumTrait::getAlbumList($target_nid);
    kint($result_5);

    $target_nid = 48;
    $result_6 = FileTrait::deleteFile($target_nid);

    $output[] = 'status: ' . $result_6['status'];
    $output[] = 'message: ' . $result_6['message'];

    kint($result_6);


    $form['list'] = [
      '#markup' => '<p>Sandbox</p>' .
        '<hr>' .
        '<div class="unig-sandbox"><pre>' . $result_4 . '</pre></div>' .
        //
        '<div class="unig-sandbox"><pre>' .$output[0]. '</pre></div>' .
        '<div class="unig-sandbox"><pre>' .$output[1]. '</pre></div>' .
        '<hr>',
    ];


    return $form;
  }


}
