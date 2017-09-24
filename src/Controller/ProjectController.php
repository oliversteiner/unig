<?php

  namespace Drupal\unig\Controller;

  use Drupal\Core\Ajax\AjaxResponse;
  use Drupal\Core\Ajax\InvokeCommand;
  use Drupal\Core\Ajax\ReplaceCommand;
  use Drupal\Core\Controller\ControllerBase;
  use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

  use Drupal\unig\Utility\ProjectListTemplateTrait;
  use Drupal\unig\Utility\ProjectTemplateTrait;
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
    use ProjectTemplateTrait;



    /**
     * @return array
     */
    public function testPage() {
      return [
        '#markup' => '<p>' . $this->t('Test Page') . '</p>',
      ];
    }

    /**
     * @return \Drupal\Core\Ajax\AjaxResponse
     */
    public function ajaxtest($image_nid) {

      dpm('ajaxtest: '.$image_nid);

      $element =  [
        '#markup' => '<p>' . $this->t('Test Page') . '</p>',
      ];


      $response = new AjaxResponse();
      $response->addCommand(new ReplaceCommand('#ajax-container', '<div id="ajax-container">' . $image_nid . '</div>'));
      return $response;

    }


  }
