<?php

namespace Drupal\unig\Controller;

use Drupal;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\Core\Url;
use Drupal\file\Entity\File;
use Drupal\taxonomy\Entity\Term;

/**
 * Class IptcController
 * @package Drupal\unig\Controller
 *
 * TODO: Replace German Comments
 */
class IptcController extends ControllerBase
{
  protected $fid = null;
  protected $data = [];
  protected $keywords = [];
  protected $creation_date = null;
  protected $copyright = null;
  protected $peoples = [];
  protected $keywords_without_peoples = [];
  protected $people_tids = [];
  protected $keyword_tids = [];
  protected $project_id = null;

  /**
   * IptcController constructor.
   *
   * @param $fid
   */
  function __construct($fid, $project_id = null)
  {
    // Read File
    $this->fid = $fid;
    $this->project_id = $project_id;
    $this->_readIptcFromFile();
    $this->_splitKeywordsAndPeople();

    // Save Keywords to DB
    $this->savePeopleTerms();
    $this->saveKeywordTerms();
  }

  /**
   * @param $fid
   */
  public function setFid($fid): void
  {
    $this->fid = $fid;
  }

  /**
   * @return array
   */
  public function getIptc(): array
  {
    return $this->data;
  }

  /**
   * @param $data
   *
   * @return bool
   */
  public function setIptc($data): bool
  {
    return $this->_writeIptcToFile();
  }

  /**
   * @return mixed
   */
  public function getKeywords()
  {
    return $this->keywords;
  }

  /**
   * @return mixed
   */
  public function getPeopleNames()
  {
    return $this->peoples;
  }

  /**
   * @return array
   * @throws InvalidPluginDefinitionException
   */
  public function getKeywordTerms(): array
  {
    $terms = $this->keywords_without_peoples;
    $voc = 'unig_keywords';

    return $this->getTerms($terms, $voc);
  }

  /**
   * @return array
   */
  public function getKeywordTermIDs(): array
  {
    return $this->keyword_tids;
  }

  /**
   * @return mixed
   */
  public function getPeopleTermIds()
  {
    return $this->people_tids;
  }

  /**
   * @return mixed
   * @throws InvalidPluginDefinitionException
   */
  public function getPeopleTerms()
  {
    $terms = $this->peoples;
    $voc = 'unig_people';

    return $this->getTerms($terms, $voc);
  }

  /**
   * @param $terms
   * @param $voc
   *
   * @return array
   * @throws InvalidPluginDefinitionException
   */
  public function getTerms($terms, $voc)
  {
    $output = [];

    foreach ($terms as $term) {
      $output[] = $this->_getTidByName($term, $voc);
    }

    return $output;
  }

  public function _splitKeywordsAndPeople(): void
  {
    $peoples = [];
    $keywords_without_peoples = [];

    $keywords = $this->data['keywords'];

    if (is_array($keywords) && count($keywords) > 0) {
      // search for People names in Keywords:
      // pattern:  "aa bb cc"
      $pattern = '/[\D]{2,}[\s]{1}[\D]{2,}[\s]*[[\D]{2,}]*/';

      foreach ($keywords as $keyword) {
        preg_match($pattern, $keyword, $matches);
        if ($matches) {
          $peoples[] = $keyword;
        } else {
          $keywords_without_peoples[] = $keyword;
        }
      }
    }


    $this->keywords = $keywords;
    $this->peoples = $peoples;
    $this->keywords_without_peoples = $keywords_without_peoples;
  }

  private function _readIptcFromFile()
  {
    $info = [];
    $data = [];

    $fid = $this->fid;
    $file = File::load($fid);

    if ($file) {
      $path = Url::fromUri($file->getFileUri())->toUriString();

      // Informationen des Bildes auslesen
      $size = getimagesize($path, $info);

      // IPTC auslesen
      if ($size && $info && isset($info['APP13'])) {
        $iptc = iptcparse($info['APP13']);

        if ($iptc && is_array($iptc)) {
          $data['copyright'] = @$iptc['2#116'][0];

          $data['caption'] = @$iptc['2#120'][0];
          $data['graphic_name'] = @$iptc['2#005'][0];
          $data['urgency'] = @$iptc['2#010'][0];
          $data['category'] = @$iptc['2#015'][0];
          $data['supp_categories'] = @$iptc['2#020'][0];
          $data['spec_instr'] = @$iptc['2#040'][0];
          $data['creation_date'] = @$iptc['2#055'][0];
          $data['photog'] = @$iptc['2#080'][0];
          $data['credit_byline_title'] = @$iptc['2#085'][0];
          $data['city'] = @$iptc['2#090'][0];
          $data['state'] = @$iptc['2#095'][0];
          $data['country'] = @$iptc['2#101'][0];
          $data['otr'] = @$iptc['2#103'][0];
          $data['headline'] = @$iptc['2#105'][0];
          $data['source'] = @$iptc['2#110'][0];
          $data['photo_source'] = @$iptc['2#115'][0];
          $data['caption_writer'] = @$iptc['2#122'][0];
          $data['keywords'] = @$iptc['2#025']; //  array  List of Keywords
        }
      }

      // If you are not sure where a particular value you entered into the IPTC
      // block in photoshop or any other software is being stored,
      // simply run a foreach loop thru the block and find out:
      /*
                foreach($iptc as $key => $value)
                {
                  echo "<b>IPTC Key:</b> $key <b>Contents:</b> ";
                  foreach($value as $innerkey => $innervalue)
                  {
                    if( ($innerkey+1) != count($value) )
                      echo "$innervalue, ";
                    else
                      echo "$innervalue";
                  }
                }*/
    } // End if File
    else {
      $message = t('File does not exist');
      $this->messenger->addMessage($message, 'error');
    }

    $this->data = $data;

    if (isset($data['keywords'])) {
      $this->keywords = $data['keywords'];
    }

    if (isset($data['creation_date'])) {
      $this->creation_date = $data['creation_date'];
    }

    if (isset($data['copyright'])) {
      $this->copyright = $data['copyright'];
    }
    return $data;
  }

  /**
   * @return null
   */
  public function getFid()
  {
    return $this->fid;
  }

  /**
   * @return bool
   *
   * TODO Implement function
   */
  private function _writeIptcToFile(): bool
  {
    return false;
  }

  /**
   * @return null
   */
  public function getCopyright()
  {
    return $this->copyright;
  }

  /**
   * @param $vid
   * @return array
   * @throws PluginNotFoundException
   */
  public function loadVocabulary($vid): array
  {
    $term_data = [];
    try {
      $terms = Drupal::entityTypeManager()
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

    return $term_data;
  }

  /**
   * @return array
   */
  public function savePeopleTerms(): array
  {
    $vid = 'unig_people';
    $terms = $this->peoples;
    $tids = $this->saveTerms($vid, $terms, $this->project_id);
    $this->people_tids = $tids;
    return $tids;
  }

  /**
   * @return array
   */
  public function saveKeywordTerms(): array
  {
    $vid = 'unig_keywords';
    $terms = $this->keywords_without_peoples;
    $tids = $this->saveTerms($vid, $terms, $this->project_id);
    $this->keyword_tids = $tids;
    return $tids;
  }

  /**
   * @param $vid
   * @param $new_terms
   *
   * @return array // all term ids from File
   * @throws EntityStorageException
   */
  public function saveTerms($vid, $new_terms): array
  {

    // TODO: Add Project nid

    $project_id = $this->project_id;
    $file_keyword_tids = [];

    // if there is new terms
    foreach ($new_terms as $new_term) {


      if ($terms = taxonomy_term_load_multiple_by_name((string)$new_term, $vid)) {
        // Only use the first term returned; there should only be one anyways if we do this right.
        $term = reset($terms);
      } else {
        $term = Term::create([
          'name' => $new_term,
          'vid' => $vid,
        ]);
        $term->save();

        Drupal::logger('unig')->info(
          'new ' . $vid . ': ' . $new_term
        );

      }
      $tid = $term->id();
      $file_keyword_tids[] = $tid;
    }


    return $file_keyword_tids;
  }

  /**
   * Utility: find term by name and vid.
   *
   * @param null $name
   *  Term name
   * @param null $vid
   *  Term vid
   *
   * @return int
   *  Term id or 0 if none.
   * @throws InvalidPluginDefinitionException
   * @throws PluginNotFoundException
   */
  private function _getTidByName($name = null, $vid = null): int
  {
    $properties = [];
    if (!empty($name)) {
      $properties['name'] = $name;
    }
    if (!empty($vid)) {
      $properties['vid'] = $vid;
    }
    $terms = Drupal::entityTypeManager()
      ->getStorage('taxonomy_term')
      ->loadByProperties($properties);
    $term = reset($terms);

    return !empty($term) ? $term->id() : 0;
  }
}
