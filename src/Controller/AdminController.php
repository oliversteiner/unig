<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Drupal\unig\Utility\AdminTemplateTrait;


class AdminController extends ControllerBase
{

    use AdminTemplateTrait;

    /**
     * {@inheritdoc}
     */
    protected function getModuleName()
    {
        return 'unig';
    }

    /**
     * @return array
     */
    public function unigConfig()
    {

        // Default settings.
        $config = \Drupal::config('unig.settings');
        // Page title and source text.
        $page_title = $config->get('unig.page_title');
        $source_text = $config->get('unig.source_text');

        return [
            '#markup' => '<p>page_title = ' . $page_title . '</p>' .
                '<p>source_text = ' . $source_text . '</p>',
        ];
    }


    /**
     *
     * @return mixed
     *
     * @throws \Drupal\Core\Entity\EntityStorageException
     */
    public static function save()
    {
        $output = new OutputController();

        $data = json_decode(file_get_contents('php://input'), true);

        $nid = $data['nid'];
        $field = $data['field'];
        $value = $data['value'];
        $mode = false;
        if ($data['mode']) {
            $mode = $data['mode'];
        }

        // Load node
        $node = Node::load($nid);

        // Title
        if ($field === "title") {

            // Update Title
            $node->setTitle($value);

            // set Field "title generated" to false
            if ($mode === "file") {
                $node->set('field_unig_title_generated', 0);
            }

        }

        // Privat
        // Toggle Value
        else if ($field === "private") {

            // Load Value From Server
            $field_name = 'field_unig_private';
            $node_private = $node->get($field_name)->getValue();

            // Check if Field and Fieldvalue
            $node_private = $node_private ? $node_private[0]['value'] : 0;

            // Toggle Value
            $newValue = $node_private ? 0 : 1;

            // Save New Value
            $node->get($field_name)->setValue($newValue);

            // for Ajax Output
            $value = $newValue;
        } else {
            // set Value to Field
            $node->set('field_unig_' . $field, $value);

        }

        try {
            // Save node
            $node->save();

            // Prepare JSON Output
            $output->setStatus(true);
            $output->setData([$field, $value]);
            $output->setNid($nid);
        } catch (EntityStorageException $e) {

            // Prepare JSON Output
            $output->setStatus(false);
            $output->setMessages([$e, 'error']);
            $output->setData([$nid, $field, $value]);
        }

        // Output

        return $output->json();
    }


}
