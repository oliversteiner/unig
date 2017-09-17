<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

use Drupal\unig\Utility\AdminTemplateTrait;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\FileTrait;

/**
 * Controller routines for page example routes.
 */
class ProjectController extends ControllerBase
{
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
    public function listAllProjects()
    {
        return array(
            '#markup' => '<p>listAllProjects</p>',
        );
    }


    /**
     * @param $project_nid
     * @return array
     */
    public function projectDetail($project_nid)
    {
        // Make sure you don't trust the URL to be safe! Always check for exploits.
        if (!is_numeric($project_nid) ) {
            // We will just show a standard "access denied" page in this case.
            throw new AccessDeniedHttpException();
        }

        return array(
            '#markup' => '<p>projectDetail: '.$project_nid.'</p>',
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
