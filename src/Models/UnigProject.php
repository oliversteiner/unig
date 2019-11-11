<?php


namespace Drupal\unig\Models;


class UnigProject
{
  public const type = 'unig_project';

  /* Drupal Fields */
  public const field_album = 'field_unig_album';
  public const field_category = 'field_unig_category';
  public const field_copyright = 'field_unig_copyright';
  public const field_project_cover = 'field_unig_project_cover';
  public const field_date = 'field_unig_date';
  public const field_description = 'field_unig_description';
  public const field_meta = 'field_unig_meta';
  public const field_private = 'field_unig_private';
  public const field_trash = 'field_unig_trash';
  public const field_tags = 'field_unig_tags';
  public const field_weight = 'field_unig_weight';
  public const field_cache = 'field_unig_cache';
  public const field_help = 'field_unig_help';

  /* Drupal Taxonomy */
  public const term_category = 'unig_category';
  public const term_tags = 'unig_tags';
  public const term_keywords = 'unig_keywords';
  public const term_people = 'unig_people';

}
