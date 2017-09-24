<?php

  namespace Drupal\unig\Controller;

  use Drupal\Core\Controller\ControllerBase;
  use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

  use Drupal\unig\Utility\ProjectListTemplateTrait;
  use Drupal\unig\Utility\ProjectTrait;
  use Drupal\unig\Utility\FileTrait;

  /**
   * Controller routines for page example routes.
   */
  class ProjectController extends ControllerBase {

    /**
     * {@inheritdoc}
     */
    protected function getModuleName() {
      return 'unig';
    }

    use ProjectTrait;
    use FileTrait;
    use ProjectListTemplateTrait;


    /**
     * @return array
     */
    public function listAllProjects() {
      return [
        '#markup' => '<p>listAllProjects</p>',
      ];
    }


    /**
     * @param $project_nid
     *
     * @return array
     */
    public function projectDetail($project_nid) {
      // Make sure you don't trust the URL to be safe! Always check for exploits.
      if (!is_numeric($project_nid)) {
        // We will just show a standard "access denied" page in this case.
        throw new AccessDeniedHttpException();
      }

      return [
        '#markup' => '<p>projectDetail: ' . $project_nid . '</p>',
      ];
    }


    /**
     * @return array
     */
    public function testPage() {
      return [
        '#markup' => '<p>' . $this->t('Test Page') . '</p>',
      ];
    }

  }
