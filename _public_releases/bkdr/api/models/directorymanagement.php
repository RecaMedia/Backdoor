<?php
/*
@category   CMS
@package    Backdoor - Your Online Companion Editor
@author     Shannon Reca | shannonreca.com
@copyright  2018 Shannon Reca
@usage      For more information visit https://github.com/RecaMedia/Backdoor
@license    https://github.com/RecaMedia/Backdoor/blob/master/LICENSE
@version    v2.0.6
@since      01/12/18
*/

class DirectoryManagement extends Controller{

	function __construct($db,$domain,$config) {
		// Initialize the DirectoryLister object
		$this->db = $db;
		$this->domain = $domain;
		$this->config = $config;
    // Include the DirectoryLister class
    require_once('../dir-lister/DirectoryLister.php');

    // Initialize the DirectoryLister object
    $this->lister = new DirectoryLister();

    $this->extensions_dir = $this->config->backdoorDir . DIRECTORY_SEPARATOR . "extensions";

    // Restrict access to current directory
    getcwd();
    chdir(".." . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR . $this->config->changeRoot);
    ini_set('open_basedir', getcwd());
    // dirname(dirname(dirname(dirname(__FILE__))))
  }

  public function get() {
    // Return file hash
    if (isset($_GET['hash'])) {
      // Get file hash array and JSON encode it
      $hashes = $this->lister->getFileHash($_GET['hash']);
      $data   = json_encode($hashes);
      // Return the data
      die($data);
    }

    // Initialize the directory array
    if (isset($_POST['dir'])) {
      $dir_array = $this->lister->listDirectory($_POST['dir']);
    } else {
      $dir_array = $this->lister->listDirectory('.');
    }

    $breadcrumbs = $this->lister->listBreadcrumbs();
    $sys_messages = $this->lister->getSystemMessages();

    if (!$sys_messages) {
      $sys_messages = null;
    }

    $browser_data = array(
      'breadcrumbs' => $breadcrumbs
    );

    $files_array = array();

    foreach ($dir_array as $name => $file_info) {
      if (is_file($file_info['file_path'])) {
        $is_folder = false;
      } else {
        $is_folder = true;
      }

      $files_array[$name] = array(
        'filename' => $name,
        'icon' => $file_info['icon_class'],
        'url' => $file_info['url_path'],
        'path' => $file_info['file_path'],
        'size' => $file_info['file_size'],
        'lastmodified' => $file_info['mod_time'],
        'sort' => $file_info['sort'],
        'handler' => $file_info['handler'],
        'isfolder' => $is_folder,
        'permission' => $file_info['permission']
      );
    }

    $browser_data['files'] = $files_array;
    $directory = json_decode(json_encode($browser_data));

    return array(
      'success' => true,
      'statusMessage' => "Directory information found.",
      'directory' => $directory
    );
  }
}