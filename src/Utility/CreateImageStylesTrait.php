<?php

namespace Drupal\unig\Utility;

trait CreateImageStylesTrait
{

    public static function createImageStyles($image_uri, $style_name = false)
    {


        if (!$style_name) {

            $all_styles_url = [];
            // generate all Styles
            $styles = \Drupal::entityTypeManager()
                ->getStorage('image_style')
                ->loadMultiple();

            /** @var \Drupal\image\Entity\ImageStyle $style_name */
            foreach ($styles as $style) {
                $destination = $style->buildUri($image_uri);
                $style_name = $style->id();
                if (!file_exists($destination)) {
                    $style->createDerivative($image_uri, $destination);
                }
                $url = $style->buildUrl($image_uri);

                $all_styles_url[$style_name] = $url;
            }

            return $all_styles_url;

        } else {

            // generate specific Style
            $styles = \Drupal::entityTypeManager()
                ->getStorage('image_style')
                ->load($style_name);
            $destination = $styles->buildUri($image_uri);

            if (!file_exists($destination)) {
                $styles->createDerivative($image_uri, $destination);
            }
            $url[$style_name] = $styles->buildUrl($image_uri);


            return $url;
        }


    }
}