<?php

namespace Drupal\unig\Utility;

/**
 *
 * @see \Drupal\Core\Render\Element\InlineTemplate
 * @see https://www.drupal.org/developing/api/8/localization
 */
trait UniGTrait {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    $default_config = \Drupal::config('unig.settings');
    $config = [
      'page_title' => $default_config->get('unig.page_title'),
      'default_project' => $default_config->get('unig.default_project'),
      'file_validate_extensions' => $default_config->get('unig.plupload.file_validate_extensions'),
    ];

    return $config;
  }

  /**
   * @param $str
   * @param array $replace
   * @param string $delimiter
   *
   * @return bool|mixed|string
   *
   * http://cubiq.org/the-perfect-php-clean-url-generator
   */
 static public function toAscii($str, $replace = [], $delimiter = '-') {
    if (!empty($replace)) {
      $str = str_replace((array) $replace, ' ', $str);
    }

    $clean = iconv('UTF-8', 'ASCII//TRANSLIT', $str);
    $clean = preg_replace("/[^a-zA-Z0-9/_|+ -]/", '', $clean);
    $clean = strtolower(trim($clean, '-'));
    $clean = preg_replace("/[/_|+ -]+/", $delimiter, $clean);

    return $clean;
  }


}
