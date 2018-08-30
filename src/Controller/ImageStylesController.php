<?php
  /**
   * Created by PhpStorm.
   * User: ost
   * Date: 27.08.18
   * Time: 17:03
   */

  namespace Drupal\unig\Controller;


  use Drupal\Core\Ajax\AjaxResponse;
  use Drupal\Core\Ajax\ReplaceCommand;
  use Drupal\Core\Controller\ControllerBase;
  use Drupal\node\Entity\Node;

  class ImageStylesController extends ControllerBase {

    public function start($node_ids) {



      return $this->imageStylesTermplate();
    }

    /**
     * @return array
     */
    public function processingImages($node_ids) {

      sleep(5);


      $arr_nodes_ids = unserialize($node_ids);

      dpm($arr_nodes_ids);
      dpm($node_ids);
      $output = ['test', 'test'];

      $count = count($node_ids);

      /*
            foreach ($node_ids as $node_id) {
              $node = Node::load($node_id);
              $image_uri = $node->field_unig_image->entity->getFileUri();
              $this->createImageStyles($image_uri);

            }*/



      $form['list'] = [
        '#markup' => '<p>+' . $node_ids . '-</p>' .
          '<hr>' .
          //
          $node_ids .
          '<div class="unig-sandbox"><pre>' . $output[0] . '</pre></div>' .
          '<div class="unig-sandbox"><pre>' . $output[1] . '</pre></div>' .
          '<hr>',
      ];

      return $form;
    }


    /**
     * Name of our module.
     *
     * @return string
     *   A module name.
     */
    protected function getModuleName() {
      return 'unig';
    }

    /**
     * Generate a render array with our Admin content.
     *
     * @return array
     *   A render array.
     */
    public function imageStylesTermplate() {
      $template_path = $this->getImageStylesPath();
      $template = file_get_contents($template_path);
      $build = [
        'description' => [
          '#type' => 'inline_template',
          '#template' => $template,
          '#context' => $this->getImageStylesVariables(),
          '#ajax' => [
            'callback' => '::createImageStyles',
            'event' => 'ready',
            'wrapper' => 'image-styles-output',
            'progress' => array(
              'type' => 'throbber',
              'message' => t('Searching Users...'),
            ),
          ],
        ],
      ];


      return $build;
    }


    /**
     * Variables to act as context to the twig template file.
     *
     * @return array
     *   Associative array that defines context for a template.
     */
    protected function getImageStylesVariables() {

      $variables['module'] = $this->getModuleName();

      $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
      $variables['language'] = $language;


      $user = \Drupal::currentUser();
      $variables['user'] = clone $user;
      // Remove password and session IDs, since themes should not need nor see them.
      unset($variables['user']->pass, $variables['user']->sid, $variables['user']->ssid);

      $variables['is_admin'] = $user->hasPermission('access unig admin');
      $variables['show_private'] = $user->hasPermission('access unig admin');
      $variables['logged_in'] = $user->isAuthenticated();


      return $variables;
    }


    /**
     * Get full path to the template.
     *
     * @return string
     *   Path string.
     */
    protected function getImageStylesPath() {
      return drupal_get_path('module', $this->getModuleName()) . "/templates/unig.imagestyles.html.twig";
    }


    function createImageStyles($image_uri) {

      // generate Styles for Images

      $styles = \Drupal::entityTypeManager()
        ->getStorage('image_style')
        ->loadMultiple();


      dpm($image_uri);


      /** @var \Drupal\image\Entity\ImageStyle $style */
      foreach ($styles as $style) {
        $destination = $style->buildUri($image_uri);
        $style->createDerivative($image_uri, $destination);
      }


      $elem = [
        '#type' => 'textfield',
        '#size' => '60',
        '#disabled' => TRUE,
        '#value' => $image_uri,
        '#attributes' => [
          'id' => ['image-styles-output'],
        ],
      ];

      $renderer = \Drupal::service('renderer');
      $response = new AjaxResponse();
      $response->addCommand(new ReplaceCommand('#image-styles-output', $renderer->render($elem)));
      return $response;


    }

  }