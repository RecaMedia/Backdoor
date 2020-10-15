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

class ExtManagement extends Controller{

	function __construct($db,$domain,$config) {
		// Initialize the DirectoryLister object
		$this->db = $db;
		$this->domain = $domain;
		$this->config = $config;

    $this->extensions_dir = $this->config->backdoorDir . DIRECTORY_SEPARATOR . "extensions";

    // Restrict access to current directory
    getcwd();
    chdir(".." . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR);
    ini_set('open_basedir', getcwd());
  }

  private function recurse_delete($path) {
    if (is_dir($path) === true) {
      $files = array_diff(scandir($path), array('.', '..'));
      foreach ($files as $file) {
        $this->recurse_delete(realpath($path) . DIRECTORY_SEPARATOR . $file);
      }
      return rmdir($path);
    } else if (is_file($path) === true) {
      return unlink($path);
    }
    return false;
  }
  
  public function get() {
    
    $dir_array = scandir($this->extensions_dir);

    $ext_array = array();

    foreach ($dir_array as $file_path) {

      if ($file_path != "." && $file_path != "..") {

        $short_path = $this->extensions_dir . DIRECTORY_SEPARATOR . $file_path;
        $file_path = getcwd() . DIRECTORY_SEPARATOR . $this->extensions_dir . DIRECTORY_SEPARATOR . $file_path;

        if (!is_file($file_path)) {

          $data = json_decode(file_get_contents($file_path . DIRECTORY_SEPARATOR . "data.json"), true);

          $queryExt = $this->db->prepare("SELECT * FROM Extensions WHERE Author=:author AND Name=:name AND ExtPath=:extpath");
          $queryExt->bindValue(':author', $data['author']);
          $queryExt->bindValue(':name', $data['namespace']);
          $queryExt->bindValue(':extpath', $short_path);
          $result = $queryExt->execute();
          $row = $result->fetchArray(SQLITE3_ASSOC);
    
          if ($row) {
            $active = ($row['Activated']=="false"?false:true);
          } else {
            $queryExt = $this->db->prepare("INSERT INTO Extensions (Author, Name, ExtPath, Activated) VALUES (:author, :name, :extpath, 0)");
            $queryExt->bindValue(':author', $data['author']);
            $queryExt->bindValue(':name', $data['namespace']);
            $queryExt->bindValue(':extpath', $short_path);
            $result = $queryExt->execute();

            $active = false;
          }

          $data['active'] = $active;
          $data['path'] = $short_path;

          $ext_array[] = $data;
        }
      }
    }

    if (count($ext_array)) {
      return array(
        'success' => true,
        'statusMessage' => "Extensions directory.",
        'extensions' => $ext_array
      );
    } else {
      return array(
        'success' => false,
        'statusMessage' => "No extensions found.",
        'extensions' => $ext_array
      );
    }
  }
  
  public function toggleExt() {

    if (isset($_POST['namespace']) && isset($_POST['extpath']) && isset($_POST['toggle'])) {

      $status = 0;
      $msg = "deactivated";
      if ($_POST['toggle'] == "false") {
        $status = 1;
        $msg = "activated";
      }

      $queryExt = $this->db->prepare("UPDATE Extensions SET Activated=:status WHERE Name=:name AND ExtPath=:extpath");
      $queryExt->bindValue(':name', $_POST['namespace']);
      $queryExt->bindValue(':status', $status);
      $queryExt->bindValue(':extpath', $_POST['extpath']);
      $result = $queryExt->execute();

      if ($result) {
        return array(
          'success' => true,
          'statusMessage' => "Extension has been $msg.",
          'extensions' => $this->get()['extensions']
        );
      } else {
        return array(
          'success' => false,
          'statusMessage' => "There was an error activating extension."
        );
      }
    } else {
      return array(
        'success' => false,
        'statusMessage' => "Missing values to activate extension."
      );
    }
  }
  
  public function getExtHtml() {

    if (isset($_POST['extpath']) && isset($_POST['panels'])) {
      $htmls = [];

      foreach($_POST['panels'] as $html) {
        $htmls[] = file_get_contents($_POST['extpath'].DIRECTORY_SEPARATOR.$html);
      }
      
      return array(
        'success' => true,
        'statusMessage' => "HTML found.",
        'html' => $htmls
      );
    } else {
      return array(
        'success' => false,
        'statusMessage' => "Missing values to activate extension."
      );
    }
  }

  public function removeExt() {

    if (isset($_POST['namespace']) && isset($_POST['extpath'])) {

      if ($this->recurse_delete($_POST['extpath'])) {
        $status = 0;
  
        $queryExt = $this->db->prepare("DELETE FROM Extensions WHERE Name=:name AND ExtPath=:extpath");
        $queryExt->bindValue(':name', $_POST['namespace']);
        $queryExt->bindValue(':extpath', $_POST['extpath']);
        $result = $queryExt->execute();
  
        if ($result) {
          return array(
            'success' => true,
            'statusMessage' => "Extension has been removed.",
            'extensions' => $this->get()['extensions']
          );
        } else {
          return array(
            'success' => false,
            'statusMessage' => "There was an error removing extension from database."
          );
        }
      } else {
        return array(
          'success' => false,
          'statusMessage' => "There was an error removing extension."
        );
      }
    } else {
      return array(
        'success' => false,
        'statusMessage' => "Missing values to remove extension."
      );
    }
  }
}