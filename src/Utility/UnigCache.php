<?php


namespace Drupal\unig\Utility;


use Drupal;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Drupal\unig\Models\UnigProject;

class UnigCache
{

  /**
   * @param $id
   * @return bool
   * @throws EntityStorageException
   */
  public static function clearProjectCache($id): bool
  {
    $node = Node::load($id);

    // if vars in cache load cache
    if (!empty($node)) {
      $node->set(UnigProject::field_cache, false);
      $node->save();
    }

    // Check if cache is empty
    $cache = self::loadProjectCache($id);
    if (empty($cache) || !$cache) {
      return true;
    }

    return false;
  }


  /**
   * @param $id
   * @return array
   */
  public static function loadProjectCache($id): array
  {
    $cache = [];
    $node = Node::load($id);

    // if vars in cache load cache
    if (!empty($node)) {
      $value = $node->get(UnigProject::field_cache)->getValue();

      if ($value && $value[0] && $value[0]['value']) {
        $cache_serialized = $value[0]['value'];
        $cache = json_decode($cache_serialized, true);
      }

    }
    return $cache;
  }

  /**
   * @param $id
   * @param $variables
   * @return bool
   */
  public static function saveProjectCache($id, $variables): bool
  {
    $node = Node::load($id);

    // if vars in cache load cache
    if (!empty($node)) {
      $node->set(UnigProject::field_cache, json_encode($variables));
      try {
        $node->save();
        return true;
      } catch (EntityStorageException $e) {
        $message = 'cant save cache for Project' . $id . ' - ' . $e;
        Drupal::logger('unig')->warning($message);
      }
    }

    return false;
  }

}
