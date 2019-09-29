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
use Drupal\Core\Entity\EntityStorageException;
use Drupal\Core\Url;
use Drupal\file\Entity\File;
use Drupal\file\FileInterface;
use Drupal\image\Entity\ImageStyle;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\unig\Controller\IptcController;
use Drupal\unig\Controller\OutputController;
use Symfony\Component\HttpFoundation\JsonResponse;
use User;

trait ProjectTrait
{
  public $default_project_nid;

  public $project_nids = [];

  /**
   * @param null $cat_id
   * @return array
   */
  public static function getAllProjectNids($cat_id = null): array
  {
    // Get the current user
    $user = \Drupal::currentUser();

    $query =
      //
      // Condition
      \Drupal::entityQuery('node')
        ->condition('status', 1)
        ->condition('type', 'unig_project');
    //  ->condition('field_date', 'value', array('2011-03-01', '2011-03-31'), 'BETWEEN')
    //

    // Check for permission "Private"
    if (!$user->hasPermission('access unig private')) {
      $query->condition('field_unig_private.value', '1', '!=');
    }

    // Restricting to category?
    if ($cat_id && is_int($cat_id)) {

      // check if  cat_id is valid term
      $term = Helper::getTermNameByID($cat_id);

      if ($term) {
        $query->condition('field_unig_category', $cat_id);
      }
    }

    // Order by
    //
    // Access
    $query
      ->sort('field_unig_weight.value')
      ->sort('created', 'DESC')
      ->sort('field_unig_date', 'DESC')
      ->sort('title')
      ->accessCheck(false);

    $nids = $query->execute();

    if (count($nids) === 0) {
      //   $nid_default = self::newDefaultUniGProject();
      //   $nids[0] = $nid_default;

      // $nids = false;
    }

    return $nids;
  }

  /**
   * @return array
   */
  public function getProjectlistSelected(): array
  {
    $select = [];

    $nids = self::getAllProjectNids();

    $select['neu'] = t('Create new project...');

    if ($nids && is_array($nids)) {
      $select['-'] = '';

      $entity_list = Node::loadMultiple($nids);

      foreach ($entity_list as $nid => $node) {
        $node_nid = $node->get('nid')->getValue();
        $node_title = $node->get('title')->getValue();

        $nid = $node_nid[0]['value'];
        $title = $node_title[0]['value'];

        $select[$nid] = $title;
      }
    }

    return $select;
  }

  /**
   * depricated
   *
   * @param bool $project_nid
   * @return int
   */
  public function getDefaultProjectNid($project_nid = false): ?int
  {
    if ($project_nid) {
      return $project_nid;
    }

    // Aus den Einstellungen das Defaultalbum wählen
    $default_config = \Drupal::config('unig.settings');
    $default_project_nid = $default_config->get('unig.default_project');
    if ($default_project_nid) {
      return (int)$default_project_nid;
    }

    // sonst das letzte Projekt nehmen
    $list = ProjectTrait::getAllProjectNids();
    if ($list) {
      return array_shift($list);
    }

    return 0;
  }

  /**
   * @param $title
   *
   * @return int|null|string
   * @throws EntityStorageException
   * @throws InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public static function newUniGProject($title)
  {
    // define entity type and bundle
    // $entity_type = "node";

    //  $node_title = $title;
    //  $node_alias = UniGTrait::toAscii($title);

    // get definition of target entity type
    // $entity_def = \Drupal::entityTypeManager()->getDefinition($entity_type);

    //load up an array for creation
    $new_node = [
      'title' => $title,
      'status' => 1, //(1 or 0): published or not
      'promote' => 0, //(1 or 0): promoted to front page
      'type' => 'unig_project'
    ];

    $new_post = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->create($new_node);

    $new_post->save();

    // hole die neu erstellte Node ID
    return $new_post->id();
  }

  /**
   * @return integer
   * @throws EntityStorageException
   * @throws InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public static function newDefaultUniGProject(): int
  {
    $title = 'Default';
    $nid = self::newUniGProject($title);

    // schreibe nid in die Settings
    \Drupal::configFactory()
      ->getEditable('unig.settings')
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
  public function checkProjectDir($path_destination, $path_unig, $path_project)
  {
    $root = \Drupal::service('file_system')->realpath(
      $path_destination . $path_unig
    );
    $realpath_project = $root . '/' . $path_project;

    $is_dir = is_dir($realpath_project);

    if (false == $is_dir) {
      $result = \Drupal::service('file_system')->mkdir(
        $realpath_project,
        0755,
        true
      );

      if (false == $result) {
        \Drupal::messenger()->addMessage(
          'ERROR: Could not create the directory for the gallery'
        );
      }
    } else {
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
   * @return OutputController
   */
  public static function setCover($nid_project, $nid_image = null)
  {
    $output = new OutputController();

    $node = Node::load($nid_project);
    $title = $node->getTitle();

    if ($nid_image) {
      $nid_cover = $nid_image;
      $node->get('field_unig_project_cover')->target_id = $nid_cover;
    }

    // Load and Save Project

    try {
      $node->save();
      $cover_tid = $node->get('field_unig_project_cover')->target_id;

      $output->setStatus(true);
      $output->setTitle($title);
      $output->setTid($cover_tid);
      $output->setMessages(
        t('New cover picture set for project ' . $title),
        'success'
      );
    } catch (EntityStorageException $e) {
      $output->setStatus(true);
      $output->setTitle($node->getTitle());
      $output->setTid(0);
      $output->setMessages(
        t('ERROR: cover image adding failed. Project: ' . $title),
        'error'
      );
    }

    return $output;
  }

  /**
   *
   * get uri from all styles from Cover image
   *
   * @param $nid
   *
   * @return
   * @throws \Exception
   */
  public static function getCoverImageVars($nid)
  {
    $variables = [];

    if ($nid) {
      $cover_id = $nid;
      $node = Node::load((int)$nid);
      if ($node && $cover_id) {
      $variables = CreateImageStylesTrait::createImageStyles($cover_id);
      }
    }
    return $variables;
  }

  /**
   *
   * get uri from all styles
   *
   * @param $nid
   *
   * @return array
   * @throws \Exception
   */
  public static function getImageVars($nid)
  {
    $variables = [];

    $node = Node::load($nid);
    if ($node) {
      $unig_image_id = Helper::getFieldValue($node, 'unig_image');
      $variables = CreateImageStylesTrait::createImageStyles(
        $unig_image_id,
        false,
        true
      );
    }
    return $variables;
  }

  /**
   * @param $nid_project
   *
   * @return int
   */
  public static function countFilesInProject($nid_project)
  {
    $files = self::getListofFilesInProject($nid_project);

    if (!empty($files)) {
      $number_of_files = count($files);
    } else {
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
  public static function getListofFilesInProject(
    $nid_project,
    $album_nid = null
  )
  {
    // bundle : unig_file
    // field: field_unig_project[0]['target_id']
    //
    // sorting alphanumeric correctly
    // https://stackoverflow.com/questions/8557172/mysql-order-by-sorting-alphanumeric-correctly

    $nids = [];

    if ($album_nid != null) {
      $query = // alphanumeric
        //
        // Condition
        //
        // Order by
        \Drupal::entityQuery('node')
          ->condition('type', 'unig_file')
          ->condition('field_unig_project', $nid_project)
          ->condition('field_unig_album', $album_nid)
          ->sort('field_unig_weight.value', 'ASC')
          ->sort('title', 'ASC')
          ->sort('created', 'DESC');

      $nids = $query->execute();
    } else {
      // Get all unig_file_nodes in Project
      $query =
        //
        // Condition
        //
        // Order by
        //
        // Access
        \Drupal::entityQuery('node')
          ->condition('type', 'unig_file')
          ->condition('field_unig_project', $nid_project)
          ->sort('field_unig_weight.value', 'ASC')
          ->accessCheck(false);

      $nids = $query->execute();
    }

    return $nids;
  }

  public static function buildProjectList($cat_id = null): array
  {
    $nids = self::getAllProjectNids($cat_id);
    // DEBUG
    //   $nids = [298];

    $variables = [];

    if ($nids) {
      foreach ($nids as $project_nid) {
        $variables[] = self::buildProject($project_nid);
      }
    }

    return $variables;
  }

  /**
   * @param $project_nid
   * @return array
   *
   * @throws InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Exception
   */
  public static function buildProject($project_id): array
  {
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

    // var_dump($project_nid);
    $project_id = (int)$project_id;
    $node = Node::load($project_id);

    if (!$node) {
      $project = ['nid' => 0];
    } else {
      // NID

      // Title
      $title = Helper::getFieldValue($node, 'title');

      // Body
      $description = Helper::getFieldValue($node, 'unig_description');

      // Weight
      $weight = Helper::getFieldValue($node, 'unig_weight');

      // Copyright
      $copyright = Helper::getFieldValue($node, 'unig_copyright');

      // Private
      $private = Helper::getFieldValue($node, 'unig_private');

      // Category
      $category = Helper::getFieldValue(
        $node,
        'unig_category',
        'unig_category'
      );
      $category_id = Helper::getFieldValue($node, 'unig_category');

      $category_list = Helper::getTermsForOptionList('unig_category');

      // Tags
      $tags = Helper::getFieldValue($node, 'unig_tags', 'unig_tags', true);
      $tags_ids = Helper::getFieldValue($node, 'unig_tags', false, true);
      $tags_list = Helper::getTermsForOptionList('unig_tags');

      // Date
      $date = Helper::getFieldValue($node, 'unig_date');
      if ($date) {
        $format = 'Y-m-d';
        $php_date_obj = date_create_from_format($format, $date);
      } else {
        $php_date_obj = date_create();
      }

      // Timestamp
      $timestamp = (int)$php_date_obj->format('U');

      // Year
      $year = $php_date_obj->format('Y');

      // Date
      $date = $php_date_obj->format('d. F Y');

      // Date
      // TODO: move date display format to settings page
      $date_drupal = $php_date_obj->format('Y-m-d');

      // Cover Image
      $cover_id = Helper::getFieldValue($node, 'unig_project_cover');
      $cover_image = false;

      if ($cover_id) {
        $cover_image = self::getCoverImageVars($cover_id);
      }

      // number_of_items
      $number_of_items = self::countFilesInProject($project_id);

      // Album List
      $album_list = AlbumTrait::getAlbumList($project_id);

      // url friendly title

      // Always replace whitespace with the separator.
      if (\Drupal::hasService('pathauto.alias_cleaner')) {
        $clean_string = \Drupal::service('pathauto.alias_cleaner')->cleanString(
          $title
        );
      } else {
        $clean_string = preg_replace('/\s+/', '_', $title);
      }

      $host = \Drupal::request()->getHost();

      // Twig-Variables
      $project = [
        'nid' => $project_id,
        'title' => $title,
        'title_url' => $clean_string,
        'description' => $description,
        'copyright' => $copyright,
        'weight' => $weight,
        'category' => $category,
        'category_id' => $category_id,
        'category_list' => $category_list,
        'tags' => $tags,
        'tags_ids' => $tags_ids,
        'tags_list' => $tags_list,
        'private' => $private,
        'timestamp' => $timestamp,
        'date' => $date,
        'date_drupal' => $date_drupal,
        'year' => $year,
        'number_of_items' => $number_of_items,
        'cover_id' => $cover_id,
        'cover_image' => $cover_image,
        'album_list' => $album_list,
        'host' => $host
      ];
    }

    return $project;
  }

  /**
   * @param      $project_nid
   * @param null $album_nid
   *
   * @return array
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   */
  public static function buildFileList($project_nid, $album_nid = null)
  {
    $file_nids = self::getListofFilesInProject($project_nid, $album_nid);
    $variables = [];

    foreach ($file_nids as $file_nid) {
      $variables[] = self::buildFile($file_nid);
    }

    return $variables;
  }

  public static function getJSONfromProjectFiles(
    $project_nid,
    $album_nid = null
  )
  {
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
  public static function getJSONfromKeywordsForProject($project_nid)
  {
    $vid = 'unig_keywords';
    return self::getJSONfromKeywords($vid);
  }

  public static function getJSONfromKeywords()
  {
    $vid = 'unig_keywords';
    return self::getJSONfromVocubulary($vid);
  }

  public static function getJSONfromPeopleForProject($project_nid)
  {
    $vid = 'unig_people';
    return self::getJSONfromPeople($vid);
  }

  public static function getJSONfromPeople()
  {
    $vid = 'unig_people';
    return self::getJSONfromVocubulary($vid);
  }

  public static function getJSONfromVocubulary($vid)
  {
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
        'id' => $term->tid,
        'name' => $term->name
      ];
    }

    $response->setData($term_data);
    return $response;
  }

  /**
   * @param      $project_nid
   * @param null $album_nid
   */
  public static function importKeywordsFromProject(
    $project_nid,
    $album_nid = null
  )
  {
    $nids = self::getListofFilesInProject($project_nid, $album_nid);

    foreach ($nids as $nid) {
      self::importKeywordsFromNode($nid);
    }
  }

  public static function importKeywordsFromNode($nid)
  {
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
   * @throws \Exception
   */
  public static function buildFile($file_nid)
  {
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

    // Title Generated
    $title_generated = $entity->get('field_unig_title_generated')->getValue();
    if ($title_generated) {
      $title_generated = $title_generated[0]['value'];
    } else {
      $title_generated = 1;
    }

    // Description
    $description = $entity->get('field_unig_description')->getValue();

    if ($description) {
      $description = $description[0]['value'];
    }

    // comments
    $comments = 'comments';

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
    $image = self::getImageVars($file_nid);

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
      'description' => $description,
      'album_list' => $album_list,
      'image' => $image,
      'comments' => $comments,
      'weight' => $weight,
      'rating' => $rating,
      'copyright' => $copyright,
      'people' => $people,
      'keywords' => $keywords,
      'title_generated' => $title_generated
    ];

    return $file;
  }

  public static function projectDelete($project_nid)
  {
    // delete Project
    $status = false;
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
        $status = true;
        $message = 'Das Projekt mit der ID ' . $project_nid . ' wurde gelöscht';
      } // no Node found
      else {
        $status = false;
        $message = 'kein Projekt mit der ID ' . $project_nid . ' gefunden';
      }
    }

    // Output
    $output = [
      'status' => $status,
      'message' => $message
    ];
    return $output;
  }

  public static function deleteAllFilesInProject($project_nid)
  {
    // Delete all Files
    $file_nids = self::getListofFilesInProject($project_nid);

    foreach ($file_nids as $file_nid) {
      FileTrait::deleteFile($file_nid);
    }
    return true;
  }

  /**
   *
   * @return mixed
   *
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public static function saveProject()
  {
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

    // category
    $entity->field_unig_category[0]['target_id'] = $data['category'];

    // private
    $int_private = (int)$data['private'];
    if ($int_private == 1) {
      $private = 1;
    } else {
      $private = 0;
    }

    $entity->field_unig_private[0] = $private;

    // Save node
    $entity->save();

    /*
$response = new AjaxResponse();
    $response->addCommand(new AlertCommand($data));
    return $response;
*/

    $output = new OutputController();

    // Output
    $output->setStatus(true);
    $output->setData($data);
    return $output->json();
  }
}
