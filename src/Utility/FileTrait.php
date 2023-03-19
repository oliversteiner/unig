<?php

namespace Drupal\unig\Utility;

use Drupal\Core\Entity\EntityStorageException;
use Drupal\file\Entity\File;
use Drupal\node\Entity\Node;
use Drupal\unig\Controller\IptcController;

/**
 * Trait FileTrait.
 *
 * @package Drupal\unig\Utility
 *
 * @todo replace German Strings
 * @todo replace drupal_Set_message
 */
trait FileTrait {

  public $bundle_file = 'unig_file';

  // Define Extensions to be used als imagefield.
  /**
   * @todo move to settings page.
   */
  private $ext_image = ['jpg', 'jpeg', 'gif', 'png', 'svg'];

  /**
   * CreateNodeUniGImage.
   *
   * Node Fields:
   *      - field_unig_project: Entity
   *      - field_unig_image : Image.
   *
   * @param $file_tmp
   * @param $project_id
   *
   * @return int
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function createNodeUniGImage($file_tid, $project_id = NULL): int {
    // Define entity type and bundle.
    $entity_type = 'node';

    // Get fid of the temporary uploaded file.
    $file = $this->uploadFile($file_tid, $project_id);

    // Node Title is filename without file extension.
    $node_title = $file['name'];

    // Get definition of target entity type.
    $storage = \Drupal::entityTypeManager()->getStorage($entity_type);

    // Load up an array for creation.
    $new_unig_file = $storage->create([
      'title' => $node_title,
    // (1 or 0): published or not
      'status' => 0,
    // (1 or 0): promoted to front page
      'promote' => 0,
      'type' => 'unig_file',
    ]);

    // Set true for generated Title.
    if (!empty($new_unig_file->field_unig_title_generated)) {
      $new_unig_file->field_unig_title_generated->setValue(1);
    }

    if (!empty($new_unig_file->field_unig_project)) {
      $new_unig_file->field_unig_project->setValue([
        'target_id' => $project_id,
      ]);
    }

    // Check file if Image or File:
    if (in_array($file['extension'], $this->ext_image)) {
      // If Image save to Imagefield.
      if (!empty($new_unig_file->field_unig_image)) {
        $new_unig_file->field_unig_image->setValue([
          'target_id' => $file['id'],
        ]);
      }

      // IPTC.
      $iptc = new IptcController($file['id'], $project_id);
      $keywords = $iptc->getKeywordTermIDs();
      $people = $iptc->getPeopleTermIds();

      // Keywords.
      if (!empty($keywords)) {
        $value_keywords = [];
        foreach ($keywords as $keyword) {
          $value_keywords[] = ['target_id' => $keyword];
        }

        $new_unig_file->field_unig_keywords = $value_keywords;
      }

      // People.
      if (!empty($people)) {
        $value_people = [];
        foreach ($people as $dude) {
          $value_people[] = ['target_id' => $dude];
        }
        $new_unig_file->field_unig_people = $value_people;
      }
    }

    try {
      $new_unig_file->save();
    }
    catch (EntityStorageException $e) {
    }

    // Hole die neu erstellte ID.
    return $new_unig_file->id();
  }

  /**
   * @param $values
   *
   * @return array
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function createMultiNode($values): array {
    // Create Multiple Nodes.
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
   * @throws \Drupal\Core\Entity\EntityStorageException
   * @internal param $values
   * @todo Deprecated
   */
  public static function deleteFile($file_id, $project_id = NULL): array {
    $status = FALSE;
    $message = $file_id;

    if ($file_id) {
      $node = Node::Load($file_id);

      // Load node.
      if ($node) {
        $node->delete();

        // Node delete success.
        $status = TRUE;
        $message = 'Die Datei mit der ID ' . $file_id . ' wurde gelöscht';

        // Clear Project Cache.
        if ($project_id) {
          UnigCache::clearProjectCache($project_id);
        }
      }
      // No Node found.
      else {
        $status = FALSE;
        $message = 'kein File mit der ID ' . $file_id . ' gefunden';
      }
    }

    // Output.
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

    $path_destination = 'public://';
    $path_unig = 'unig/';
    $path_project = $project_id . '/';

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
    self::checkProjectDir($path_destination, $path_unig, $path_project);

    $destination = $path_destination . $path_unig . $path_project . $file_name;

    // Validate file type.
    $mime_type = \Drupal::service('file.mime_type.guesser.extension')
      ->guess($file_uri);
    if ($file_mime !== $mime_type) {
      \Drupal::logger('Wrong Mime-Type for File ' . $file_name);
      return [];
    }

    // Move file to destination.
    $result = move_uploaded_file($file_name, $destination);

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

  /**
   *
   */
  public function createStyle($image_uri, $style_name) {
    CreateImageStyles::createStyles($image_uri, $style_name);
  }

}
