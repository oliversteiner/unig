<?php

namespace Drupal\unig\Utility;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Component\Utility\Crypt;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\Entity\Term;
use Exception;

class Helper
{
  /**
   * @param string $vid
   * @return array
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function getTerms(string $vid): array
  {
    return Drupal::entityTypeManager()
      ->getStorage('taxonomy_term')
      ->loadTree($vid);
  }

  /**
   * @param string $vid
   * @return array
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function getTermsByID(string $vid): array
  {
    $term_list = [];
    $terms = self::getTerms($vid);
    if ($terms) {
      foreach ($terms as $term) {
        $term_list[$term->tid] = $term->name;
      }
    }
    return $term_list;
  }

  /**
   * @param string $vid
   * @return array
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function getTermList(string $vid): array
  {
    return self::getTermsForOptionList($vid);
  }

  /**
   * @param string $vid
   * @return array
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function getTermsForOptionList(string $vid): array
  {
    $term_list = [];
    $terms = self::getTerms($vid);

    if ($terms) {
      foreach ($terms as $term) {
        $term_list[] = [
          'id' => (integer)$term->tid,
          'name' => $term->name
        ];
      }
    }
    return $term_list;
  }

  /**
   * @param int $term_id
   * @return string
   */
  public static function getTermNameByID(int $term_id): string
  {
    $name = '';
    $term = Term::load($term_id);
    if ($term) {
      $name = $term->getName();
    }
    return $name;
  }

  /**
   * @param string $term_name
   * @param string $vid
   * @return int
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function getTermIDByName(string $term_name, string $vid): int
  {
    $tid = 0;

    $terms = self::getTerms($vid);
    foreach ($terms as $term) {
      if ($term->name === $term_name) {
        $tid = $term->tid;
        break;
      }
    }
    return $tid;
  }

  /**
   * @param string $vid
   * @return array
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function getTermsByName(string $vid): array
  {
    $term_list = [];
    $terms = self::getTerms($vid);
    foreach ($terms as $term) {
      $term_list[$term->name] = $term->tid;
    }
    return $term_list;
  }

  /**
   * @param NodeInterface | Node $node
   * @param string $field_name
   * @param null $term_list_name
   * @param bool | string $force_array
   * @return boolean | string | array
   */
  public static function getFieldValue(
    $node,
    $field_name,
    $term_list_name = null,
    $force_array = false
  )
  {
    $default_fields = ['body'];
    $result = false;
    $term_list = [];

    if ($term_list_name && is_string($term_list_name)) {
      $term_list = self::getTermsByID($term_list_name);
    }

    try {
      if (!is_object($node)) {
        throw new \RuntimeException(
          'The $node Parameter is not a valid drupal entity.' .
          ' (Field: ' .
          $field_name .
          ' Node:' .
          $node .
          ')'
        );
      }

      if (!is_string($field_name)) {
        throw new \RuntimeException(
          'field_name must be a string'
        );
      }

      if (is_string($field_name)) {
        // check for 'body'
        if (!in_array($field_name, $default_fields, false)) {

          // check for 'field_field_NAME'
          $pos = strpos($field_name, 'field_');

          if ($pos === false) {
            $field_name = 'field_' . $field_name;
          }
        }
      }

    } catch (Exception $e) {
      throw new \RuntimeException(
        '$field_name must be a string.' .
        ' (Field: ' .
        $field_name .
        ' Node:' .
        $node .
        ') ' .
        $e
      );
    }


    try {
      if ($node->get($field_name)) {
        $value = $node->get($field_name)->getValue();

        // single Item
        if (count($value) === 1) {
          // Default Field
          if ($value && $value[0] && isset($value[0]['value'])) {
            $result = $value[0]['value'];
          }

          // Target Field
          if ($value && $value[0] && isset($value[0]['target_id'])) {
            $result = $value[0]['target_id'];
          }

          // Duration Field
          if ($value && $value[0] && isset($value[0]['duration'])) {
            $result = $value[0]['duration'];
          }

          // Value is Taxonomy Term
          if ($term_list) {

            if ($term_list && $term_list[$result]) {
              $result = $term_list[$result];
            } else {
              $message =
                "No Term found with id {$result} in Taxonomy {$term_list}";
              Drupal::logger('small_messages')->notice($message);
            }
          }

          if ($force_array === true) {
            $arr[] = $result;
            $result = $arr;
          }
          if ($force_array === 'full') {

            $term = [];
            $term['id'] = (int)$value[0]['target_id'];
            $term['name'] = $term_list[$value[0]['target_id']];

            $arr[] = $term;
            $result = $arr;
          }
        }

        // Multiple Items
        $i = 0;
        if (count($value) > 1) {
          foreach ($value as $item) {
            // Standart Field
            if (isset($item['value'])) {
              $result[$i] = $item['value'];
            }

            // target Field and Termlist
            // Value is Taxonomy Term
            if ($term_list_name) {
              if ($term_list_name && $term_list[$item['target_id']]) {

                if ($force_array === 'full') {
                  $term = [];
                  $term['id'] = (int)$item['target_id'];
                  $term['name'] = $term_list[$item['target_id']];
                  $result[$i] = $term;
                } else {
                  $result[$i] = $term_list[$item['target_id']];
                }

              } else {
                $result[$i] = false;
                $message =
                  "No Term found with id {$result} in Taxonomy {$term_list_name}";
                Drupal::logger('small_messages')->notice($message);
              }
            } else if (isset($item['target_id'])) {
              $result[$i] = $item['target_id'];
            }
            $i++;
          }
        }

        // No Items
        if ($force_array && count($value) === 0) {
          $result = [];
        }
      }
    } catch (Exception $e) {
      throw new \RuntimeException(
        'field_name (' . $field_name . ') Error \r' . $e
      );
    }

    return $result;
  }
}
