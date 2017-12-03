<?php


  namespace Drupal\unig\Controller;


  use Drupal\Core\Controller\ControllerBase;
  use Drupal\Core\Url;
  use Drupal\file\Entity\File;

  class IptcController extends ControllerBase {

    protected $fid = NULL;

    protected $data = [];

    protected $data_keywords = [];

    protected $data_people_names = [];

    protected $data_keywords_without_peoples = [];


    /**
     * IptcController constructor.
     *
     * @param $fid
     */
    function __construct($fid) {
      $this->fid = $fid;
      $this->_readIptcFromFile();
      $this->_splitKeywordsAndPeople();
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


    function getkeywordsWithoutPeople() {

      return $this->data_keywords_without_peoples;

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

  }