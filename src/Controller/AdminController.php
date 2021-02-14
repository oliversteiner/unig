<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Drupal\unig\Utility\AdminTemplateTrait;
use Drupal\unig\Utility\UnigCache;

/**
 *
 */
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
      '#markup' =>
      sprintf("<p>page_title = %s</p><p>source_text = %s</p>", $page_title, $source_text),
    ];
  }

  /**
   *
   * @return mixed
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public static function save() {
    $output = new OutputController();

    $data = json_decode(file_get_contents('php://input'), TRUE);

    $id = $data['id'];
    $project_id = $data['project_id'];
    $field = $data['field'];
    $value = $data && isset($data['value']) ? $data['value'] : '';
    $mode = FALSE;

    if ($data && !empty($data['mode'])) {
      $mode = $data['mode'];
    }

    // Load node.
    $node = Node::load($id);
    if ($node !== NULL) {
      // Title.
      if ($field === 'title') {
        // Update Title.
        $node->setTitle($value);

        // Set Field "title generated" to false.
        if ($mode === 'file') {
          $node->set('field_unig_title_generated', 0);
        }
      }

      // Privat
      // Toggle Value.
      elseif ($field === 'private') {
        // Load Value From Server.
        $field_name = 'field_unig_private';
        $node_private = $node->get($field_name)->getValue();

        // Check if Field and Field value.
        $node_private = $node_private ? $node_private[0]['value'] : 0;

        // Toggle Value.
        $newValue = $node_private ? 0 : 1;

        // Save New Value.
        $node->get($field_name)->setValue($newValue);

        // For Ajax Output.
        $value = $newValue;
      }
      else {
        // Set Value to Field.
        $node->set('field_unig_' . $field, $value);
      }

      try {
        // Save node.
        $node->save();

        // Empty cache.
        UnigCache::clearProjectCache($project_id);

        // Prepare JSON Output.
        $output->setStatus(TRUE);
        $output->setData([$field, $value]);
        $output->setNid($id);
      }
      catch (EntityStorageException $e) {
        // Prepare JSON Output.
        $output->setStatus(FALSE);
        $output->setMessages([$e, 'error']);
        $output->setData([$id, $field, $value]);
      }
    }
    // Output.
    return $output->json();
  }

}
