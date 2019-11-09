<?php


namespace Drupal\unig\Models;


use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Drupal\unig\Utility\UnigCache;

class UnigFile
{
  public const type = 'unig_file';

  /* Drupal Fields */
  public const field_album = 'field_unig_album';
  public const field_copyright = 'field_unig_copyright';
  public const field_description = 'field_unig_description';
  public const field_file = 'field_unig_file';
  public const field_image = 'field_unig_image';
  public const field_keywords = 'field_unig_keywords';
  public const field_people = 'field_unig_people';
  public const field_project = 'field_unig_project';
  public const field_rating = 'field_unig_rating';
  public const field_title_generated = 'field_unig_title_generated';
  public const field_trash = 'field_unig_trash';
  public const field_weight = 'field_unig_weight';


  /**
   * @param $file_id
   * @param null $project_id
   * @return array
   * @throws EntityStorageException
   */
  public static function delete($file_id, $project_id = null): array
  {

    $status = false;
    $message = $file_id;

    if ($file_id) {
      $node = Node::Load($file_id);

      // load node
      if ($node) {
        $node->delete();

        // Node delete succses
        $status = true;
        $message = 'Die Datei mit der ID ' . $file_id . ' wurde gelöscht';

        // Clear Project Cache
        if ($project_id) {
          UnigCache::clearProjectCache($project_id);
        }
      }
      // no Node found
      else {
        $status = false;
        $message = 'kein File mit der ID ' . $file_id . ' gefunden';
      }
    }

    // Output
    return [
      'status' => $status,
      'message' => $message
    ];
  }
}
