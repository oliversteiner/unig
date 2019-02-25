<?php

namespace Drupal\unig\Utility;

trait AlbumTrait
{
  /**
   * @param $album_nid
   *
   * @return mixed
   */
  public static function getAlbum($album_nid)
  {
    $entity = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->load($album_nid);

    // NID
    $nid = $entity->id();

    // Title
    $title = $entity->label();

    // Twig-Variables
    $album = [
      'nid' => $nid,
      'title' => $title,
    ];

    return $album;
  }

  /**
   * @param $nid
   *
   * @return mixed
   * @internal param $file_nid
   *
   */
  public static function getAlbumList($nid)
  {
    $album_nids = [];
    $albums = [];

    $entity = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->load($nid);

    if (!empty($entity->field_unig_album)) {
      if (isset($entity->field_unig_album->entity)) {
        foreach ($entity->field_unig_album as $album) {
          if ($album->entity) {
            $album_nids[] = $album->entity->id();
          }
        }
      }
    }

    if (count($album_nids) > 0) {
      // put them in new array
      foreach ($album_nids as $album_nid) {
        $albums[] = self::getAlbum($album_nid);
      }
    }

    return $albums;
  }

  /**
   * @param $name
   *
   * @return mixed
   *
   * save new Album in db
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */

  public static function newAlbum($name)
  {
    // define entity type and bundle
    $entity_type = 'node';
    $entity_bundle = 'unig_album';
    $node_title = $name;

    //load up an array for creation
    $new_node = [
      'title' => $node_title,
      'type' => $entity_bundle,
    ];

    $new_post = \Drupal::entityTypeManager()
      ->getStorage($entity_type)
      ->create($new_node);

    $new_post->save();

    return $new_post->id();
  }

  /**
   * @param $target_nid
   * @param $album_nid
   * @return mixed
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public static function addAlbum($target_nid, $album_nid)
  {
    // Wenn nicht:
    // Projekt öffnen und nachschauen ob schon ein Vorschaubild gesetzt ist
    // hole das array mit den Albums
    // ist das album schon vorhanden?
    // leer? neues
    // ergänze das array mit dem neuen Album

    $entity = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->load($target_nid);

    if (!empty($entity->field_unig_album)) {
      $albums = $entity->get('field_unig_album')->getValue();
      kint($albums);

      $find_album = array_search($album_nid, $albums);

      if ($find_album) {
        drupal_set_message('Das Album ist schon in der Liste');
      } else {
        $new_item = ['target_id' => $album_nid];

        $entity->field_unig_album[] = $new_item;
      }
      $entity->save();
    }

    // Load and Save Project
    // $node->field_unig_album = ['target_id' => $nid_cover,];

    return $target_nid;
  }
}
