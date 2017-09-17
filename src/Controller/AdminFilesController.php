<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;

use Drupal\unig\Utility\AdminFilesTemplateTrait;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\FileTrait;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;


/**
 * Controller routines for page example routes.
 */
class AdminFilesController extends ControllerBase
{

   // use AdminFilesTemplateTrait;
    use ProjectTrait;
    use FileTrait;

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


    /**
     * @return array
     */
    public function testPageArguments($first)
    {
        return array(
            '#markup' => '<p>' . $this->t('Test Page Arguments-') .$first. '</p>',
        );
    }

    public function twigTest()
    {
        return [
            '#theme' => 'unig_admin_files',
            '#test_var' => $this->t('twig Test function'),
        ];    }


    public function contentTest() {

        return [
            '#theme' => 'unig_admin_files',
            '#test_var' => $this->t('Twig Test content'),
        ];

    }


    public function arguments($first, $second) {
        // Make sure you don't trust the URL to be safe! Always check for exploits.


        $list[] = $this->t("First number was @number.", array('@number' => $first));
        $list[] = $this->t("Second number was @number.", array('@number' => $second));
        $list[] = $this->t('The total was @number.', array('@number' => $first + $second));

        $render_array['unig_admin_files_arguments'] = array(
            // The theme function to apply to the #items.
            '#theme' => 'item_list',
            // The list itself.
            '#items' => $list,
            '#title' => $this->t('Argument Information'),
        );
        return $render_array;
    }



}
