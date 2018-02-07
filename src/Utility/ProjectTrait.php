<?php

  /**
   *
   *    Fields:   Unig Project
   *    __________________________________________
   *
   *    body   (formatted, long, with summary)
   *
   *    field_unig_trash          Boolean
   *
   *    field_unig_project_cover  Entity reference
   *
   *    field_unig_description    Text (formatted, long)
   *
   *    field_unig_weight          Number (integer)
   *
   *    field_unig_meta            Entity reference
   *
   *    field_unig_private        Boolean
   *
   *    field_unig_album          Entity reference
   *
   *    field_unig_date           Date
   *
   *
   */


  namespace Drupal\unig\Utility;

  use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
  use Drupal\Core\Ajax\AjaxResponse;
  use Drupal\Core\Ajax\AlertCommand;
  use Drupal\Core\Url;
  use Drupal\image\Entity\ImageStyle;
  use Drupal\node\Entity\Node;
  use Drupal\taxonomy\Entity\Term;
  use Drupal\unig\Controller\IptcController;
  use Symfony\Component\HttpFoundation\JsonResponse;


  trait ProjectTrait {

    public $default_project_nid;

    public $project_nids = [];


    /**
     * @return array|int
     *
     */
    public static function getAllProjectNids() {

      $query = \Drupal::entityQuery('node')
        //
        // Condition
        ->condition('status', 1)
        ->condition('type', 'unig_project')
        //  ->fieldCondition('field_date', 'value', array('2011-03-01', '2011-03-31'), 'BETWEEN')
        //
        // Order by
        ->sort('field_unig_weight.value', 'ASC')
        ->sort('field_unig_date', 'DESC')
        ->sort('created', 'DESC')
        ->sort('title', 'ASC')
        //
        // Access
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
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
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
    public function getDefaultProjectNid($project_nid = FALSE) {

      if ($project_nid) {
        return $project_nid;
      }
      else {
        // Aus den Einstellungen das Defaultalbum wählen
        $default_config = \Drupal::config('unig.settings');
        $default_project_nid = $default_config->get('unig.default_project');

        if ($default_project_nid != FALSE) {

          return $default_project_nid;

        }
        else {
          $list = ProjectTrait::getAllProjectNids();

          return $list[0];
        }
      }
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

      $node = Node::load($nid);

      // Field Event Image
      if (!empty($node->field_unig_image)) {
        if (isset($node->field_unig_image->entity)) {

          $list_image_styles = \Drupal::entityQuery('image_style')->execute();

          foreach ($node->field_unig_image as $image) {

            if ($image->entity) {

              // Original

              $path = $image->entity->getFileUri();
              $url = file_create_url($path);

              $filesize = filesize($path);
              $filesize_formated = format_size($filesize);
              list($width, $height) = getimagesize($path);

              $variables['original']['url'] = $url;
              $variables['original']['uri'] = $path;
              $variables['original']['filesize'] = $filesize;
              $variables['original']['filesize_formated'] = $filesize_formated;
              $variables['original']['width'] = $width;
              $variables['original']['height'] = $height;

              // styles


              foreach ($list_image_styles as $images_style) {

                $style = ImageStyle::load($images_style);
                $url = $style->buildUrl($path);
                $uri = $style->buildUri($path);

                $filesize = filesize($uri);
                $filesize_formated = format_size($filesize);
                list($width, $height) = getimagesize($uri);

                $variables[$images_style]['url'] = $url;
                $variables[$images_style]['uri'] = $uri;
                $variables[$images_style]['filesize'] = $filesize;
                $variables[$images_style]['filesize_formated'] = $filesize_formated;
                $variables[$images_style]['width'] = $width;
                $variables[$images_style]['height'] = $height;
              }
            }
          }
        }


      }
      return $variables;

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
      //
      // sorting alphanumeric correctly
      // https://stackoverflow.com/questions/8557172/mysql-order-by-sorting-alphanumeric-correctly

      $nids = [];

      if ($album_nid != NULL) {


        $query = \Drupal::entityQuery('node')
          //
          // Condition
          ->condition('type', 'unig_file')
          ->condition('field_unig_project', $nid_project)
          ->condition('field_unig_album', $album_nid)
          //
          // Order by
          ->sort('field_unig_weight.value', 'ASC')
          ->sort('title', 'ASC')// alphanumeric
          ->sort('created', 'DESC');


        $nids = $query->execute();


      }
      else {
        // Get all unig_file_nodes in Project
        $query = \Drupal::entityQuery('node')
          //
          // Condition
          ->condition('type', 'unig_file')
          ->condition('field_unig_project', $nid_project)
          //
          // Order by
          ->sort('field_unig_weight.value', 'ASC')
          //
          // Access
          ->accessCheck(FALSE);

        $nids = $query->execute();

      }


      return $nids;
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
        $description = '';
        $node_description = $node->get('field_unig_description')->getValue();
        if ($node_description) {
          $description = $node_description[0]['value'];
        }

        // Weight
        $weight = 0;
        $node_weight = $node->get('field_unig_weight')->getValue();
        if ($node_weight) {
          $weight = $node_weight[0]['value'];
        }

        // Copyright
        $copyright = '';
        $node_copyright = $node->get('field_unig_copyright')->getValue();
        if ($node_copyright) {
          $copyright = $node_copyright[0]['value'];
        }

        // Private
        $private = 0;
        $node_private = $node->get('field_unig_private')->getValue();
        if ($node_private) {
          $private = $node_private[0]['value'];
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

        // url friendly title


        // Always replace whitespace with the separator.
        if (\Drupal::hasService('pathauto.alias_cleaner')) {
          $clean_string = \Drupal::service('pathauto.alias_cleaner')
            ->cleanString($title);

        }
        else {
          $clean_string = preg_replace('/\s+/', '_', $title);

        }


        $host = \Drupal::request()->getHost();

        // Twig-Variables
        $project = [
          'nid' => $nid,
          'title' => $title,
          'title_url' => $clean_string,
          'description' => $description,
          'copyright' => $copyright,
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
          'host' => $host,


        ];
        return $project;

      }
      else {
        return [];
      }
    }


    /**
     * @param      $project_nid
     * @param null $album_nid
     *
     * @return array
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     */
    public static function buildFileList($project_nid, $album_nid = NULL) {

      $file_nids = self::getListofFilesInProject($project_nid, $album_nid);
      $variables = [];

      foreach ($file_nids as $file_nid) {

        $variables[] = self::buildFile($file_nid);
      }


      return $variables;
    }

    public static function getJSONfromProjectFiles($project_nid, $album_nid = NULL) {

      $response = new JsonResponse();


      if ($_POST) {
        $response->setData($_POST);

        if (isset($_POST['project_nid'])) {
          $project_nid = $_POST['project_nid'];
        }

      }

      $file_nids = self::getListofFilesInProject($project_nid);
      $variables = [];

      foreach ($file_nids as $file_nid) {

        $variables[$file_nid] = self::buildFile($file_nid);
      }

      $response->setData($variables);
      return $response;
    }

    /**
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     *
     */
    public static function getJSONfromKeywordsForProject($project_nid) {
      $vid = 'unig_keywords';
      return self::getJSONfromKeywords($vid);
    }

    public static function getJSONfromKeywords() {
      $vid = 'unig_keywords';
      return self::getJSONfromVocubulary($vid);
    }


    public static function getJSONfromPeopleForProject($project_nid) {
      $vid = 'unig_people';
      return self::getJSONfromPeople($vid);
    }

    public static function getJSONfromPeople() {
      $vid = 'unig_people';
      return self::getJSONfromVocubulary($vid);
    }

    public static function getJSONfromVocubulary($vid) {
      $response = new JsonResponse();

      $terms = [];
      try {
        $terms = \Drupal::entityTypeManager()
          ->getStorage('taxonomy_term')
          ->loadTree($vid);
      } catch (InvalidPluginDefinitionException $e) {
      }
      foreach ($terms as $term) {
        $term_data[] = [
          "id" => $term->tid,
          "name" => $term->name,
        ];
      }

      $response->setData($term_data);
      return $response;
    }


    /**
     * @param      $project_nid
     * @param null $album_nid
     */
    public static function importKeywordsFromProject($project_nid, $album_nid = NULL) {

      $nids = self::getListofFilesInProject($project_nid, $album_nid);

      foreach ($nids as $nid) {

        self::importKeywordsFromNode($nid);
      }


    }

    public static function importKeywordsFromNode($nid) {

      // File
      $entity = Node::load($nid);
      $file_id = $entity->get('field_unig_image')->target_id;
      $title = $entity->getTitle();

      // IPTC
      $iptc = new IptcController($file_id);
      $keywords = $iptc->getKeywordTermIDs();
      $people = $iptc->getPeopleTermIds();

      // Keywords
      if (!empty($keywords)) {
        $value_keywords = [];
        foreach ($keywords as $keyword) {
          $value_keywords[] = ['target_id' => $keyword];
        }
        $entity->field_unig_keywords = $value_keywords;
      }

      // People
      if (!empty($people)) {
        $value_people = [];
        foreach ($people as $dude) {
          $value_people[] = ['target_id' => $dude];
        }
        $entity->field_unig_people = $value_people;
      }

      // Save
      $entity->save();

    }


    /**
     * @param $file_nid
     *
     * @return array
     *
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     */
    public static function buildFile($file_nid) {

      // project
      //  - nid
      //  - date
      //  - timestamp
      //  - title
      //  - description
      //  - copyright

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

      // Rating
      $rating = 0;
      $node_rating = $entity->get('field_unig_rating')->getValue();
      if ($node_rating) {
        $rating = $node_rating[0]['value'];
      }

      // Weight
      $weight = 0;
      $node_weight = $entity->get('field_unig_weight')->getValue();
      if ($node_weight) {
        $weight = $node_weight[0]['value'];
      }

      // Copyright
      $copyright = '';
      $node_copyright = $entity->get('field_unig_copyright')->getValue();
      if ($node_copyright) {
        $copyright = $node_copyright[0]['value'];
      }

      // image
      $image = self::getImage($file_nid);

      // people
      $people = [];
      $node_people = $entity->get('field_unig_people')->getValue();
      if ($node_people) {
        foreach ($node_people as $term) {
          $tid = $term['target_id'];
          $term = Term::load($tid);

          if ($term) {
            $name = $term->getName();
            $item = ['id' => $tid, 'name' => $name];
            $people[] = $item;
          }
        }
      }
      // keywords
      $keywords = [];
      $node_keywords = $entity->get('field_unig_keywords')->getValue();
      if ($node_keywords) {
        foreach ($node_keywords as $term) {

          $tid = $term['target_id'];
          $term = Term::load($tid);

          if ($term) {
            $name = $term->getName();
            $item = ['id' => $tid, 'name' => $name];
            $keywords[] = $item;
          }

        }
      }
      // Album List
      $album_list = AlbumTrait::getAlbumList($nid);

      // Twig-Variables
      $file = [
        'nid' => $nid,
        'title' => $title,
        'album_list' => $album_list,
        'image' => $image,
        'weight' => $weight,
        'rating' => $rating,
        'copyright' => $copyright,
        'people' => $people,
        'keywords' => $keywords,
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
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     * @throws \Drupal\Core\Entity\EntityStorageException
     */
    public static function saveProject() {


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

      // copyright
      $entity->field_unig_copyright[0] = $data['copyright'];

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


  }