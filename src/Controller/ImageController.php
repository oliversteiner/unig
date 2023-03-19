<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\mollo_utils\Utility\MolloUtils;
use Drupal\node\Entity\Node;
use Drupal\unig\Utility\CreateImageStyles;

/**
 *
 */
class ImageController extends ControllerBase {

  /**
   * @param $node_ids
   * @param bool $style_name
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   * @throws \Exception
   */
  public function getImageVars($node_ids, $style_name = FALSE) {
    $uri_list = [];
    $output = new OutputController();

    if (is_array($node_ids)) {
      foreach ($node_ids as $node_id) {
        $entity = Node::load($node_id);
        $file_id = MolloUtils::getFieldValue($entity, 'unig_image');
        $uri_list[$node_id] = CreateImageStyles::createStyles(
          $file_id,
          $style_name
        );

        // Output.
        $output->setData($uri_list);
      }
    }
    else {
      $entity = Node::load($node_ids);

      if ($entity) {
        $file_id = MolloUtils::getFieldValue($entity, 'unig_image');
        $title = $entity->getTitle();
        $uri_list = CreateImageStyles::createStyles($file_id);

        // Output.
        $output->setData($uri_list);
        $output->setNid($node_ids);
        $output->setTid($file_id);
        $output->setTitle($title);
        $output->setStatus(TRUE);
      }
    }

    return $output->json();
  }

}
