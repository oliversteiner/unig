<?php

namespace Drupal\unig\Utility;

use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\mollo_utils\Utility\MolloUtils;
use Drupal\node\Entity\Node;
use Drupal\unig\Controller\IptcController;
use Drupal\unig\Controller\OutputController;
use Drupal\unig\Models\UnigFile;
use Drupal\unig\Models\UnigProject;
use Symfony\Component\HttpFoundation\JsonResponse;

trait ProjectTrait {

  /**
   * @param null $cat_id
   *
   * @return array|int
   */
  public static function getAllProjectNids($cat_id = NULL): array|int {
    // Get the current user.
    $user = \Drupal::currentUser();

    $query =
      //
      // Condition.
      \Drupal::entityQuery('node')
        ->condition('status', 1)
        ->condition('type', 'unig_project');
    // ->condition('field_date', 'value', array('2011-03-01', '2011-03-31'), 'BETWEEN')
    //
    // Check for permission "Private".
    if (!$user->hasPermission('access unig private')) {
      $query->condition('field_unig_private.value', '1', '!=');
    }

    // Restricting to category?
    if (isset($cat_id)) {
      // Check if  cat_id is valid term.
      $term = MolloUtils::getTermNameByID($cat_id);

      if ($term) {
        $query->condition('field_unig_category', $cat_id);
      }
    }

    // Order by
    //
    // Access.
    $query
      ->sort('field_unig_weight.value')
      ->sort('created', 'DESC')
      ->sort('field_unig_date', 'DESC')
      ->sort('title')
      ->accessCheck(FALSE);

    $nids = $query->execute();

    if (count($nids) === 0) {
      $nids = FALSE;
    }

    return $nids;
  }

  /**
   * @return array
   */
  public static function getProjectListSelected(): array {
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
   * @param $title
   *
   * @return int|null|string
   * @throws \Drupal\Core\Entity\EntityStorageException
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public static function newUniGProject($title): int|string|null {
    $config = \Drupal::config('unig.settings');

    // Load up an array for creation.
    $content = [
      'title' => $title,
      // (1 or 0): published or not
      'status' => 1,
      // (1 or 0): promoted to front page
      'promote' => 0,
      'type' => 'unig_project',
    ];

    $new_node = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->create($content);

    // Add default Category.
    $category_tid = $config->get('unig.default_category');
    if ($category_tid) {
      $new_node->set('field_unig_category', $category_tid);
    }

    $new_node->save();

    // Hole die neu erstellte Node ID.
    return $new_node->id();
  }

  /**
   * @return int
   * @throws \Drupal\Core\Entity\EntityStorageException
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public static function newDefaultUniGProject(): int {
    $title = 'Default';
    $nid = self::newUniGProject($title);

    // Schreibe nid in die Settings.
    \Drupal::configFactory()
      ->getEditable('unig.settings')
      ->set('unig.default_project', $nid)
      ->save();

    return $nid;
  }

  /**
   *
   * @return mixed
   *
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public static function saveProject() {
    $postReq = \Drupal::request()->request->all();
    $project_id = $postReq['id'] ?? FALSE;
    $data = $postReq['data'] ?? FALSE;

    // Load node.
    $entity = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->load($project_id);

    if ($entity) {

      // Title.
      $entity->title[0] = $data['title'];

      // Date.
      $entity->field_unig_date[0] = $data['date'];

      // Weight.
      $entity->field_unig_weight[0] = $data['weight'];

      // Description.
      $entity->field_unig_description[0] = $data['description'];

      // Copyright.
      $entity->field_unig_copyright[0] = $data['copyright'];

      // Category.
      $entity->field_unig_category[0]['target_id'] = $data['category'];

      // Private.
      $int_private = (int) $data['private'];
      if ($int_private == 1) {
        $private = 1;
      }
      else {
        $private = 0;
      }

      $entity->field_unig_private[0] = $private;

      // Save node.
      $entity->save();

    }
    $output = new OutputController();

    // Output.
    $output->setStatus(TRUE);
    $output->setData($data);
    return $output->json();
  }

  /**
   * @param $project_id
   *
   * @return array
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public static function getPeopleTerms($project_id): array {
    return MolloUtils::getTermList(UnigProject::term_people);
  }

  /**
   * @param $project_id
   *
   * @return array
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public static function getKeywordTerms($project_id): array {
    return MolloUtils::getTermList(UnigProject::term_keywords);
  }


  /**
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public static function getJSONfromKeywordsForProject($project_id) {
    $vid = 'unig_keywords';
    return self::getJSONfromKeywords($vid);
  }

  /**
   *
   */
  public static function getJSONfromKeywords() {
    $vid = 'unig_keywords';
    return self::getJSONfromVocubulary($vid);
  }

  /**
   *
   */
  public static function getJSONfromPeopleForProject($project_id) {
    $vid = 'unig_people';
    return self::getJSONfromPeople($vid);
  }

  /**
   *
   */
  public static function getJSONfromPeople() {
    $vid = 'unig_people';
    return self::getJSONfromVocubulary($vid);
  }

  /**
   *
   */
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
        'id' => (int) $term->tid,
        'name' => (string) $term->name,
      ];
    }

    $response->setData($term_data);
    return $response;
  }

  /**
   * @param      $project_id
   * @param null $album_id
   *
   * @return array
   */
  public function importKeywordsFromProject(
    $project_id,
    $album_id = NULL
  ): array {
    $list = [];
    $nids = $this->getListofFilesInProject($project_id, $album_id);

    // Read Keywords of every Files in Project.
    foreach ($nids as $nid) {
      $result = self::importKeywordsFromNode($nid);
      if ($result) {
        $list[] = $result;
      }
    }

    // Return list of images id with keywords.
    return $list;
  }

  /**
   * @param $nid
   *
   * @return bool|null
   */
  public static function importKeywordsFromNode($nid): ?bool {
    // File.
    $entity = Node::load($nid);
    if (!empty($entity)) {
      $file_id = $entity->get('field_unig_image')->target_id;
      if ($file_id) {
        // IPTC.
        $iptc = new IptcController($file_id);
        // dpm($iptc);
        $keywords = $iptc->getKeywordTermIDs();
        $people = $iptc->getPeopleTermIds();

        // Keywords.
        if (!empty($keywords)) {
          $value_keywords = [];
          foreach ($keywords as $keyword) {
            $value_keywords[] = ['target_id' => $keyword];
          }
          $entity->set('field_unig_keywords', $value_keywords);
        }

        // People.
        if (!empty($people)) {
          $value_people = [];
          foreach ($people as $dude) {
            $value_people[] = ['target_id' => $dude];
          }
          $entity->field_unig_people = $value_people;
        }

        // Save.
        try {
          $entity->save();
          if (!empty($value_people) || !empty($value_keywords)) {
            return $nid;
          }
          return FALSE;
        } catch (EntityStorageException $e) {
          return FALSE;
        }
      }
      else {
        $message = 'importKeywordsFromNode: no Image found in Node ' . $nid;
        \Drupal::logger('unig')->warning($message);
        return FALSE;
      }
    }
    else {
      $message = 'importKeywordsFromNode: invalid NID';
      \Drupal::logger('unig')->warning($message);
      return FALSE;
    }
  }

  /**
   *
   */
  public static function projectDelete($project_id) {
    // Delete Project.
    $status = FALSE;
    $message = $project_id;

    if ($project_id) {
      $node = Node::Load($project_id);

      // Load node.
      if ($node) {
        // Delete Project.
        $node->delete();

        // Delete Files.
        self::deleteAllFilesInProject($project_id);

        // Node delete success.
        $status = TRUE;
        $message = 'Das Projekt mit der ID ' . $project_id . ' wurde gelöscht';
      }
      // No Node found.
      else {
        $status = FALSE;
        $message = 'kein Projekt mit der ID ' . $project_id . ' gefunden';
      }
    }

    // Output.
    $output = [
      'status' => $status,
      'message' => $message,
    ];
    return $output;
  }

  /**
   *
   */
  public function getJSONFromProjectFiles(
    $project_id,
    $album_id = NULL
  ): JsonResponse {
    $response = new JsonResponse();

    // @todo (replace $_POST with new Drupal method )
    $postReq = \Drupal::request()->request->all();
    // $response['debug'] = $postReq;
    if (isset($postReq, $postReq['project_id'])) {
      $project_id = $postReq['project_id'];
    }

    $file_nids = self::getListofFilesInProject($project_id);
    $variables = [];

    foreach ($file_nids as $file_nid) {
      $variables[$file_nid] = UnigFile::buildFile($file_nid);
    }

    $response->setData($variables);
    return $response;
  }

  public static function getDefaultProjectNid(){
    $nid = 0;

    $config = Unig::getConfig();
    $nid = $config->get();

    return $nid;
  }

  /**
   *
   */
  public function deleteAllFilesInProject($project_id) {
    // Delete all Files.
    $file_nids = self::getListofFilesInProject($project_id);

    foreach ($file_nids as $file_nid) {
      self::deleteFile($file_nid, $project_id);
    }
    return TRUE;
  }


  /**
   * Get uri from all styles.
   *
   * @param $nid
   *
   * @return array
   *
   * @throws \Exception
   */
  public static function getImageVars($nid): array {
    $variables = [];

    $node = Node::load($nid);
    if ($node) {
      $unig_image_id = MolloUtils::getFieldValue($node, 'unig_image');
      if ($unig_image_id) {
        $variables = CreateImageStyles::createStyles(
          $unig_image_id,
          FALSE,
          FALSE
        );
      }
      else {
        \Drupal::messenger()->addError('No Image found');
      }
    }
    return $variables;
  }

  /**
   * @param $nid_project
   *
   * @return int
   */
  public static function countFilesInProject($nid_project): int {
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
   * @param null $album_id
   *
   * @return array
   */
  public static function getListofFilesInProject($nid_project, $album_id = NULL): array {
    // Bundle : unig_file
    // field: field_unig_project[0]['target_id']
    //
    // sorting alphanumeric correctly
    // https://stackoverflow.com/questions/8557172/mysql-order-by-sorting-alphanumeric-correctly
    //
    if ($album_id != NULL) {
      // Alphanumeric.
      $query =
        //
        // Condition
        //
        // Order by.
        \Drupal::entityQuery('node')
          ->condition('type', 'unig_file')
          ->condition('field_unig_project', $nid_project)
          ->condition('field_unig_album', $album_id)
          ->sort('field_unig_weight.value', 'ASC')
          ->sort('title', 'ASC')
          ->sort('created', 'DESC');

      $nids = $query->execute();
    }
    else {
      // Get all unig_file_nodes in Project.
      $query =
        //
        // Condition
        //
        // Order by
        //
        // Access.
        \Drupal::entityQuery('node')
          ->condition('type', 'unig_file')
          ->condition('field_unig_project', $nid_project)
          ->sort('field_unig_weight.value', 'ASC')
          ->accessCheck(FALSE);

      $nids = $query->execute();
    }

    return $nids;
  }

  /**
   * @param $path_destination
   * @param $path_unig
   * @param $path_project
   *
   * @return bool
   */
  public static function checkProjectDir($path_destination, $path_unig, $path_project) {
    $root = \Drupal::service('file_system')->realpath(
      $path_destination . $path_unig
    );
    $realpath_project = $root . '/' . $path_project;

    $is_dir = is_dir($realpath_project);

    if (FALSE == $is_dir) {
      $result = \Drupal::service('file_system')->mkdir(
        $realpath_project,
        0755,
        TRUE
      );

      if (FALSE == $result) {
        \Drupal::messenger()->addMessage(
          'ERROR: Could not create the directory for the gallery'
        );
      }
    }
    else {
      $result = $realpath_project;
    }

    return $result;
  }

  /**
   *
   *
   * @param      $nid_project
   * @param null $nid_image
   *
   * @return \Drupal\unig\Controller\OutputController
   * @throws \Exception
   */
  public static function setCover(
    $nid_project,
    $nid_image = NULL
  ): OutputController {
    $output = new OutputController();

    $node = Node::load($nid_project);
    if(!isset($node) ){
      throw new \Exception('Unig Project not found');
    }
    $title = $node->getTitle();

    if ($nid_image) {
      $nid_cover = $nid_image;
      $node->get('field_unig_project_cover')->target_id = $nid_cover;
    }

    // Load and Save Project.
    try {
      $node->save();
      $cover_tid = $node->get('field_unig_project_cover')->target_id;

      $output->setStatus(TRUE);
      $output->setTitle($title);
      $output->setTid($cover_tid);
      $output->setMessages(
        t('New cover picture set for project ' . $title),
        'success'
      );
    } catch (EntityStorageException $e) {
      $output->setStatus(TRUE);
      $output->setTitle($node->getTitle());
      $output->setTid(0);
      $output->setMessages(
        t('ERROR: cover image adding failed. Project: ' . $title),
        'error'
      );
    }

    return $output;
  }

}