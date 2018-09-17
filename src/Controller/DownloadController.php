<?php

  namespace Drupal\unig\Controller;


  use Drupal\Core\Controller\ControllerBase;
  use Drupal\Core\Url;
  use Drupal\unig\Utility\ProjectTrait;
  use FilesystemIterator;
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

      $this->deleteZips();

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


    public function deleteZips(){

      $path = $GLOBALS['base_url'] . '/sites/default/files/zip/';

      $fileSystemIterator = new FilesystemIterator($path);
      $now = time();
      foreach ($fileSystemIterator as $file) {
        if ($now - $file->getCTime() >= 60 * 60 * 24 * 2) // 2 days
          unlink('logs/'.$file->getFilename());
      }
    }



  }