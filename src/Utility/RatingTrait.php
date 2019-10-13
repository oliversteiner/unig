<?php
/**
 * Created by PhpStorm.
 * User: ost
 * Date: 06.12.17
 * Time: 09:33
 */

namespace Drupal\unig\Utility;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\unig\Controller\OutputController;
use Symfony\Component\HttpFoundation\JsonResponse;

trait RatingTrait
{
  /**
   * @return JsonResponse
   * @throws PluginNotFoundException
   */
  public static function ratingSave(): JsonResponse
  {
    $post = $_POST['data'];

    $nid = $post['nid'];
    $value = $post['value'];

    $output = new OutputController();

    // Load node
    try {
      $entity = Drupal::entityTypeManager()
        ->getStorage('node')
        ->load($nid);
    } catch (InvalidPluginDefinitionException $e) {
      $output->setMessages('Database Error', 'error', true);
    }

    // weight
    if (!empty($entity) && !empty($entity->field_unig_rating)) {
      $entity->field_unig_rating[0] = $value;
    }

    // Save node
    try {
      $entity->save();

      // Output
      $output->setStatus(true);
    } catch (EntityStorageException $e) {
      $output->setMessages('save failed', 'error', true);
    }

    return $output->json();
  }
}
