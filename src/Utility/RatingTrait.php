<?php
  /**
   * Created by PhpStorm.
   * User: ost
   * Date: 06.12.17
   * Time: 09:33
   */

  namespace Drupal\unig\Utility;


  use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
  use Drupal\Core\Entity\EntityStorageException;
  use Drupal\node\Entity\Node;
  use Drupal\unig\Controller\OutputController;

  trait RatingTrait {


    public static function ratingSave() {

      $post = $_POST['data'];

      $nid = $post['nid'];
      $value = $post['value'];

      $output = new OutputController();

      // Load node
      try {
        $entity = \Drupal::entityTypeManager()
          ->getStorage('node')
          ->load($nid);
      } catch (InvalidPluginDefinitionException $e) {
        $output->setMessages('Database Error', 'error', TRUE);
      }

      // weight
      if (!empty($entity->field_unig_rating)) {
        $entity->field_unig_rating[0] = $value;
      }

      // Save node
      try {
        $entity->save();

        // Output
        $output->setStatus(TRUE);

      } catch (EntityStorageException $e) {
        $output->setMessages('save failed', 'error', TRUE);
      }


      return $output->json();

    }


  }