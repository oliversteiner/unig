<?php

namespace Drupal\unig\Utility;

use DateTime;
use DateTimeImmutable;
use Drupal\mollo_utils\Utility\MolloUtils;
use Drupal\unig\Models\UnigFile;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\unig\Models\UnigProject;

/**
 *
 */
class Project {

  use ProjectTrait;
  use FileTrait;

  /**
   * Get uri from all styles from Cover image.
   *
   * @param $nid
   *
   * @return array
   *
   * @throws \Exception
   */
  public static function getCoverImageVars($nid): array {
    $variables = [];
    if ($nid) {
      $node = Node::load((int) $nid);
      if ($node) {
        $unig_image_id = MolloUtils::getFieldValue($node, 'unig_image');
        $variables = CreateImageStyles::createStyles(
          $unig_image_id,
          FALSE,
          FALSE
        );
      }
    }
    return $variables;
  }

  /**
   *
   */
  public function buildProjectList($cat_id = NULL): array {
    $nids = self::getAllProjectNids($cat_id);
    $variables = [];

    if ($nids) {
      foreach ($nids as $project_id) {
        try {
          $variables[] = $this->buildProject($project_id);
        }
        catch (\Exception $e) {
        }
      }
    }

    return $variables;
  }

  /**
   * @param $project_id
   *
   * @return array
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Exception
   */
  public function buildProject($project_id): array {
    // project
    //  - nid  id
    //  - date
    //  - timestamp
    //  - year
    //  - title.
    // - weight (draggable)
    //   - number_of_items
    //  - album
    //    - title
    //      - number_of_items
    //  - links
    //    - edit
    //    - delete
    //  - cover_id
    //  - cover_image
    //
    // Load Project.
    $node = Node::load((int) $project_id);

    // Check if Nid is Unig Project.
    if ($node && $node->bundle() !== 'unig_project') {
      $message = 'Node with ' . $project_id . ' is not an UniG-Project';
      \Drupal::logger('type')->error($message);
      return ['nid' => 0];
    }

    // No Project with this Nid.
    /** @var TYPE_NAME $node */
    if (!$node) {
      return ['nid' => 0];
    }

    // Title.
    $title = $node->label();

    // Body.
    $description = MolloUtils::getFieldValue($node, UnigProject::field_description);

    // Weight.
    $weight = MolloUtils::getFieldValue($node, UnigProject::field_weight);

    // Copyright.
    $copyright = MolloUtils::getFieldValue($node, UnigProject::field_copyright);

    // Private.
    $private = MolloUtils::getFieldValue($node, UnigProject::field_private);

    // Category.
    $category = MolloUtils::getFieldValue(
      $node,
      UnigProject::field_category,
      UnigProject::term_category
    );
    $category_id = MolloUtils::getFieldValue($node, UnigProject::field_category);
    $category_list = MolloUtils::getListOfTerms(UnigProject::term_category);

    // Tags.
    $tags = MolloUtils::getFieldValue(
      $node,
      UnigProject::field_tags,
      UnigProject::term_tags,
      TRUE
    );
    $tags_ids = MolloUtils::getFieldValue(
      $node,
      UnigProject::field_tags,
      FALSE,
      TRUE
    );
    $tags_list = MolloUtils::getListOfTerms(UnigProject::term_tags);

    // Help.
    $help = MolloUtils::getFieldValue($node, UnigProject::field_help);

    // Date.
    $date = MolloUtils::getFieldValue($node, UnigProject::field_date);
    if ($date) {
      $php_date_obj = new DateTime();
      $php_date_obj->setTimestamp($date);
    }
    else {
      $php_date_obj = new DateTimeImmutable('now');
    }
    $timestamp = $php_date_obj->format('U');

    // Year.
    $year = $php_date_obj->format('Y');

    // Date.
    $date = $php_date_obj->format('d. F Y');

    // Date short.
    $date_short = $php_date_obj->format('d. M Y');

    // Date.
    // @todo move date display format to settings page.
    $date_drupal = $php_date_obj->format('Y-m-d');

    // Cover Image.
    $cover_id = MolloUtils::getFieldValue($node, UnigProject::field_project_cover);

    if (!$cover_id) {
      $new_cover = self::setCover($project_id);
      $cover_id = $new_cover->getTid();
    }
    $cover_image = self::getCoverImageVars((int) $cover_id);

    // number_of_items.
    $number_of_items = self::countFilesInProject($project_id);

    // Album List.
    $album_list = Album::getAlbumList($project_id);

    // Url friendly title
    // Always replace whitespace with the separator.
    if (\Drupal::hasService('pathauto.alias_cleaner')) {
      $clean_string = \Drupal::service('pathauto.alias_cleaner')->cleanString(
        $title
      );
    }
    else {
      $clean_string = preg_replace('/\s+/', '_', $title);
    }

    // Host.
    $host = \Drupal::request()->getHost();

    // URL.
    $url = Url::fromRoute('unig.project.public', [
      'project_id' => $project_id,
    ]);

    // Generate User Items.
    $_user = \Drupal::currentUser();
    $user['logged_in'] = $_user->isAuthenticated();
    $user['is_admin'] = $_user->hasPermission('access unig admin');
    $user['can_download'] = $_user->hasPermission('access unig download');
    $user['show_private'] = $_user->hasPermission('access private project');

    // Twig-Variables
    // --------------------------------------------.
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
      'user' => $user,
      // Can be used with Twig filter | format_date('DRUPAL_DATE')
      'timestamp' => $timestamp,
      'date' => $date,
      'date_short' => $date_short,
      'date_drupal' => $date_drupal,
      'year' => $year,
      'number_of_items' => $number_of_items,
      'cover_id' => $cover_id,
      'cover_image' => $cover_image,
      'album_list' => $album_list,
      'host' => $host,
      'url' => $url,
      'help' => $help,
    ];

    return $project;
  }

  /**
   * @param      $project_id
   * @param null $album_id
   *
   * @return array
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   */
  public function buildFileList($project_id, $album_id = NULL): array {
    $file_nids = self::getListofFilesInProject($project_id, $album_id);
    $variables = [];

    foreach ($file_nids as $file_nid) {
      $variables[] = UnigFile::buildFile($file_nid);
    }

    return $variables;
  }

}
