<?php

namespace Drupal\unig\Utility;

use Drupal\file\Entity\File;
use Drupal\file\FileInterface;
use Drupal\image\Entity\ImageStyle;

trait CreateImageStylesTrait
{

    /**
     * @param $img_id
     * @param bool $style_name
     * @return array|mixed
     */
    public static function createImageStyles($img_id, $style_name = false)
    {
        $variables = [];

        if (!$style_name) {

            $image_styles = ImageStyle::loadMultiple();

            foreach ($image_styles as $image_style) {
                $image_style_id = $image_style->id();
                $variables[$image_style_id] = self::createImageStyle($img_id, $image_style);

            }

        } else {
            $image_style = ImageStyle::load($style_name);
            $variables = self::createImageStyle($img_id, $image_style);
        }

        return $variables;
    }

    static function createImageStyle($img_id, ImageStyle $image_style)
    {
        $variables = [];
        $file = File::load($img_id);

        if ($file && $file instanceof FileInterface) {
            $image = \Drupal::service('image.factory')->get($file->getFileUri());
            /** @var \Drupal\Core\Image\Image $image */
            if ($image->isValid()) {

                $image_style_id = $image_style->id();

                $image_uri = $file->getFileUri();
                $destination = $image_style->buildUrl($image_uri);


                if (!file_exists($destination)) {

                    $image_style->createDerivative($image_uri, $destination);
                }

                $filesize = filesize($image_uri);
                $filesize_formated = format_size($filesize);
                list($width, $height) = getimagesize($image_uri);

                $variables[$image_style_id]['url'] = $destination;
                $variables[$image_style_id]['uri'] = $image_uri;
                $variables[$image_style_id]['filesize'] = $filesize;
                $variables[$image_style_id]['filesize_formated'] = $filesize_formated;
                $variables[$image_style_id]['width'] = $width;
                $variables[$image_style_id]['height'] = $height;
            }
        }
        return $variables;
    }
}