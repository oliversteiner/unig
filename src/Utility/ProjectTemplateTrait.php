<?php

namespace Drupal\unig\Utility;

use Drupal\unig\Controller\OutputController;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 *
 * @see \Drupal\Core\Render\Element\InlineTemplate
 * @see https://www.drupal.org/developing/api/8/localization
 */
trait projectTemplateTrait
{


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
     * @param      $project_nid
     * @param null $album_nid
     *
     * @return array A render array.
     * A render array.
     */
    public function projectTemplate($project_nid, $album_nid = NULL)
    {

        // Make sure you don't trust the URL to be safe! Always check for exploits.
        if (!is_numeric($project_nid)) {
            // We will just show a standard "access denied" page in this case.
            throw new AccessDeniedHttpException();
        }


        $template_path = $this->getProjectPath();
        $template = file_get_contents($template_path);
        $build = [
            'description' => [
                '#type' => 'inline_template',
                '#template' => $template,
                '#context' => $this->getProjectVariables($project_nid, $album_nid),
            ],
        ];
       // $build['#attached']['library'] = 'unig/unig.admin.project';

        return $build;
    }


    /**
     * Variables to act as context to the twig template file.
     *
     * @return array
     *   Associative array that defines context for a template.
     */
    protected function getProjectVariables($project_nid, $album_nid = NULL)
    {


        $variables['module'] = $this->getModuleName();

        $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
        $variables['language'] = $language;

        $user = \Drupal::currentUser();
        $variables['user'] = clone $user;
        // Remove password and session IDs, since themes should not need nor see them.
        unset($variables['user']->pass, $variables['user']->sid, $variables['user']->ssid);

        $variables['is_admin'] = $user->hasPermission('access unig admin');
        $variables['access_private_project'] = $user->hasPermission('access private project');
        $variables['logged_in'] = $user->isAuthenticated();


        $variables['album'] = AlbumTrait::getAlbumList($project_nid);
        $variables['project'] = ProjectTrait::buildProject($project_nid);
        $variables['files'] = ProjectTrait::buildFileList($project_nid, $album_nid);

        return $variables;
    }


    /**
     * Get full path to the template.
     *
     * @return string
     *   Path string.
     */
    protected function getProjectPath()
    {
        return drupal_get_path('module', $this->getModuleName()) . "/templates/unig.project.html.twig";
    }

}
