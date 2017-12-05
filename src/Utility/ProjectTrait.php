<?php


  namespace Drupal\unig\Utility;

  use Drupal\Core\Ajax\AjaxResponse;
  use Drupal\Core\Ajax\AlertCommand;
  use Drupal\image\Entity\ImageStyle;
  use Drupal\node\Entity\Node;


  trait ProjectTrait {

    public $default_project_nid;

    public $project_nids = [];


    /**
     * @return array|int
     *
     */
    public static function getAllProjectNids() {

      $query = \Drupal::entityQuery('node')
        ->condition('status', 1)
        ->condition('type', 'unig_project')
        //  ->fieldCondition('field_date', 'value', array('2011-03-01', '2011-03-31'), 'BETWEEN')
        ->sort('field_unig_weight.value', 'ASC')
        ->sort('created', 'DESC')
        ->sort('title', 'ASC')
        ->accessCheck(FALSE);

      $nids = $query->execute();

      if (count($nids) == 0) {
        //   $nid_default = self::createDefaultUniGProject();
        //   $nids[0] = $nid_default;

        $nids = FALSE;
      }


      return $nids;
    }


    /**
     * @return array
     */
    public function getProjectlistSelected() {
      $select = [];


      $nids = self::getAllProjectNids();

      if ($nids) {


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
      }
      else {

      }
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
    public static function createUniGProject($title) {

      // define entity type and bundle
      $entity_type = "node";

      $node_title = $title;
      $node_alias = UniGTrait::toAscii($title);

      // get definition of target entity type
      $entity_def = \Drupal::EntityTypeManager()->getDefinition($entity_type);

      //load up an array for creation
      $new_node = [
        'title' => $node_title,
        $entity_def->get('entity_keys')['bundle'] => 'unig_project',
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
    public static function createDefaultUniGProject() {
      $title = 'Default';
      $nid = self::createUniGProject($title);

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
     *
     * @param      $nid_project
     * @param null $nid_image
     *
     * @return integer
     */
    public static function setCover($nid_project, $nid_image = NULL) {


      // Wenn nicht:
      // Projekt öffnen und nachschauen ob schon ein Vorschaubild gesetzt ist
      $node = Node::load($nid_project);


      if ($nid_image) {
        $nid_cover = $nid_image;
      }
      else {
        // Wenn noch kein Vorschaubild gesetzt ist, das erste Bild aus dem Projekt nehmen und einsetzen.
        $cover = $node->field_unig_project_cover->target_id;
        if ($cover == NULL) {
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
     *
     * get uri from all styles from Cover image
     *
     * @param $nid
     *
     * @return array
     */
    public static function getImage($nid) {
      $variables = [];

      $node = \Drupal::entityTypeManager()
        ->getStorage('node')
        ->load($nid);


      // Field Event Image
      if (!empty($node->field_unig_image)) {
        if (isset($node->field_unig_image->entity)) {

          $list_image_styles = \Drupal::entityQuery('image_style')->execute();
          $count = 0;

          foreach ($node->field_unig_image as $image) {

            if ($image->entity) {

              $path = $image->entity->getFileUri();

              foreach ($list_image_styles as $images_style) {

                $style = ImageStyle::load($images_style);
                $variables[$count][$images_style] = $style->buildUrl($path);
              }
            }
            $count++;
          }
        }


      }
      return $variables[0];

    }

    /**
     * @param $nid_project
     *
     * @return int
     */
    public static function countFilesInProject($nid_project) {

      $files = self::getListofFilesInProject($nid_project);

      if (!empty($files)) {
        $number_of_files = count($files);
      }
      else {
        $number_of_files = 0;
      }

      return $number_of_files;
    }

    /**
     * @param      $nid_project
     *
     * @param null $album_nid
     *
     * @return array
     */
    public static function getListofFilesInProject($nid_project, $album_nid = NULL) {
      // bundle : unig_file
      // field: field_unig_project[0]['target_id']


      if ($album_nid != NULL) {

        dpm('Album NID:' . $album_nid);

        $nids = \Drupal::entityQuery('node')
          ->condition('type', 'unig_file')
          ->condition('field_unig_project', $nid_project)
          ->condition('field_unig_album', $album_nid)
          ->sort('field_unig_weight.value', 'ASC')
          ->sort('title', 'ASC')
          ->execute();


      }
      else {
        // Get all unig_file_nodes in Project
        $nids = \Drupal::entityQuery('node')
          ->condition('type', 'unig_file')
          ->condition('field_unig_project', $nid_project)
          ->sort('field_unig_weight.value', 'ASC')
          ->sort('title', 'ASC')
          ->execute();

      }

      // put them in new array
      $list = [];
      foreach ($nids as $nid) {
        $list[] = $nid;
      }

      return $list;
    }

    public static function buildProjectList() {

      $nids = self::getAllProjectNids();

      $variables = [];

      if ($nids) {
        foreach ($nids as $project_nid) {
          $variables[] = self::buildProject($project_nid);
        }

      }

      return $variables;
    }

    /**
     * @return array
     *
     */
    public static function buildProject($project_nid) {

      // project
      //  - nid
      //  - date
      //  - timestamp
      //  - year
      //  - title

      //  - weight (draggable)
      //  - number_of_items
      //  - album
      //      - title
      //      - number_of_items
      //  - links
      //    - edit
      //    - delete
      //  - cover_id
      //  - cover_image
      //

      $project = [];

      $node = \Drupal::entityTypeManager()
        ->getStorage('node')
        ->load($project_nid);


      if ($node->get('nid')->getValue()) {
        // NID
        $node_nid = $node->get('nid')->getValue();
        $nid = $node_nid[0]['value'];


        // Title
        $node_title = $node->get('title')->getValue();
        $title = $node_title[0]['value'];


        // Body
        $node_description = $node->get('field_unig_description')->getValue();
        if ($node_description) {
          $description = $node_description[0]['value'];
        }
        else {
          $description = '';
        }


        // Weight
        $node_weight = $node->get('field_unig_weight')->getValue();
        if ($node_weight) {
          $weight = $node_weight[0]['value'];

        }
        else {
          $weight = 0;
        }

        // Private
        $node_private = $node->get('field_unig_private')->getValue();
        if ($node_private) {
          $private = $node_private[0]['value'];

        }
        else {
          $private = 0;
        }

        // Date
        $node_date = $node->get('field_unig_date')->getValue();

        if ($node_date) {
          $date = $node_date[0]['value'];
          $format = 'Y-m-d';
          $php_date_obj = date_create_from_format($format, $date);
        }
        else {
          $php_date_obj = date_create();

        }


        // Timestamp
        $timestamp = (int) $php_date_obj->format('U');

        // Year
        $year = $php_date_obj->format("Y");

        // Date
        $date = $php_date_obj->format("d. F Y");

        // Date
        $date_drupal = $php_date_obj->format("Y-m-d");


        // Cover Node ID
        $node_cover = $node->get('field_unig_project_cover')->getValue();
        $cover_id = $node_cover[0]['target_id'];

        if ($cover_id == NULL) {
          $cover_id = self::setCover($nid);
        }

        // Cover Image
        $cover_image = self::getImage($cover_id);

        // number_of_items
        $number_of_items = self::countFilesInProject($nid);


        // Album List
        $album_list = AlbumTrait::getAlbumList($nid);

        // Twig-Variables
        $project = [
          'nid' => $nid,
          'title' => $title,
          'description' => $description,
          'weight' => $weight,
          'private' => $private,
          'timestamp' => $timestamp,
          'date' => $date,
          'date_drupal' => $date_drupal,
          'year' => $year,
          'number_of_items' => $number_of_items,
          'cover_id' => $cover_id,
          'cover_image' => $cover_image,
          'album_list' => $album_list,

        ];

      }
      return $project;
    }


    /**
     * @return array
     *
     */
    public static function buildFileList($project_nid, $album_nid = NULL) {

      $file_nids = self::getListofFilesInProject($project_nid, $album_nid);
      $variables = [];

      foreach ($file_nids as $file_nid) {

        $variables[] = self::buildFile($file_nid);
      }


      return $variables;
    }

    /**
     * @param $file_nid
     *
     * @return array
     *
     */
    public static function buildFile($file_nid) {

      // project
      //  - nid
      //  - date
      //  - timestamp
      //  - title
      //  - description
      //  - weight (draggable)
      //  - album
      //      - title
      //      - number_of_items
      //  - links
      //    - edit
      //    - delete


      $entity = \Drupal::entityTypeManager()
        ->getStorage('node')
        ->load($file_nid);

      // NID
      $nid = $entity->id();

      // Title
      $title = $entity->label();

      // Weight
      $node_weight = $entity->get('field_unig_weight')->getValue();
      if ($node_weight) {
        $weight = $node_weight[0]['value'];

      }
      else {
        $weight = 0;
      }

      // image
      $image = self::getImage($file_nid);


      // Album List
      $album_list = AlbumTrait::getAlbumList($nid);

      // Twig-Variables
      $file = [
        'nid' => $nid,
        'title' => $title,
        'album_list' => $album_list,
        'image' => $image,
        'weight' => $weight,


      ];


      return $file;
    }

    public static function projectDelete($project_nid) {


      // delete Project
      $status = FALSE;
      $message = $project_nid;

      if ($project_nid) {
        $node = Node::Load($project_nid);

        // load node
        if ($node) {
          // Delete Project
          $node->delete();

          // Delete Files
          self::deleteAllFilesInProject($project_nid);

          // Node delete success
          $status = TRUE;
          $message = 'Das Projekt mit der ID ' . $project_nid . ' wurde gelöscht';
        }

        // no Node found
        else {
          $status = FALSE;
          $message = 'kein Projekt mit der ID ' . $project_nid . ' gefunden';
        }
      }

      // Output
      $output = [
        'status' => $status,
        'message' => $message,
      ];
      return $output;

    }


    static public function deleteAllFilesInProject($project_nid) {
      // Delete all Files
      $file_nids = self::getListofFilesInProject($project_nid);

      foreach ($file_nids as $file_nid) {
        FileTrait::deleteFile($file_nid);
      }
      return TRUE;
    }

    /**
     *
     * @return mixed
     *
     *
     */
    public static function updateProject() {


      $project_nid = $_POST['project_nid'];
      $data = $_POST['data'];


      // Load node
      $entity = \Drupal::entityTypeManager()
        ->getStorage('node')
        ->load($project_nid);


      // title
      $entity->title[0] = $data['title'];

      // date
      $entity->field_unig_date[0] = $data['date'];

      // weight
      $entity->field_unig_weight[0] = $data['weight'];

      // description
      $entity->field_unig_description[0] = $data['description'];

      // private
      $int_private = (int) $data['private'];
      if ($int_private == 1) {
        $private = 1;
      }
      else {
        $private = 0;
      }

      $entity->field_unig_private[0] = $private;


      // Save node
      $entity->save();

      $response = new AjaxResponse();

      $response->addCommand(new AlertCommand($data));

      return $response;

    }


    public static function sortProject() {

      $data = $_POST['data'];

      $arr_data = explode("&", $data);


      $i = 1;

      foreach ($arr_data as $string) {


        $nid = str_replace('nid=', '', $string);
        $sort_list[] = $nid;
        // Load node
        $entity = \Drupal::entityTypeManager()
          ->getStorage('node')
          ->load($nid);

        // weight
        $entity->field_unig_weight[0] = $i;

        // Save node
        $entity->save();
        $i++;

      }


      $response = new AjaxResponse();

      $response->addCommand(new AlertCommand($sort_list));

      return $response;

    }

  }