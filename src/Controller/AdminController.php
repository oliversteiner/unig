<?php

  namespace Drupal\unig\Controller;

  use Drupal\Core\Controller\ControllerBase;

  use Drupal\unig\Utility\AdminTemplateTrait;
  use Drupal\unig\Utility\ProjectTrait;
  use Drupal\unig\Utility\FileTrait;

  /**
   * Controller routines for page example routes.
   */
  class AdminController extends ControllerBase {

    use ProjectTrait;
    use FileTrait;
    use AdminTemplateTrait;

    /**
     * {@inheritdoc}
     */
    protected function getModuleName() {
      return 'unig';
    }

    /**
     * @return array
     */
    public function testConfig() {

      // Default settings.
      $config = \Drupal::config('unig.settings');
      // Page title and source text.
      $page_title = $config->get('unig.page_title');
      $source_text = $config->get('unig.source_text');

      return [
        '#markup' => '<p>page_title = ' . $page_title . '</p>' .
          '<p>source_text = ' . $source_text . '</p>',
      ];
    }

    /**
     * @return array
     */
    public function sandboxPage() {

      $nid_project = 43;
    //  $result_1 = ProjectTrait::getListofFilesInProject($nid_project);


      // Test setPrevewImage
      $nid_project = 43;
      $nid_image = NULL;

      $result_2 = ProjectTrait::setPreviewImage($nid_project, $nid_image);
      $result_3 = ProjectTrait::countFilesInProject($nid_project);


      kint($result_2);

      $form['list'] = [
        '#markup' => '<p>Sandbox</p>' .
          '<hr>' .
          '<div class="unig-sandbox"><pre>' .$result_2. '</pre></div>' .
          '<div class="unig-sandbox"><pre>Anzahl Bilder: ' .$result_3. '</pre></div>' .

       //   '<div class="unig-sandbox"><pre>' .$result_1. '</pre></div>' .
          '<hr>',
      ];



      return $form;
    }


  }
