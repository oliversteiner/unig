<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Drupal\unig\Utility\AdminTemplateTrait;


class AdminController extends ControllerBase {

  use AdminTemplateTrait;

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'unig';
  }

  /**
   * @return array
   */
  public function unigConfig() {

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
        $mode = $data['mode'];

        // Load node
        $node = Node::load($nid);


        if ($field === "title") {
            $node->setTitle($value);
            $node->set('field_unig_title_generated', 0);

        } else {
            // description
            $node->set('field_unig_' . $field, $value);

        }

        // Save node
        try {
            $node->save();

            $output->setStatus(true);
            $output->setData([$field, $value]);
            $output->setNid($nid);
        } catch (EntityStorageException $e) {
            $output->setStatus(false);
            $output->setMessages([$e, 'error']);
            $output->setData([$nid,$field, $value]);
        }

        // Output

        return $output->json();
    }


}
