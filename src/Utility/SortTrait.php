<?php

namespace Drupal\unig\Utility;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Drupal\unig\Controller\OutputController;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Trait SortTrait
 * @package Drupal\unig\Utility
 */
trait SortTrait
{
  /**
   * @return JsonResponse
   * @throws PluginNotFoundException
   */
  public static function sortSave(): JsonResponse
  {
    $data = $_POST['data'];
    $arr_data = explode('&', $data);

    $file_position = 1;

    $output = new OutputController();
    $message = '';
    $type = 'error';
    foreach ($arr_data as $string) {
      $nid = str_replace('nid=', '', $string);
      $sort_list[] = $nid;
      // Load node
      try {
        $entity = Drupal::entityTypeManager()
          ->getStorage('node')
          ->load($nid);
      } catch (InvalidPluginDefinitionException $e) {
      }

      // weight
      if (!empty($entity->field_unig_weight)) {
        $entity->field_unig_weight[0] = $file_position;
      }

      // Save node
      try {
        $entity->save();

        // Output
        $output->setStatus(true);
        $message = 'New order saved';
        $type = 'success';
      } catch (EntityStorageException $e) {
        $message = 'save failed';
        $type = 'error';
      }

      $file_position++;
    } // foreach

    $output->setMessages($message, $type, false);

    return $output->json();
  }

  /**
   * @return JsonResponse
   * @throws PluginNotFoundException
   */
  public static function sortReset(): JsonResponse
  {
    $data = $_POST['data'];
    $output = new OutputController();
    $message = '';
    $type = '';

    // load all nids
    $nids = [];
    $arr_data = explode('&', $data);
    foreach ($arr_data as $string) {
      $nid = str_replace('nid=', '', $string);
      $nids[] = (int) $nid;
    }

    // load all File-names
    $names = [];
    $entity = Node::loadMultiple($nids);

    foreach ($entity as $node) {
      $names[] = [
        'id' => $node->id(),
        'name' => $node->label() // Title of Node or better Filename ?
      ];
    }

    // Sort List alphanumeric

    // Obtain a list of columns
    foreach ($names as $key => $row) {
      $id[$key] = $row['id'];
      $name[$key] = $row['name'];
    }

    // Sort the data with volume descending, edition ascending
    // Add $data as the last parameter, to sort by the common key
    array_multisort($name, SORT_NATURAL, $names);

    $names_orded = $names;

    $output->setData($names_orded);

    // Save new Position

    $position = 1;
    foreach ($names_orded as $index => $item) {
      $id = (int) $item['id'];

      // Load node
      try {
        $entity = Drupal::entityTypeManager()
          ->getStorage('node')
          ->load($id);
      } catch (InvalidPluginDefinitionException $e) {
      }

      // set new Weight
      $entity->field_unig_weight[0] = $index + 1; // Position
      // save
      try {
        $entity->save();
        $message = 'Reset order to alphabetical';
        $type = 'success';
      } catch (EntityStorageException $e) {
        $message = 'can\'t reset';
        $type = 'Error';
      }

      $position++;
    }

    $output->setMessages($message, $type, false);

    return $output->json();
  }

  /**
   * @return JsonResponse
   * @throws PluginNotFoundException
   */
  public static function sortMode(): JsonResponse
  {
    $data = $_POST['data'];

    // load all nids
    $nids = [];
    $arr_data = explode('&', $data);
    foreach ($arr_data as $string) {
      // nids
      $nid = str_replace('nid=', '', $string);
      $nids[] = (int) $nid;

      //mode
      $sort_mode = str_replace('mode=', '', $string);
    }

    // load all File-names
    $nodes_unsorted = [];
    $entity = Node::loadMultiple($nids);

    foreach ($entity as $node) {
      $nodes_unsorted[] = [
        'id' => $node->id(),
        'name' => $node->label(), // Title of Node or better Filename ?
        'date' => $node->get('field_unig_date')->value,
        'weight' => $node->get('field_unig_weight')->value
      ];
    }

    // Sort List alphanumeric

    // Obtain a list of columns

    // Sort the data with volume descending, edition ascending
    // Add $data as the last parameter, to sort by the common key

    if ($sort_mode === 'alphanumeric') {
      foreach ($nodes_unsorted as $key => $row) {
        $id[$key] = $row['id'];
        $name[$key] = $row['name'];
      }
      array_multisort($name, SORT_ASC, SORT_NATURAL, $nodes_unsorted);
    } elseif ($sort_mode === 'date') {
      foreach ($nodes_unsorted as $key => $row) {
        $id[$key] = $row['id'];
        $date[$key] = $row['date'];
      }
      array_multisort($date, SORT_DESC, SORT_NATURAL, $nodes_unsorted);
    } else {
      foreach ($nodes_unsorted as $key => $row) {
        $id[$key] = $row['id'];
        $weight[$key] = $row['weight'];
      }
      array_multisort($weight, SORT_ASC, SORT_NATURAL, $nodes_unsorted);
    }

    $nodes_sorted = $nodes_unsorted;

    // Save new Position

    $output = new OutputController();

    $position = 1;
    foreach ($nodes_sorted as $index => $item) {
      $id = (int) $item['id'];

      // Load node
      try {
        $entity = Drupal::entityTypeManager()
          ->getStorage('node')
          ->load($id);
      } catch (InvalidPluginDefinitionException $e) {
        $output->setMessages('Database Error', 'error', true);
      }

      // set new Weight
      $entity->field_unig_weight[0] = $index + 1; // Position
      // save
      try {
        $entity->save();
      } catch (EntityStorageException $e) {
      }

      $position++;
    }

    $output->setData($nodes_unsorted);

    return $output->json();
  }
}
