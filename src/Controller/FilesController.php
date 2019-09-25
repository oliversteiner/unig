<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

use Drupal\unig\Utility\AdminTemplateTrait;
use Drupal\unig\Utility\ProjectTrait;
use Drupal\unig\Utility\FileTrait;

/**
 * Controller routines for page example routes.
 */
class FilesController extends ControllerBase
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
  public function selectNewProject()
  {
    return array(
      '#markup' => '<p>selectNewProject</p>'
    );
  }

  /**
   * @return array
   */
  public function listAllFiles()
  {
    return array(
      '#markup' => '<p>listAllFiles</p>'
    );
  }

  /**
   * @param $file_nid
   * @return array
   */
  public function fileDetail($file_nid)
  {
    // Make sure you don't trust the URL to be safe! Always check for exploits.
    if (!is_numeric($file_nid)) {
      // We will just show a standard "access denied" page in this case.
      throw new AccessDeniedHttpException();
    }

    return array(
      '#markup' => '<p>File: ' . $file_nid . '</p>'
    );
  }

  /**
   * @return array
   */
  public function testPage()
  {
    return array(
      '#markup' => '<p>' . $this->t('Test Page') . '</p>'
    );
  }
}
