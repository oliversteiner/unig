<?php
  /**
   * Created by PhpStorm.
   * User: ost
   * Date: 14.01.18
   * Time: 00:26
   */

  namespace Drupal\unig\Controller;


  use Drupal\Core\Controller\ControllerBase;
  use Drupal\Core\Url;
  use Drupal\unig\Utility\ProjectTrait;
  use Symfony\Component\HttpFoundation\JsonResponse;
  use Symfony\Component\HttpFoundation\Response;

  class DownloadController extends ControllerBase {


    function __construct() {


    }

    /**
     * {@inheritdoc}
     */
    protected function getModuleName() {
      return 'unig';
    }

    function bulkDownload() {


      $data = $_POST['data'];
      $project_nid = $_POST['project_nid'];
      $image_style = '';
      $files = [];
      $size = $data['size'];
      $items = $data['items'];

      $project = ProjectTrait::buildProject($project_nid);


      switch ($size) {
        case 'sd':
          $image_style = 'unig_big';
          break;

        case 'hd':
          $image_style = 'unig_hd';
          break;

        case 'max':
          $image_style = 'original';
          break;
      }

      $public_path = \Drupal::service('file_system')
        ->realpath(file_default_scheme() . "://");
      $destination = $public_path . '/zip/';


      foreach ($items as $item) {


        $images = ProjectTrait::getImage($item);

        $uri = $images[$image_style]['uri'];
        $files[] = $uri;
        //  echo $uri . "\r";


      } // foreach

      $dest = $GLOBALS['base_url'] . '/sites/default/files/zip/';
      $destination = \Drupal::service('file_system')->realpath('public://zip');

      $zip = new \ZipArchive();
      $zipName = $project['title_url'] . '-' . $size . '-' . time() . ".zip";
      $zip->open($destination . '/' . $zipName, \ZipArchive::CREATE);
      foreach ($files as $f) {
        $zip->addFromString(basename($f), file_get_contents($f));
      }
      $zip->close();

      $url = $dest . $zipName;
      $output = [
        'status' => TRUE,
        'messages' => 'ok',
        'zip' => $url,
      ];

      sleep(3); // simulating long time zip generation

      $response = new JsonResponse();
      $response->setData($output);
      return $response;
    }


    public function downloadZip($files) {


      /*      $files = [
              '/Users/ost/MAMP/drullo/web/sites/default/files/unig/42/Op-17-ost-721.jpg',
              '/Users/ost/MAMP/drullo/web/sites/default/files/unig/42/Op-17-ost-722.jpg',
              '/Users/ost/MAMP/drullo/web/sites/default/files/unig/42/Op-17-ost-723.jpg',
            ];*/


      $zip = new \ZipArchive();
      $zipName = 'Documents_' . time() . ".zip";
      $zip->open($zipName, \ZipArchive::CREATE);
      foreach ($files as $f) {
        $zip->addFromString(basename($f), file_get_contents($f));
      }
      $zip->close();


      $response = new Response(file_get_contents($zipName));
      $response->headers->set('Content-Type', 'application/zip');
      $response->headers->set('Content-Disposition', 'attachment;filename="' . $zipName . '"');
      $response->headers->set('Content-length', filesize($zipName));

      return $response;
    }



  }