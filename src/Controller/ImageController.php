<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\unig\Utility\CreateImageStylesTrait;
use Drupal\unig\Utility\Helper;


class ImageController extends ControllerBase
{


    /**
     * @param $node_ids
     * @param bool $style_name
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     * @throws \Exception
     */
    function getImageVars($node_ids, $style_name = false)
    {
        $uri_list = [];
        $output = new OutputController();

        if (is_array($node_ids)) {

            foreach ($node_ids as $node_id) {
                $entity = Node::load($node_id);
                $file_id = Helper::getFieldValue($entity, 'unig_image');
                $uri_list[$node_id] = CreateImageStylesTrait::createImageStyles($file_id, $style_name);

                // Output
                $output->setData($uri_list);
            }


        } else {
            $entity = Node::load($node_ids);

            if ($entity) {
                $file_id = Helper::getFieldValue($entity, 'unig_image');
                $title = $entity->getTitle();
              //  $uri_list = CreateImageStylesTrait::createImageStyles($file_id, $style_name);
                $uri_list = CreateImageStylesTrait::createImageStyles($file_id);

                // Output
                $output->setData($uri_list);
                $output->setNid($node_ids);
                $output->setTid($file_id);
                $output->setTitle($title);
                $output->setStatus(true);
            }

        }


        return $output->json();


    }

}