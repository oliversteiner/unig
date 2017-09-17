<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;

use Drupal\unig\Utility\AdminTemplateTrait;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\FileTrait;

/**
 * Controller routines for page example routes.
 */
class AdminController extends ControllerBase
{

    use ProjectTrait;
    use FileTrait;
    use AdminTemplateTrait;

    /**
     * {@inheritdoc}
     */
    protected function getModuleName()
    {
        return 'unig';
    }

    /**
     * @return array
     */
    public function testConfig()
    {

        // Default settings.
        $config = \Drupal::config('unig.settings');
        // Page title and source text.
        $page_title = $config->get('unig.page_title');
        $source_text = $config->get('unig.source_text');

        return array(
            '#markup' => '<p>page_title = ' . $page_title . '</p>'.
                '<p>source_text = ' . $source_text . '</p>',
        );
    }

    /**
     * @return array
     */
    public function testPage()
    {
        return array(
            '#markup' => '<p>' . $this->t('Test Page') . '</p>',
        );
    }


}
