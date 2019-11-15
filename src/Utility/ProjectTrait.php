<?php


namespace Drupal\unig\Utility;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;

use Drupal\Core\Entity\EntityStorageException;
use Drupal\Core\Url;

use Drupal\node\Entity\Node;
use Drupal\unig\Controller\IptcController;
use Drupal\unig\Controller\OutputController;
use Drupal\unig\Models\UnigProject;
use Exception;
use Symfony\Component\HttpFoundation\JsonResponse;
use User;

trait ProjectTrait
{

  /**
   * @return array|int
   *
   */
  public static function getAllProjectNids($cat_id = null)
  {
    // Get the current user
    $user = Drupal::currentUser();

    $query =
      //
      // Condition
      Drupal::entityQuery('node')
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

      $nids = false;
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
   * @param bool $project_id
   * @return int
   */
  public function getDefaultProjectNid($project_id = false): ?int
  {
    if ($project_id) {
      return $project_id;
    }

    // Choose the default project from settings
    $default_config = Drupal::config('unig.settings');
    $default_project_id = $default_config->get('unig.default_project');
    if ($default_project_id) {
      return (int)$default_project_id;
    }

    // or take newest Project
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
   * @throws PluginNotFoundException
   */
  public static function newUniGProject($title)
  {
    $config = \Drupal::config('unig.settings');

    //load up an array for creation
    $content = [
      'title' => $title,
      'status' => 1, //(1 or 0): published or not
      'promote' => 0, //(1 or 0): promoted to front page
      'type' => 'unig_project'
    ];

    $new_node = Drupal::entityTypeManager()
      ->getStorage('node')
      ->create($content);

    // Add default Category
    $category_tid = $config->get('unig.default_category');
    if ($category_tid) {
      $new_node->set('field_unig_category', $category_tid);
    }

    $new_node->save();

    // hole die neu erstellte Node ID
    return $new_node->id();
  }

  /**
   * @return integer
   * @throws EntityStorageException
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function newDefaultUniGProject(): int
  {
    $title = 'Default';
    $nid = self::newUniGProject($title);

    // schreibe nid in die Settings
    Drupal::configFactory()
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
    $root = Drupal::service('file_system')->realpath(
      $path_destination . $path_unig
    );
    $realpath_project = $root . '/' . $path_project;

    $is_dir = is_dir($realpath_project);

    if (false == $is_dir) {
      $result = Drupal::service('file_system')->mkdir(
        $realpath_project,
        0755,
        true
      );

      if (false == $result) {
        Drupal::messenger()->addMessage(
          'ERROR: Could not create the directory for the gallery'
        );
      }
    } else {
      $result = $realpath_project;
    }
    $this->counter++;

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
  public static function setCover($nid_project, $nid_image = null): OutputController
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
   * @return array
   * @throws Exception
   */
  public static function getCoverImageVars($nid): array
  {
    $variables = [];
    if ($nid) {
      $node = Node::load((int)$nid);
      if ($node) {
        $unig_image_id = Helper::getFieldValue($node, 'unig_image');
        $variables = CreateImageStylesTrait::createImageStyles(
          $unig_image_id,
          false,
          false
        );
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
   * @throws Exception
   */
  public static function getImageVars($nid): array
  {
    $variables = [];

    $node = Node::load($nid);
    if ($node) {
      $unig_image_id = Helper::getFieldValue($node, 'unig_image');
      $variables = CreateImageStylesTrait::createImageStyles(
        $unig_image_id,
        false,
        false
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
   * @param null $album_id
   *
   * @return array
   */
  public static function getListofFilesInProject($nid_project, $album_id = null)
  {
    // bundle : unig_file
    // field: field_unig_project[0]['target_id']
    //
    // sorting alphanumeric correctly
    // https://stackoverflow.com/questions/8557172/mysql-order-by-sorting-alphanumeric-correctly

    $nids = [];

    if ($album_id != null) {
      $query = // alphanumeric
        //
        // Condition
        //
        // Order by
        Drupal::entityQuery('node')
          ->condition('type', 'unig_file')
          ->condition('field_unig_project', $nid_project)
          ->condition('field_unig_album', $album_id)
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
        Drupal::entityQuery('node')
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
      foreach ($nids as $project_id) {
        try {
          $variables[] = self::buildProject($project_id);
        } catch (Exception $e) {
        }
      }
    }

    return $variables;
  }

  /**
   * @param $project_id
   * @return array
   *
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   * @throws Exception
   */
  public static function buildProject($project_id): array
  {
    // project
    //  - nid / id
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

    // Load Project
    $node = Node::load((int)$project_id);

    // check if Nid is Unig Project
    if ($node && $node->bundle() !== 'unig_project') {
      $message = 'Node with ' . $project_id . ' is not an UniG-Project';
      \Drupal::logger('type')->error($message);
      return ['nid' => 0];
    }

    // No Project with this Nid
    /** @var TYPE_NAME $node */
    if (!$node) {
      return ['nid' => 0];
    }

    // Title
    $title = $node->label();

    // Body
    $description = Helper::getFieldValue($node, UnigProject::field_description);

    // Weight
    $weight = Helper::getFieldValue($node, UnigProject::field_weight);

    // Copyright
    $copyright = Helper::getFieldValue($node, UnigProject::field_copyright);

    // Private
    $private = Helper::getFieldValue($node, UnigProject::field_private);

    // Category
    $category = Helper::getFieldValue($node, UnigProject::field_category, UnigProject::term_category);
    $category_id = Helper::getFieldValue($node, UnigProject::field_category);
    $category_list = Helper::getTermsForOptionList(UnigProject::term_category);

    // Tags
    $tags = Helper::getFieldValue($node, UnigProject::field_tags, UnigProject::term_tags, true);
    $tags_ids = Helper::getFieldValue($node, UnigProject::field_tags, false, true);
    $tags_list = Helper::getTermsForOptionList(UnigProject::term_tags);

    // Help
    $help = Helper::getFieldValue($node, UnigProject::field_help);


    // Date
    $date = Helper::getFieldValue($node, UnigProject::field_date);
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
    $cover_id = Helper::getFieldValue($node, UnigProject::field_project_cover);

    if (!$cover_id) {
      $new_cover = self::setCover($project_id);
      $cover_id = $new_cover->getTid();
    }
    $cover_image = self::getCoverImageVars((int)$cover_id);

    // number_of_items
    $number_of_items = self::countFilesInProject($project_id);

    // Album List
    $album_list = AlbumTrait::getAlbumList($project_id);

    // url friendly title

    // Always replace whitespace with the separator.
    if (Drupal::hasService('pathauto.alias_cleaner')) {
      $clean_string = Drupal::service('pathauto.alias_cleaner')->cleanString(
        $title
      );
    } else {
      $clean_string = preg_replace('/\s+/', '_', $title);
    }

    // Host
    $host = Drupal::request()->getHost();

    // URL
    $url = Url::fromRoute('unig.project.public', [
      'project_id' => $project_id
    ]);

    // Twig-Variables
    // --------------------------------------------
    $project = [
      'id' => $project_id,
      'project_id' => $project_id,
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
      'host' => $host,
      'url' => $url,
      'help' => $help
    ];

    return $project;
  }

  /**
   * @param      $project_id
   * @param null $album_id
   *
   * @return array
   * @throws InvalidPluginDefinitionException
   */
  public static function buildFileList($project_id, $album_id = null)
  {
    $file_nids = self::getListofFilesInProject($project_id, $album_id);
    $variables = [];

    foreach ($file_nids as $file_nid) {
      $variables[] = Drupal\unig\Models\UnigFile::buildFile($file_nid);
    }

    return $variables;
  }

  public static function getJSONFromProjectFiles(
    $project_id,
    $album_id = null
  ): JsonResponse
  {
    $response = new JsonResponse();

    // TODO: (replace $_POST with new Drupal method )

    $postReq = \Drupal::request()->request->all();
    // $response['debug'] = $postReq;

    if (isset($postReq, $postReq['project_id'])) {
      $project_id = $postReq['project_id'];
    }

    $file_nids = self::getListofFilesInProject($project_id);
    $variables = [];

    foreach ($file_nids as $file_nid) {
      $variables[$file_nid] = Drupal\unig\Models\UnigFile::buildFile($file_nid);
    }

    $response->setData($variables);
    return $response;
  }

  /**
   * @return JsonResponse
   *
   */
  public static function getJSONfromKeywordsForProject($project_id)
  {
    $vid = 'unig_keywords';
    return self::getJSONfromKeywords($vid);
  }

  public static function getJSONfromKeywords()
  {
    $vid = 'unig_keywords';
    return self::getJSONfromVocubulary($vid);
  }

  public static function getJSONfromPeopleForProject($project_id)
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
      $terms = Drupal::entityTypeManager()
        ->getStorage('taxonomy_term')
        ->loadTree($vid);
    } catch (InvalidPluginDefinitionException $e) {
    }
    foreach ($terms as $term) {
      $term_data[] = [
        'id' => (int)$term->tid,
        'name' => (string)$term->name
      ];
    }

    $response->setData($term_data);
    return $response;
  }

  /**
   * @param      $project_id
   * @param null $album_id
   * @return array
   */
  public static function importKeywordsFromProject(
    $project_id,
    $album_id = null
  ): array
  {
    $list = [];
    $nids = self::getListofFilesInProject($project_id, $album_id);

    // read Keywords of every Files in Project
    foreach ($nids as $nid) {
      $result = self::importKeywordsFromNode($nid);
      if ($result) {
        $list[] = $result;
      }
    }

    // return list of images id with keywords
    return $list;
  }

  /**
   * @param $nid
   * @return bool|null
   */
  public static function importKeywordsFromNode($nid): ?bool
  {
    // File
    $entity = Node::load($nid);
    if (!empty($entity)) {
      $file_id = $entity->get('field_unig_image')->target_id;
      if ($file_id) {
        // IPTC
        $iptc = new IptcController($file_id);
        // dpm($iptc);
        $keywords = $iptc->getKeywordTermIDs();
        $people = $iptc->getPeopleTermIds();

        // Keywords
        if (!empty($keywords)) {
          $value_keywords = [];
          foreach ($keywords as $keyword) {
            $value_keywords[] = ['target_id' => $keyword];
          }
          $entity->set('field_unig_keywords', $value_keywords);
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

        try {
          $entity->save();
          if (!empty($value_people) || !empty($value_keywords)) {
            return $nid;
          }
          return false;
        } catch (EntityStorageException $e) {
          return false;
        }
      } else {
        $message = 'importKeywordsFromNode: no Image found in Node ' . $nid;
        Drupal::logger('unig')->warning($message);
        return false;
      }
    } else {
      $message = 'importKeywordsFromNode: invalid NID';
      Drupal::logger('unig')->warning($message);
      return false;
    }
  }

  public static function projectDelete($project_id)
  {
    // delete Project
    $status = false;
    $message = $project_id;

    if ($project_id) {
      $node = Node::Load($project_id);

      // load node
      if ($node) {
        // Delete Project
        $node->delete();

        // Delete Files
        self::deleteAllFilesInProject($project_id);

        // Node delete success
        $status = true;
        $message = 'Das Projekt mit der ID ' . $project_id . ' wurde gelöscht';
      } // no Node found
      else {
        $status = false;
        $message = 'kein Projekt mit der ID ' . $project_id . ' gefunden';
      }
    }

    // Output
    $output = [
      'status' => $status,
      'message' => $message
    ];
    return $output;
  }

  public static function deleteAllFilesInProject($project_id)
  {
    // Delete all Files
    $file_nids = self::getListofFilesInProject($project_id);

    foreach ($file_nids as $file_nid) {
      FileTrait::deleteFile($file_nid, $project_id);
    }
    return true;
  }

  /**
   *
   * @return mixed
   *
   *
   * @throws EntityStorageException
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function saveProject()
  {
    $postReq = \Drupal::request()->request->all();
    $project_id = $postReq['id'] ?? false;
    $data = $postReq['data'] ?? false;

    // Load node
    $entity = Drupal::entityTypeManager()
      ->getStorage('node')
      ->load($project_id);

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

  /**
   * @param $project_id
   * @return array
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function getPeopleTerms($project_id): array
  {
    return Helper::getTermList(UnigProject::term_people);
  }

  /**
   * @param $project_id
   * @return array
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  public static function getKeywordTerms($project_id): array
  {
    return Helper::getTermList(UnigProject::term_keywords);
  }

}
