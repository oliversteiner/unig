<?php

namespace Drupal\unig\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 *
 */
class OutputController extends ControllerBase {
  /**
   * False, TRUE.
   */
  protected $status = FALSE;
  protected $mode = '';
  protected $nid = NULL;
  protected $data = NULL;
  protected $tid = NULL;
  protected $title = '';
  /**
   * Status, info, success, warning, error.
   */
  protected string $type = 'status';
  /**
   * ($message = NULL, $type = 'status', $repeat = FALSE)
   */
  protected array $messages = [];

  /**
   * IptcController constructor.
   */
  public function __construct() {
  }

  /**
   * @return bool
   */
  public function getStatus(): bool {
    return $this->status;
  }

  /**
   * @param bool $status
   *   status, info, warning, error.
   */
  public function setStatus($status): void {
    $this->status = $status;
  }

  /**
   * @return null
   */
  public function getNid() {
    return $this->nid;
  }

  /**
   * @param null $nid
   */
  public function setNid($nid): void {
    $this->nid = $nid;
  }

  /**
   * @return null
   */
  public function getTid() {
    return $this->tid;
  }

  /**
   * @param null $tid
   */
  public function setTid($tid): void {
    $this->tid = $tid;
  }

  /**
   * @return string <string>
   */
  public function getTitle(): string {
    return $this->title;
  }

  /**
   * @param string $title
   */
  public function setTitle($title) {
    $this->title = $title;
  }

  /**
   * @return array
   */
  public function getMessages() {
    return $this->messages;
  }

  /**
   *
   *
   * @param null $message
   * @param string $type
   * @param bool $repeat
   */
  public function setMessages(
    $message = NULL,
    $type = 'status',
    $repeat = FALSE
  ) {
    if ($repeat) {
      $new_message = [$message, $type];
      $this->messages[] = $new_message;
    }
    else {
      $this->messages = [];
      $new_message = [$message, $type];
      $this->messages[0] = $new_message;
    }
  }

  /**
   * @param int $row
   * @return mixed
   */
  public function getMessage($row = 0) {
    return $this->messages[$row][0];
  }

  /**
   * @param int $row
   * @return mixed
   */
  public function getMessageType($row = 0) {
    return $this->messages[$row][1];
  }

  /**
   * @return string
   */
  public function getMode() {
    return $this->mode;
  }

  /**
   * @param string $mode
   */
  public function setMode($mode) {
    $this->mode = $mode;
  }

  /**
   * @return null
   */
  public function getData() {
    return $this->data;
  }

  /**
   * @param null $data
   */
  public function setData($data): void {
    $this->data = $data;
  }

  /**
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function json(): JsonResponse {
    $output = [
      'status' => $this->status,
      'mode' => $this->mode,
      'nid' => $this->nid,
      'tid' => $this->tid,
      'title' => $this->title,
      'messages' => $this->messages,
      'data' => $this->data,
    ];

    $response = new JsonResponse();
    $response->setData($output);
    return $response;
  }

  /**
   * @return array
   */
  public function debug(): array {
    $output = [
      'status' => $this->status,
      'mode' => $this->mode,
      'nid' => $this->nid,
      'tid' => $this->tid,
      'title' => $this->title,
      'messages' => $this->messages,
      'data' => $this->data,
    ];

    return $output;
  }

}
