<?php

namespace Drupal\unig\Utility;

use Drupal;
use Drupal\Core\Image\Image;
use Drupal\file\Entity\File;
use Drupal\file\FileInterface;
use Drupal\image\Entity\ImageStyle;

trait CreateImageStylesTrait
{
  /**
   * @param $img_id_or_file
   * @param bool $style_name
   * @param bool $create
   * @return array|mixed
   */
  public static function createImageStyles(
    $img_id_or_file,
    $style_name = false,
    $create = true
  )
  {
    $images = [];

    if ($img_id_or_file && $img_id_or_file instanceof FileInterface) {
      $file = $img_id_or_file;
    } else {
      $file = File::load($img_id_or_file);
    }

    if (!$style_name) {
      $image_styles = ImageStyle::loadMultiple();

      foreach ($image_styles as $image_style) {
        $image_style_id = $image_style->id();
        $images[$image_style_id] = self::createImageStyle(
          $file,
          $image_style,
          $create
        );
      }
      $images['original'] = self::getOriginalVars($file);
    } elseif ($style_name === 'original') {
      $images = self::getOriginalVars($file);
    } else {
      $image_style = ImageStyle::load($style_name);
      if ($image_style) {
        $images = self::createImageStyle($file, $image_style, $create);
      } else {
        $images = false;
      }
    }

    return $images;
  }

  /**
   * @param $img_id_or_file
   * @param ImageStyle $image_style
   * @param bool $create
   * @return array|Image
   */
  public static function createImageStyle(
    $img_id_or_file,
    ImageStyle $image_style,
    $create = true
  )
  {
    $image = [];

    if ($img_id_or_file && $img_id_or_file instanceof FileInterface) {
      $file = $img_id_or_file;
    } else {
      $file = File::load($img_id_or_file);
    }

    if ($file) {

      $file_image = Drupal::service('image.factory')->get($file->getFileUri());
      /** @var Image $image */
      if ($file_image->isValid()) {

        $file_size = 0;
        $width = 0;
        $height = 0;
        $file_size_formatted = 0;

        $image_uri = $file->getFileUri();
        $image_style_uri = $image_style->buildUri($image_uri);

        if ($create && !file_exists($image_style_uri)) {
          $image_style->createDerivative($image_uri, $image_style_uri);
        }
        $url = $image_style->buildUrl($image_style_uri);
        $image_style_path = Drupal::service('file_system')->realpath($image_style_uri);


        if ($image_style_path) {
          $file_size = filesize($image_style_path);
          $file_size_formatted = format_size($file_size);
          [$width, $height] = getimagesize($image_style_path);
        }

        $image['url'] = $url;
        $image['uri'] = $image_uri;
        $image['image_style_uri'] = $image_style_uri;
        $image['file_size'] = $file_size;
        $image['file_size_formatted'] = $file_size_formatted;
        $image['width'] = $width;
        $image['height'] = $height;
      }
    }
    return $image;
  }

  /**
   * @param $img_id_or_file
   * @return array
   */
  public static function getOriginalVars($img_id_or_file): array
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
        [$width, $height] = getimagesize($image_uri);

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
