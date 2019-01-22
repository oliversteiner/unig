<?php

namespace Drupal\unig\Utility;

use Drupal\Core\Entity\EntityStorageException;
use Drupal\file\Entity\File;
use Drupal\node\Entity\Node;
use Drupal\unig\Controller\IptcController;
use Drupal\unig\Controller\OutputController;

trait FileTrait
{


    public $bundle_file = 'unig_file';

    // define Extensions to be used als imagefield
    private $ext_image = ['jpg', 'jpeg', 'gif', 'png', 'svg'];

    /**
     * createNodeUniGImage
     *
     * Node Fields:
     *      - field_unig_project: Entity
     *      - field_unig_image : Image
     *
     *  Inputs Plupload:
     *      - tmppath   => string(45)
     * "temporary://o_1bfv2k9af2fdqogn551i9b1uqfc.tmp"
     *      - tmpname   => string(33) "o_1bfv2k9af2fdqogn551i9b1uqfc.tmp"
     *      - name      => string(22) "451415562631785265.jpg"
     *      - status    => string(4) "done"
     *
     * @param $file_tmp
     * @param $project_nid
     *
     * @return int
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
     */
    public function createNodeUniGImage($file_tmp, $project_nid = NULL)
    {

        // define entity type and bundle
        $entity_type = "node";

        // get fid of the temporary uploaded file
        $file_id = $this->getFileId($file_tmp, $project_nid);


        // split the filename: get name and lowercase extension separately
        $file_temp = $file_tmp['name'];
        $file_name = pathinfo($file_temp, PATHINFO_FILENAME);
        $file_ext = strtolower(pathinfo($file_temp, PATHINFO_EXTENSION));


        // Node Title is filename without file extension
        $node_title = $file_name;


        // get definition of target entity type
        $entity_def = \Drupal::EntityTypeManager()->getDefinition($entity_type);


        // load up an array for creation
        $new_node = [
            'title' => $node_title,
            'status' => 0, //(1 or 0): published or not
            'promote' => 0, //(1 or 0): promoted to front page
            $entity_def->get('entity_keys')['bundle'] => $this->bundle_file,
        ];



        // Init new node
        $new_post = \Drupal::EntityTypeManager()
            ->getStorage($entity_type)
            ->create($new_node);

        //

        // Set true for generated Title
        if (!empty($new_post->field_unig_title_generated)) {
            $new_post->field_unig_title_generated->setValue(1);
        }

        if (!empty($new_post->field_unig_project)) {
            $new_post->field_unig_project->setValue([
                'target_id' => $project_nid,
            ]);
        }

        // check file if Image or File:
        if (in_array($file_ext, $this->ext_image)) {

            // if Image save to Imagefield
            if (!empty($new_post->field_unig_image)) {
                $new_post->field_unig_image->setValue([
                    'target_id' => $file_id,
                ]);
            }

            // IPTC
            $iptc = new IptcController($file_id, $project_nid);
            $keywords = $iptc->getKeywordTermIDs();
            $people = $iptc->getPeopleTermIds();

            // Keywords
            if (!empty($keywords)) {
                $value_keywords = [];
                foreach ($keywords as $keyword) {
                    $value_keywords[] = ['target_id' => $keyword];
                }
                $new_post->field_unig_keywords = $value_keywords;
            }

            // People
            if (!empty($people)) {
                $value_people = [];
                foreach ($people as $dude) {
                    $value_people[] = ['target_id' => $dude];
                }
                $new_post->field_unig_people = $value_people;
            }


        } else {

            // if other save for Filefield

        }


        try {
            $new_post->save();

        } catch (EntityStorageException $e) {

        }

        // hole die neu erstellte ID
        $new_id = $new_post->id();
       // $this->createStyle($new_id, 'thumbnail');
       // $this->createStyle($new_id, 'unig_medium');

        return $new_id;
    }


    /**
     * @param $values
     *
     * @return array
     */
    public function createMultiNode($values)
    {

        // Nodes erstellen
        $node_ids = [];
        $file_upload = $values['file_upload'];
        $project_nid = $values['project_nid'];

        foreach ($file_upload as $file_tmp) {
            $node_ids[] = $this->createNodeUniGImage($file_tmp, $project_nid);
        }

        return $node_ids;
    }

    /**
     * @param $nid
     *
     * @return array
     * @internal param $values
     *
     */
    public static function deleteFile($nid)
    {
        $status = FALSE;
        $message = $nid;

        if ($nid) {
            $node = Node::Load($nid);

            // load node
            if ($node) {
                $node->delete();

                // Node delete succses
                $status = TRUE;
                $message = 'Die Datei mit der ID ' . $nid . ' wurde gelöscht';
            } // no Node found
            else {
                $status = FALSE;
                $message = 'kein File mit der ID ' . $nid . ' gefunden';
            }
        }

        // Output
        $output = [
            'status' => $status,
            'message' => $message,
        ];
        return $output;
    }


    /**
     * @param $file_temp
     * @param $project_nid
     *
     * @return int
     */
    public function getFileId($file_temp, $project_nid)
    {

        // Plupload
        // ---------------------------------
        // [tmppath] => 'temporary://o_hash.tmp',
        // [tmpname] => 'o_hash.tmp',
        // [name] => 'filename.jpg',
        // [status] => 'done')

        $tmppath = $file_temp['tmppath'];
        $name = $file_temp['name'];

        $path_prefix_unig = '';
        $path_destination = 'public://';
        $path_unig = 'unig/';

        // If Pathauto is active, take aliasname from project for directory
        $project_alias = \Drupal::service('path.alias_storage')
            ->load(['source' => '/node/' . $project_nid]);

        if ($project_alias) {
            $project_name = $project_nid . '-' . $project_alias . '/';
        } else {
            $project_name = $project_nid . '/';

        }
        $path_album = $path_prefix_unig . $project_name;

        $this->checkProjectDir($path_destination, $path_unig, $path_album);

        $uri_destination = $path_destination . $path_unig . $path_album . $name;

        // Create file object from a locally copied file.
        $uri = file_unmanaged_copy($tmppath, $uri_destination, FILE_EXISTS_REPLACE);
        $file = File::Create([
            'uri' => $uri,
        ]);

        try {
            $file->save();
        } catch (EntityStorageException $e) {
            // TODO
        }

        $file_id = $file->id();
        return $file_id;
    }


    function createStyle($image_uri, $style_name)
    {
         CreateImageStylesTrait::createImageStyles($image_uri, $style_name);
    }




}
