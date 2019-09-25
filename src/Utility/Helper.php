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
  public static function getTermsForOptionList(string $vid): array
  {
    $term_list = [];
    $terms = self::getTerms($vid);

    if ($terms) {
      foreach ($terms as $term) {
        $term_list[] = [
          'id' => $term->tid,
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
   * @param null $term_list
   * @param bool $force_array
   * @return boolean | string | array
   * @throws Exception
   */
  public static function getFieldValue(
    $node,
    $field_name,
    $term_list = null,
    $force_array = false
  ) {
    $result = false;
    $list = [];

    if ($term_list) {
      $list = self::getTermsByID($term_list);
    }

    try {
      // check for 'field_field_NAME'
      $pos = strpos($field_name, 'field_');

      if ($pos === 0) {
        throw new Exception(
          'Use $field_name without "field_" in HELPER:getFieldValue(' .
            $field_name .
            ')'
        );
      }

      $core_field_names = ['title', 'status', 'body'];

      if (!in_array($field_name, $core_field_names, true)) {
        $field_name = 'field_' . $field_name;
      }

      if ($node->get($field_name)) {
        $value = $node->get($field_name)->getValue();

        // single
        if (count($value) === 1) {
          // Standart Field
          if ($value && $value[0] && isset($value[0]['value'])) {
            $result = $value[0]['value'];
          }

          // Target Field
          if ($value && $value[0] && isset($value[0]['target_id'])) {
            $result = $value[0]['target_id'];
          }

          // Value is Taxonomy Term
          if ($term_list) {
            $result = $list[$result];
          }

          if ($force_array) {
            $arr[] = $result;
            $result = $arr;
          }
        }

        $i = 0;
        if (count($value) > 1) {
          foreach ($value as $item) {
            // Default Field
            if (isset($item['value'])) {
              $result[$i] = $item['value'];
            }

            // Target Field
            if (isset($item['target_id'])) {
              if ($term_list) {
                $result[$i] = $list[$item['target_id']];
              } else {
                $result[$i] = $item['target_id'];
              }
            }
            $i++;
          }
        }
      }
    } catch (Exception $e) {
      throw $e;
    }

    return $result;
  }
}
