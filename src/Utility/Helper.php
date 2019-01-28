<?php

namespace Drupal\unig\Utility;

use Drupal\Component\Utility\Crypt;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\Entity\Term;
use Exception;

class Helper
{

    public static function getTermsByID($vid)
    {
        $term_list = [];
        $terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadTree($vid);
        foreach ($terms as $term) {
            $term_list[$term->tid] = $term->name;
        }
        return $term_list;
    }

    public static function getTermNameByID($term_id)
    {
        $term = Term::load($term_id);
        $name = $term->getName();

        return $name;
    }

    public static function getTermIDByName($term_name, $vid)
    {
        $tid = 0;

        $terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadTree($vid);
        foreach ($terms as $term) {
            if($term->name == $term_name){
                $tid = $term->tid;
                break;
            }
        }
        return $tid;
    }

    public static function getTermsByName($vid)
    {
        $term_list = [];
        $terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadTree($vid);
        foreach ($terms as $term) {
            $term_list[$term->name] = $term->id;
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
    public static function getFieldValue( $node, $field_name, $term_list = null, $force_array = false)
    {
        $result = false;



        try {

            // check for 'field_field_NAME'
            $pos = strpos($field_name, 'field_');

            if ($pos === 0) {

                throw new Exception('Use $field_name without "field_" in HELPER:getFieldValue(' . $field_name.')');
            }

            $core_fildnames = ['title', 'status', 'body'];

           if(!in_array($field_name, $core_fildnames)){
                $field_name = 'field_' . $field_name;
            }

            if ($node->get($field_name)) {
                $value = $node->get($field_name)->getValue();

                // single
                if (count($value) == 1) {

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
                        $result = $term_list[$result];
                    }

                    if ($force_array) {
                        $arr[] = $result;
                        $result = $arr;
                    }
                }

                $i = 0;
                if (count($value) > 1) {

                    foreach ($value as $item) {

                        // Standart Field
                        if (isset($item['value'])) {
                            $result[$i] = $item['value'];
                        }

                        // Target Field
                        if (isset($item['target_id'])) {
                            $result[$i] = $item['target_id'];
                        }
                        $i++;
                    }

                }
            }
        }
        catch
            (Exception $e) {

                    throw $e;

            }

        return $result;
    }





}