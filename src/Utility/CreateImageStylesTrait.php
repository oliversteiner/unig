<?php

namespace Drupal\unig\Utility;

use Drupal;
use Drupal\Core\Image\Image;
use Drupal\file\Entity\File;
use Drupal\file\FileInterface;
use Drupal\image\Entity\ImageStyle;
use Drupal\node\Entity\Node;
use Exception;
use Thread;

trait CreateImageStylesTrait
{

  /**
   * @param $img_id_or_file
   * @param bool $style_name
   * @param bool $dont_create
   * @return array|mixed
   * @throws Exception
   */
  public static function createImageStyles($img_id_or_file, $style_name = false, $dont_create = false)
  {
    $images = [];
    $file = null;


    // Input is File
    if ($img_id_or_file instanceof FileInterface) {
      $file = $img_id_or_file;
    }

    // Input is ID
    if (is_string($img_id_or_file) || is_int($img_id_or_file)) {

      $unig_file_node = Node::load($img_id_or_file);

      // is ID UniG File ?
      if ($unig_file_node && $unig_file_node->bundle() === 'unig_file') {

        $file_id = Helper::getFieldValue($unig_file_node, 'unig_image');
        $file = File::load($file_id);
      }
    }


    if ($file && $file instanceof FileInterface) {

      if (!$style_name) {

        $image_styles = ImageStyle::loadMultiple();


        foreach ($image_styles as $image_style) {
          $image_style_id = $image_style->id();
          $images[$image_style_id] = self::createImageStyle($file, $image_style, $dont_create);
        }
        $images['original'] = self::getOriginalVars($file);

      } elseif ($style_name === 'original') {
        $images = self::getOriginalVars($file);

      } else {
        $image_style = ImageStyle::load($style_name);
        if ($image_style) {
          $images = self::createImageStyle($file, $image_style, $dont_create);
        }
      }
    }
    return $images;
  }

  /**
   * @param FileInterface $file
   * @param ImageStyle $image_style
   * @param bool $dont_create
   * @return array|Image
   */
  public static function createImageStyle(FileInterface $file, ImageStyle $image_style, bool $dont_create = false)
  {
    $image = [];


    if ($file && $file instanceof FileInterface) {
      $file_image = Drupal::service('image.factory')->get($file->getFileUri());
      if ($file_image->isValid()) {


        $image_uri = $file->getFileUri();
        $destination = $image_style->buildUrl($image_uri);
        $derivative_uri = $image_style->buildUri($image_uri);
        $image_style_name = $image_style->label();

        if (!file_exists($derivative_uri)) {
           dpm('File dont Exist,  $dont_create:' . $dont_create);
          if (!$dont_create) {
            dpm('Create: "' . $image_style_name . '" ' . $derivative_uri);
            if (!empty($image_style)) {

              $original_uri = $image_uri;
              $result = $image_style->createDerivative($original_uri, $derivative_uri);
              if (!$result) {
                dpm('Creation FAILD.');
              }
            }
          }
        }

        $file_size = filesize($image_uri);
        $file_size_formatted = format_size($file_size);
        [$width, $height] = getimagesize($image_uri);

        $image['url'] = $destination;
        $image['uri'] = $image_uri;
        $image['file_size'] = $file_size;
        $image['file_size_formatted'] = $file_size_formatted;
        $image['width'] = $width;
        $image['height'] = $height;
      } else {
        dpm('- is NOT Valid: $dont_create:' . $dont_create);


      }
    }
    return $image;
  }

  static function getOriginalVars($img_id_or_file)
  {
    $original = [];

    if ($img_id_or_file && $img_id_or_file instanceof FileInterface) {
      $file = $img_id_or_file;

    } else {
      $file = File::load($img_id_or_file);
    }

    if ($file && $file instanceof FileInterface) {
      $image = Drupal::service('image.factory')->get($file->getFileUri());
      /** @var Image $image */
      if ($image->isValid()) {

        $image_uri = $file->getFileUri();
        $file_name = $file->getFilename();

        $file_size = filesize($image_uri);
        $file_size_formatted = format_size($file_size);
        list($width, $height) = getimagesize($image_uri);

        $original['url'] = file_create_url($image_uri);
        $original['uri'] = $image_uri;
        $original['name'] = $file_name;
        $original['file_size'] = $file_size;
        $original['file_size_formatted'] = $file_size_formatted;
        $original['width'] = $width;
        $original['height'] = $height;
      }

    }
    return $original;
  }
}


