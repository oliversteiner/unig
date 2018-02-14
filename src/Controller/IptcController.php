<?php


  namespace Drupal\unig\Controller;


  use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
  use Drupal\Core\Controller\ControllerBase;
  use Drupal\Core\Url;
  use Drupal\file\Entity\File;
  use Drupal\taxonomy\Entity\Term;

  class IptcController extends ControllerBase {

    protected $fid = NULL;

    protected $data = [];

    protected $data_keywords = [];

    protected $data_creation_date = NULL;


    protected $data_copyright = NULL;

    protected $data_people_names = [];

    protected $data_keywords_without_peoples = [];

    protected $people_tids = [];

    protected $keyword_tids = [];

    protected $project_nid = NULL;

    /**
     * IptcController constructor.
     *
     * @param $fid
     */
    function __construct($fid, $project_nid = NULL) {

      dpm($project_nid);

      // Read File
      $this->fid = $fid;
      $this->project_nid = $project_nid;
      $this->_readIptcFromFile();
      $this->_splitKeywordsAndPeople();

      // Save Keywords to DB
      $this->savePeopleTerms();
      $this->saveKeywordTerms();

      return $fid;
    }

    /**
     * @param $fid
     */
    public function setFid($fid) {
      $this->fid = $fid;
    }


    /**
     * @return array
     */
    function getIptc() {
      $data = $this->data;

      return $data;
    }


    /**
     * @param $data
     *
     * @return bool
     */
    function setIptc($data) {
      return $this->_writeIptcToFile();
    }

    /**
     * @return mixed
     */
    function getKeywords() {

      return $this->data_keywords;

    }


    /**
     * @return array
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     */
    function getKeywordTerms() {

      $terms = $this->data_keywords_without_peoples;
      $voc = 'unig_keywords';

      return $this->getTerms($terms, $voc);

    }

    /**
     * @return array
     */
    function getKeywordTermIDs() {


      return $this->keyword_tids;

    }

    /**
     * @return mixed
     */
    function getPeopleTermIds() {

      return $this->people_tids;
    }

    /**
     * @return mixed
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     */
    function getPeopleTerms() {

      $terms = $this->data_people_names;
      $voc = 'unig_people';

      return $this->getTerms($terms, $voc);
    }


    /**
     * @param $terms
     * @param $voc
     *
     * @return array
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     */
    function getTerms($terms, $voc) {


      $output = [];

      foreach ($terms as $term) {
        $output[] = $this->_getTidByName($term, $voc);
      }

      return $output;
    }


    function _splitKeywordsAndPeople() {


      $peoples = [];
      $keywords_without_peoples = [];

      $keywords = $this->data['keywords'];


      // search for People names in Keywords:
      // pattern:  "aa bb cc"
      $pattern = '/[\D]{2,}[\s]{1}[\D]{2,}[\s]*[[\D]{2,}]*/';


      foreach ($keywords as $keyword) {
        if (preg_match($pattern, $keyword)) {

          $peoples[] = $keyword;
        }
        else {

          $keywords_without_peoples[] = $keyword;
        }

      }
      $this->data_keywords = $keywords;
      $this->data_people_names = $peoples;
      $this->data_keywords_without_peoples = $keywords_without_peoples;
    }


    function getPeopleNames() {

      return $this->data_people_names;
    }


    private function _readIptcFromFile() {
      $info = [];
      $data = [];

      $fid = $this->fid;
      $file = File::load($fid);

      if ($file) {
        $path = Url::fromUri($file->getFileUri())->toUriString();

        // Informationen des Bildes auslesen
        $size = getimagesize($path, $info);

        // IPTC auslesen
        $iptc = iptcparse($info['APP13']);


        if (is_array($iptc)) {
          $data['copyright'] = $iptc["2#116"][0];

          $data['caption'] = $iptc["2#120"][0];
          $data['graphic_name'] = $iptc["2#005"][0];
          $data['urgency'] = $iptc["2#010"][0];
          $data['category'] = $iptc["2#015"][0];
          $data['supp_categories'] = $iptc["2#020"][0];
          $data['spec_instr'] = $iptc["2#040"][0];
          $data['creation_date'] = $iptc["2#055"][0];
          $data['photog'] = $iptc["2#080"][0];
          $data['credit_byline_title'] = $iptc["2#085"][0];
          $data['city'] = $iptc["2#090"][0];
          $data['state'] = $iptc["2#095"][0];
          $data['country'] = $iptc["2#101"][0];
          $data['otr'] = $iptc["2#103"][0];
          $data['headline'] = $iptc["2#105"][0];
          $data['source'] = $iptc["2#110"][0];
          $data['photo_source'] = $iptc["2#115"][0];
          $data['caption_writer'] = $iptc["2#122"][0];
          $data['keywords'] = $iptc["2#025"];  //  array  List of Keywords
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
        drupal_set_message($message, 'error');
      }

      $this->data = $data;


      $this->data_keywords = $data['keywords'];
      $this->data_creation_date = $data['creation_date'];
      $this->data_copyright = $data['copyright'];

      return $data;
    }

    /**
     * @return null
     */
    public function getFid() {
      return $this->fid;
    }

    private function _writeIptcToFile() {
      $output = FALSE;


      return $output;
    }

    /**
     * @return array
     */
    public function getDataKeywords() {
      return $this->data_keywords;
    }

    /**
     * @return null
     */
    public function getDataCopyright() {
      return $this->data_copyright;
    }


    function loadVocabulary($vid) {
      $term_data = [];
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

      return $term_data;
    }

    function savePeopleTerms() {

      $vid = 'unig_people';
      $terms = $this->data_people_names;
      $tids = $this->saveTerms($vid, $terms, $this->project_nid);
      $this->people_tids = $tids;
      return $tids;
    }

    function saveKeywordTerms() {

      $vid = 'unig_keywords';
      $terms = $this->data_keywords_without_peoples;
      $tids = $this->saveTerms($vid, $terms, $this->project_nid);
      $this->keyword_tids = $tids;
      return $tids;

    }


    /**
     * @param $vid
     * @param $new_terms
     *
     * @return array // all term ids from File
     */
    function saveTerms($vid, $new_terms) {

      $project_nid = $this->project_nid;
      $file_keyword_tids = [];
      dpm($new_terms, 'Terms from File - '.$vid);

      $voc = $this->loadVocabulary($vid);

      $terms_in_voc = [];

      // reduce Voc to names
      foreach ($voc as $index => $term) {
        $terms_in_voc[] = $term['name'];
      }


      // if there is new terms
      foreach ($new_terms as $new_term) {

        if (in_array($new_term, $terms_in_voc)) {

          $position = array_search($new_term, $terms_in_voc);
          $tid = $voc[$position]['id'];
          $file_keyword_tids[] = $tid;

          // load item and search for project id

          // if project id not there add new one

          $term = Term::load($tid);

          dpm($term, 'term found an loaded - '.$project_nid);

          // $new_item = ['target_id' => $project_nid];
          $term->field_projects[] = $project_nid;
          $term->save();

        }
        else {
          if (!empty($new_term)) {

            $new_item = ['target_id' => $project_nid];


            // Add new Terms to Voc
            $term_created = NULL;
            $term_created = Term::create([
              'name' => $new_term,
              'vid' => $vid,
              'field_projects' => $new_item,
            ])->save();

            drupal_set_message('new ' . $vid . ': ' . $new_term, TRUE);

            // Add new term to output
            $tid = $term_created->tid->value;
            $file_keyword_tids[] = $tid;
          }
        }
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
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     */
    protected function _getTidByName($name = NULL, $vid = NULL) {
      $properties = [];
      if (!empty($name)) {
        $properties['name'] = $name;
      }
      if (!empty($vid)) {
        $properties['vid'] = $vid;
      }
      $terms = \Drupal::entityTypeManager()
        ->getStorage('taxonomy_term')
        ->loadByProperties($properties);
      $term = reset($terms);

      return !empty($term) ? $term->id() : 0;
    }

  }