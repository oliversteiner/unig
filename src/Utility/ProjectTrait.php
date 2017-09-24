<?php

  namespace Drupal\unig\Utility;

  use Drupal\Core\Ajax\AjaxResponse;
  use Drupal\Core\Ajax\ReplaceCommand;
  use Drupal\Core\Form\FormStateInterface;
  use Drupal\node\Entity\Node;
  use Drupal\unig\Utility\UniGTrait;

  trait ProjectTrait {

    public $bundle_project = 'unig_project';

    public $default_project_nid;

    public $project_nids = [];


    /**
     * @return array
     */
    public function getProjectlist() {
      $select = [];

      $query = \Drupal::entityQuery('node')
        ->condition('status', 1)
        ->condition('type', $this->bundle_project)
        //  ->fieldCondition('field_date', 'value', array('2011-03-01', '2011-03-31'), 'BETWEEN')
        //  ->fieldOrderBy('field_date', 'value', 'ASC')
        ->accessCheck(FALSE);

      $nids = $query->execute();


      if (count($nids) == 0) {
        $nid_default = $this->createDefaultUniGProject();
        $nids[0] = $nid_default;
      }


      $this->project_nids = $nids;
      $node_storage = \Drupal::entityTypeManager()->getStorage('node');
      $entity_list = $node_storage->loadMultiple($nids);

      foreach ($entity_list as $nid => $node) {

        $node_nid = $node->get('nid')->getValue();
        $node_title = $node->get('title')->getValue();

        $nid = $node_nid[0]['value'];
        $title = $node_title[0]['value'];

        $select[$nid] = $title;
      }

      $select['-'] = '';
      $select['neu'] = ' neues Projekt erstellen...';


      return $select;
    }


    /**
     * depricated
     *
     * @return int
     */
    public function getDefaultProjectNid() {
      // Aus den Einstellungen das Defaultalbum wählen
      $default_config = \Drupal::config('unig.settings');
      $default_project_nid = $default_config->get('unig.default_project');

      return $default_project_nid;
    }


    /**
     * @param $title
     *
     * @return int|null|string
     */
    public function createUniGProject($title) {

      // define entity type and bundle
      $entity_type = "node";

      $node_title = $title;
      $node_alias = UniGTrait::toAscii($title);
      $node_body = '';

      // get definition of target entity type
      $entity_def = \Drupal::EntityTypeManager()->getDefinition($entity_type);

      //load up an array for creation
      $new_node = [
        'title' => $node_title,
        'body' => $node_body,
        $entity_def->get('entity_keys')['bundle'] => $this->bundle_project,
      ];

      $new_post = \Drupal::EntityTypeManager()
        ->getStorage($entity_type)
        ->create($new_node);

      $new_post->save();

      // hole die neu erstellte Node ID
      $new_node_id = $new_post->id();

      return $new_node_id;
    }

    /**
     * @return integer
     */
    public function createDefaultUniGProject() {
      $title = 'New';
      $nid = $this->createUniGProject($title);

      // schreibe nid in die Settings
      \Drupal::configFactory()->getEditable('unig.settings')
        ->set('unig.default_project', $nid)
        ->save();

      return $nid;
    }

    /**
     * @param $path_destination
     * @param $path_unig
     * @param $path_project
     *
     * @return bool
     */
    public function checkProjectDir($path_destination, $path_unig, $path_project) {
      $result = FALSE;

      $root = \Drupal::service('file_system')
        ->realpath($path_destination . $path_unig);
      $realpath_project = $root . '/' . $path_project;

      $is_dir = is_dir($realpath_project);

      if (FALSE == $is_dir) {
        $result = \Drupal::service('file_system')
          ->mkdir($realpath_project, 0755, TRUE);

        if (FALSE == $result) {
          drupal_set_message('ERROR: Konnte das Verzeichnis für die Gallery nicht erstellen');
        }
      }
      else {
        $result = $realpath_project;
      }
      $this->zaehler++;

      return $result;
    }


    /**
     *
     * Diese Funktion muss statisch aufgerufen werden können
     *
     *
     * @param      $nid_project
     * @param null $nid_image
     *
     * @return integer
     */
    public static function setPreviewImage($nid_project, $nid_image = NULL) {


      // Wenn nicht:
      // Projekt öffnen und nachschauen ob schon ein Vorschaubild gesetzt ist
      $node = Node::load($nid_project);


      if ($nid_image) {

        $nid_cover = $nid_image;
      }
      else {
        // Wenn noch kein Vorschaubild gesetzt ist, das erste Bild aus dem Projekt nehmen und einsetzen.
        $cover = $node->field_unig_project_cover->target_id;
        if($cover == Null){
          $list_images = self::getListofFilesInProject($nid_project);
          $nid_cover = $list_images[0];
        }

      }

      // Load and Save Project
      $node->field_unig_project_cover = ['target_id' => $nid_cover,];
      $node->save();


      return $nid_image;
    }

    /**
     * @param $nid_project
     *
     * @return int
     */
    public static function countFilesInProject($nid_project) {

      $files = self::getListofFilesInProject($nid_project);

      if(!empty($files)){
        $number_of_files = count($files);
      }else{
        $number_of_files = 0;
      }

      return $number_of_files;
    }

    /**
     * @param $nid_project
     *
     * @return array
     */
    public static function getListofFilesInProject($nid_project) {
       // bundle : unig_file
       // field: field_unig_project[0]['target_id']


      // Get all unig_file_nodes in Project
      $nids = \Drupal::entityQuery('node')
        ->condition('type', 'unig_file')
        ->condition('field_unig_project', $nid_project)
        ->execute();

      // dpm($nids);
      $list = array();
      foreach ($nids as $nid) {
        $list[] = $nid;
      }

      return $list;
    }


  }