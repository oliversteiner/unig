<?php

namespace Drupal\unig\Utility;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\file\Entity\File;
use Drupal\node\Entity\Node;
use Drupal\unig\Controller\IptcController;
use Drupal\unig\Controller\OutputController;

/**
 * Trait FileTrait
 *
 * @package Drupal\unig\Utility
 *
 *
 * TODO: replace German Strings
 * TODO: replace drupal_Set_message
 *
 */
trait FileTrait {

  public $bundle_file = 'unig_file';

  // define Extensions to be used als imagefield
  // TODO: move to settings page
  private $ext_image = ['jpg', 'jpeg', 'gif', 'png', 'svg'];

  /**
   * createNodeUniGImage
   *
   * Node Fields:
   *      - field_unig_project: Entity
   *      - field_unig_image : Image
   *
   *
   * @param $file_tmp
   * @param $project_id
   *
   * @return int
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public function createNodeUniGImage($file_tid, $project_id = NULL): int {
    // define entity type and bundle
    $entity_type = 'node';

    // get fid of the temporary uploaded file
    $file = $this->uploadFile($file_tid, $project_id);


    // Node Title is filename without file extension
    $node_title = $file['name'];

    // get definition of target entity type
    $storage = Drupal::entityTypeManager()->getStorage($entity_type);

    // load up an array for creation
    $new_unig_file = $storage->create([
      'title' => $node_title,
      'status' => 0, //(1 or 0): published or not
      'promote' => 0, //(1 or 0): promoted to front page
      'type' => 'unig_file',
    ]);

    // Set true for generated Title
    if (!empty($new_unig_file->field_unig_title_generated)) {
      $new_unig_file->field_unig_title_generated->setValue(1);
    }

    if (!empty($new_unig_file->field_unig_project)) {
      $new_unig_file->field_unig_project->setValue([
        'target_id' => $project_id,
      ]);
    }

    // check file if Image or File:
    if (in_array($file['extension'], $this->ext_image)) {
      // if Image save to Imagefield
      if (!empty($new_unig_file->field_unig_image)) {
        $new_unig_file->field_unig_image->setValue([
          'target_id' => $file['id'],
        ]);
      }

      // IPTC
      $iptc = new IptcController($file['id'], $project_id);
      $keywords = $iptc->getKeywordTermIDs();
      $people = $iptc->getPeopleTermIds();

      // Keywords
      if (!empty($keywords)) {
        $value_keywords = [];
        foreach ($keywords as $keyword) {
          $value_keywords[] = ['target_id' => $keyword];
        }

        $new_unig_file->field_unig_keywords = $value_keywords;
      }

      // People
      if (!empty($people)) {
        $value_people = [];
        foreach ($people as $dude) {
          $value_people[] = ['target_id' => $dude];
        }
        $new_unig_file->field_unig_people = $value_people;
      }
    }
    else {
      // if other save for Filefield
    }

    try {
      $new_unig_file->save();
    } catch (EntityStorageException $e) {
    }

    // hole die neu erstellte ID
    return $new_unig_file->id();
  }

  /**
   * @param $values
   *
   * @return array
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public function createMultiNode($values): array {
    // Create Multiple Nodes
    $node_ids = [];
    $file_upload = $values['file_upload'];
    $project_id = $values['project_id'];

    foreach ($file_upload as $file_tmp) {
      $node_ids[] = $this->createNodeUniGImage($file_tmp, $project_id);
    }

    return $node_ids;
  }

  /**
   * @param $file_id
   *
   * @return array
   * @throws EntityStorageException
   * @internal param $values
   * TODO: Deprecated
   */
  public static function deleteFile($file_id, $project_id = NULL): array {
    $status = FALSE;
    $message = $file_id;

    if ($file_id) {
      $node = Node::Load($file_id);

      // load node
      if ($node) {
        $node->delete();

        // Node delete succses
        $status = TRUE;
        $message = 'Die Datei mit der ID ' . $file_id . ' wurde gelöscht';

        // Clear Project Cache
        if ($project_id) {
          UnigCache::clearProjectCache($project_id);
        }
      }
      // no Node found
      else {
        $status = FALSE;
        $message = 'kein File mit der ID ' . $file_id . ' gefunden';
      }
    }

    // Output
    return [
      'status' => $status,
      'message' => $message,
    ];
  }

  /**
   * @param $tid
   * @param $project_id
   * @param array $validators
   *
   * @return array
   */
  public function uploadFile($tid, $project_id): array {

    $config = \Drupal::config('unig.settings');


    $path_destination = 'public://';
    $path_unig = 'unig/';

    $path_project = $project_id . '/';
    $validators = $config->get('file_validate_extensions');
    $file = File::load($tid);

    if ($file === NULL) {
      return [];
    }

    $file->setPermanent();
    $file_name = $file->getFilename();
    $file_uri = $file->getFileUri();
    $file_id = $file->id();
    $file_extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    $file_mime = $file->getMimeType();
    $this->checkProjectDir($path_destination, $path_unig, $path_project);

    $destination = $path_destination . $path_unig . $path_project . $file_name;

    // Create file object from a locally copied file.
    // $uri = file_unmanaged_copy($tmppath, $uri_destination, FILE_EXISTS_REPLACE);
    $upload_name = 'file_upload';
//  file_move(FileInterface $source, $destination = NULL, $replace = FILE_EXISTS_RENAME) {
    $result = file_move($file, $destination, true);

    // move file to destination
    if ($result) {
      $file->setFileUri($destination);
    }
    $file->save();


    return [
      'id' => $file_id,
      'name' => $file_name,
      'extension' => $file_extension,
      'mime' => $file_mime,
    ];


  }

  function createStyle($image_uri, $style_name) {
    CreateImageStylesTrait::createImageStyles($image_uri, $style_name);
  }

}
