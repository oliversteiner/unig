<?php

/*
 *  Do not use this Class. Use MolloUtils instead.
 *
 * */

namespace Drupal\unig\Utility;

use Drupal\Core\Config\ImmutableConfig;
use Drupal\mollo_utils\Utility\MolloUtils;

/**
 *
 */
class Unig {

  /**
   *
   */
  public static function getModulPath(): string {

    return \Drupal::service('extension.list.module')->getPath('unig');
  }

  /**
   *
   */
  public static function getTemplatePath(): string {
    return \Drupal::service('extension.list.module')->getPath('unig') .
      '/templates/';
  }

  /**
   *
   */
  public static function getModulName(): string {
    return 'unig';
  }

  /**
   *
   */
  public static function getConfig(): ImmutableConfig {
    return \Drupal::config('unig.settings');
  }

  /**
   *
   */
  public static function getDefaultProjectNid() {

    return \Drupal::config('unig.settings')->get('unig.default_project');
  }

  /**
   *
   */
  public static function getDefaultProjectName() {

    $nid = \Drupal::config('unig.settings')->get('unig.default_project');
    return MolloUtils::getTitleFromNodeID($nid);
  }

  /**
   *
   */
  public static function getDefaultCategory() {

    return \Drupal::config('unig.settings')->get('unig.default_category');
  }

  /**
   *
   */
  public static function getAllowedExtensions() {

    return \Drupal::config('unig.settings')->get('unig.file_validate_extensions');
  }

  /**
   *
   */
  public static function useDarkMode() {

    return \Drupal::config('unig.settings')->get('unig.dark_mode');
  }

  /**
   *
   */
  public static function getPageTitle() {

    return \Drupal::config('unig.settings')->get('unig.page_title');
  }

  /**
   *
   */
  public static function getConfigAsArray(): array {
    return [
      'page_title' => self::getPageTitle(),
      'default_project' => self::getDefaultProjectNid(),
      'file_validate_extensions' => self::getAllowedExtensions(),
      'dark_mode' => self::useDarkMode(),
    ];
  }

}
