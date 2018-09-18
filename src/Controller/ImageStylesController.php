<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\file\Entity\File;
use Drupal\node\Entity\Node;
use Drupal\unig\Utility\CreateImageStylesTrait;


class ImageStylesController extends ControllerBase
{


    function createImageStyles($node_ids)
    {
        dpm($node_ids);
        $output = new OutputController();

        if (is_array($node_ids)) {

            foreach ($node_ids as $node_id) {
                $entity = Node::load($node_id);
                $file_id = $entity->get('field_unig_image')->target_id;

                // load the file object from some file id
                $file_object = File::load($file_id);
                $file_uri = $file_object->getFileUri();

                $uri_list[$node_id] = CreateImageStylesTrait::createImageStyles($file_uri);

            }


        } else {
            $entity = Node::load($node_ids);

            if($entity){
                $file_id = $entity->get('field_unig_image')->target_id;

                // load the file object from some file id
                $file_object = File::load($file_id);
                $file_uri = $file_object->getFileUri();
                $uri_list = CreateImageStylesTrait::createImageStyles($file_uri);
                $output->setNid($node_ids);
                $output->setTid($file_id);
                $output->setStatus(true);
            }

        }


        $output->setData($uri_list);
        return $output->json();


    }

}