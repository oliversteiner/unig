<?php
  /**
   * Created by PhpStorm.
   * User: ost
   * Date: 06.12.17
   * Time: 16:58
   */

  namespace Drupal\unig\Controller;

  use Drupal\Core\Controller\ControllerBase;
  use Symfony\Component\HttpFoundation\JsonResponse;


  class OutputController extends ControllerBase {


    protected $status = FALSE; // False, TRUE

    protected $mode = '';

    protected $nid = NULL;

    protected $data = NULL;

    protected $tid = NULL;

    protected $type = 'status';  // status, warning, error

    protected $messages = []; // ($message = NULL, $type = 'status', $repeat = FALSE)


    /**
     * IptcController constructor.
     *
     * @param $fid
     */
    function __construct() {


    }

    /**
     * @return bool
     */
    public function getStatus() {
      return $this->status;
    }

    /**
     * @param bool $status
     */
    public function setStatus($status) {
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
    public function setNid($nid) {
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
    public function setTid($tid) {
      $this->tid = $tid;
    }


    /**
     * $output->setMessage($message = NULL, $type = 'status', $repeat = FALSE)
     *
     * @param null   $message
     * @param string $type
     * @param bool   $repeat
     */
    public function setMessages($message = NULL, $type = 'status', $repeat = FALSE) {

      if ($repeat) {
        $new_message = [$message, $type];
        $this->messages[] = $new_message;
      }
      else {
        $this->messages = FALSE;
        $new_message = [$message, $type];
        $this->messages[0] = $new_message;
      }
    }

    /**
     * @return array
     */
    public function getMessages() {
      return $this->messages;
    }


    /**
     * @return array
     */
    public function debug() {

      $output = [
        'status' => $this->status,
        'mode' => $this->mode,
        'nid' => $this->nid,
        'tid' => $this->tid,
        'messages' => $this->messages,
      ];

      return $output;
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

    public function json() {

      $output = [
        'status' => $this->status,
        'mode' => $this->mode,
        'nid' => $this->nid,
        'tid' => $this->tid,
        'messages' => $this->messages,
        'data' => $this->data,
      ];

      $response = new JsonResponse();
      $response->setData($output);
      return $response;
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
    public function setData($data) {
      $this->data = $data;
    }
  }