<?php

  namespace Drupal\unig\Utility;

  /**
   *
   * @see \Drupal\Core\Render\Element\InlineTemplate
   * @see https://www.drupal.org/developing/api/8/localization
   */
  trait projectListTemplateTrait {



    /**
     * Name of our module.
     *
     * @return string
     *   A module name.
     */
    abstract protected function getModuleName();

    /**
     * Generate a render array with our Admin content.
     *
     * @return array
     *   A render array.
     */
    public function projectListTemplate() {
      $template_path = $this->getProjectListPath();
      $template = file_get_contents($template_path);
      $build = [
        'description' => [
          '#type' => 'inline_template',
          '#template' => $template,
          '#context' => $this->getProjectListVariables(),
        ],
      ];

      $build['#attached']['drupalSettings']['projects'] = ProjectTrait::buildProjectList();;

      return $build;
    }


    /**
     * Variables to act as context to the twig template file.
     *
     * @return array
     *   Associative array that defines context for a template.
     */
    protected function getProjectListVariables() {

      $variables['module'] = $this->getModuleName();

      $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
      $variables['language'] = $language;


      $user = \Drupal::currentUser();
      $variables['user'] = clone $user;
      // Remove password and session IDs, since themes should not need nor see them.
      unset($variables['user']->pass, $variables['user']->sid, $variables['user']->ssid);

      $variables['is_admin'] = $user->hasPermission('access unig admin');
      $variables['logged_in'] = $user->isAuthenticated();


      $variables['project_list'] = ProjectTrait::buildProjectList();


      return $variables;
    }




    /**
     * Get full path to the template.
     *
     * @return string
     *   Path string.
     */
    protected function getProjectListPath() {
      return drupal_get_path('module', $this->getModuleName()) . "/templates/unig.project-list.html.twig";
    }

  }
