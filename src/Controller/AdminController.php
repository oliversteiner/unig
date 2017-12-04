<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\unig\Utility\AdminTemplateTrait;
use Drupal\unig\Utility\AlbumTrait;
use Drupal\unig\Utility\FileTrait;
use Drupal\unig\Controller\IptcController;
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

   // $result_4 = AlbumTrait::addAlbum($target_nid, $album_nid);

//    $fid = 93; // Apollobook
/*    $fid = 74; // Z-77

    $iptc_data = new IptcController($fid);
    $output[0] = $iptc_data->getPeopleTerms();
    $output[1] = $iptc_data->getKeywordTerms();*/


    $project_nid = 101 ;
    ProjectTrait::importKeywordsFromProject($project_nid);





    $output = [];

    $form['list'] = [
      '#markup' => '<p>Sandbox</p>' .
        '<hr>' .
        //
       '<div class="unig-sandbox"><pre>' .$output[0]. '</pre></div>' .
        '<div class="unig-sandbox"><pre>' .$output[1]. '</pre></div>' .
        '<hr>',
    ];


    return $form;
  }



}
