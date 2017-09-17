<?php

namespace Drupal\unig\Utility;

/**
 *
 * @see \Drupal\Core\Render\Element\InlineTemplate
 * @see https://www.drupal.org/developing/api/8/localization
 */
trait UniGTrait
{
    /**
     * {@inheritdoc}
     */
    public function defaultConfiguration() {
        $default_config = \Drupal::config('unig.settings');
        $config =  array(
            'page_title' => $default_config->get('unig.page_title'),
            'default_project' => $default_config->get('unig.default_project'),
            'file_validate_extensions' => $default_config->get('unig.plupload.file_validate_extensions'),
        );

        return $config;
    }


}
