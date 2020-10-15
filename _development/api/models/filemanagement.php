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

class FileManagement extends Controller{

	function __construct($db,$domain,$config) {
		// Initialize the DirectoryLister object
		$this->db = $db;
		$this->domain = $domain;
		$this->config = $config;

		$this->types = [];
		// Code
		$this->types["cfg"] = "plain";
		$this->types["coffee"] = "coffeescript";
		$this->types["css"] = "css";
		$this->types["htm"] = "htmlmixed";
		$this->types["html"] = "htmlmixed";
		$this->types["ini"] = "plain";
		$this->types["js"] = "javascript";
		$this->types["json"] = "javascript";
		$this->types["jsx"] = "jsx";
		$this->types["log"] = "plain";
		$this->types["markdown"] = "markdown";
		$this->types["md"] = "markdown";
		$this->types["mdown"] = "markdown";
		$this->types["mdtext"] = "markdown";
		$this->types["mdtxt"] = "markdown";
		$this->types["mdwn"] = "markdown";
		$this->types["mkd"] = "markdown";
		$this->types["mkdn"] = "markdown";
		$this->types["php"] = "php";
		$this->types["pl"] = "perl";
		$this->types["pug"] = "pug";
		$this->types["py"] = "python";
		$this->types["rb"] = "ruby";
		$this->types["rtf"] = "plain";
		$this->types["sass"] = "sass";
		$this->types["scss"] = "sass";
		$this->types["sh"] = "shell";
		$this->types["sql"] = "sql";
		$this->types["text"] = "markdown";
		$this->types["txt"] = "plain";
		$this->types["vb"] = "vb";
		$this->types["vbs"] = "vbscript";
		$this->types["xhtml"] = "htmlmixed";
		$this->types["xml"] = "xml";
		$this->types["yaml"] = "yaml";
		$this->types["yml"] = "yaml";
		// Images
		$this->types["jpg"] = "imageview";
		$this->types["jpeg"] = "imageview";
		$this->types["gif"] = "imageview";
		$this->types["png"] = "imageview";
		$this->types["bmp"] = "imageview";
		$this->types["tiff"] = "imageview";
		$this->types["svg"] = "imageview";
	}

	private function get_file_extension($file_name) {
		return substr(strrchr($file_name,'.'),0);
	}

	private function recurse_copy($src, $dst) {
		$dir = opendir($src);
		$result = ($dir === false ? false : true);
		if ($result !== false) {
			$result = @mkdir($dst);
			if ($result === true) {
				while(false !== ( $file = readdir($dir)) ) {
					if (( $file != '.' ) && ( $file != '..' ) && $result) {
						if ( is_dir($src . DIRECTORY_SEPARATOR . $file) ) {
							$result = $this->recurse_copy($src . DIRECTORY_SEPARATOR . $file,$dst . DIRECTORY_SEPARATOR . $file);
						} else { 
							$result = copy($src . DIRECTORY_SEPARATOR . $file,$dst . DIRECTORY_SEPARATOR . $file);
						}
					}
				}
				closedir($dir);
			}
		}
		return $result;
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

	public function adminCheck($userid){
		$userLogin = $this->db->prepare("SELECT * FROM Users WHERE Admin=1");
		$result = $userLogin->execute();

		while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
			if ($row['Code'] == $userid && $userid != "") {
				return true;
				break;
			}
		}

		return false;
	}

	public function viewimage() {
		$file_location = (isset($_GET['img']) && $_GET['img'] != "") ? $_GET['img'] : " ";

		if (isset($file_location) && $file_location != "") {
			$imageFile = dirname(dirname(dirname(dirname(__FILE__)))) . DIRECTORY_SEPARATOR . $this->config->changeRoot . DIRECTORY_SEPARATOR . $file_location;

			$ext = $this->get_file_extension($imageFile);
			$ext = str_replace('.','',$ext);

			switch ($ext) {
				case "jpg":
				case "jpeg":
					$type = 'image/jpeg';
				break;
				case "png":
					$type = 'image/png';
				break;
				case "gif":
					$type = 'image/gif';
				break;
				case "tiff":
					$type = 'image/tiff';
				break;
				case "svg":
					$type = 'image/svg+xml';
				break;
				case "bmp":
					$type = 'image/bmp';
				break;
			}

			header('Content-Type:'.$type);
			header('Content-Length: ' . filesize($imageFile));
			readfile($imageFile);
		}
	}

	public function get() {
		$file_location = (isset($_POST['fileLoc']) && $_POST['fileLoc'] != "") ? $_POST['fileLoc'] : " ";
		$usercode = (isset($_POST['usercode']) ? $_POST['usercode']:"");

		if (isset($file_location) && $file_location != "") {
			// Set root directory.
			$root = dirname(dirname(dirname(dirname(__FILE__)))) . DIRECTORY_SEPARATOR . $this->config->changeRoot;
			$prep_fileLoc = urldecode($_POST['fileLoc']);

			// Required: File location.
			if ($file_location == "app_config_fixed_path") {
				if ($this->adminCheck($usercode)) {
					$file_location = dirname(dirname(dirname(dirname(__FILE__)))) . DIRECTORY_SEPARATOR . $this->config->backdoorDir . DIRECTORY_SEPARATOR . 'config.json';
				} else {
					return array(
						'success' => false,
						'statusMessage' => "You do not have admin access."
					);
				}
			} else {
				$file_location = $root . DIRECTORY_SEPARATOR . $prep_fileLoc;
			}
			
			// Data provided from file location.
			$ext = $this->get_file_extension($file_location);
			$ext = str_replace('.','',$ext);

			if (array_key_exists($ext,$this->types)) {
				$format = $this->types[$ext];

				if ($format != 'imageview') {
					$contents = file_get_contents($file_location);
				} else {
					$contents = $prep_fileLoc;
				}

				return array(
					'success' => true,
					'statusMessage' => "File found.",
					'file' => array(
						"format" => $format,
						"content" => $contents
					)
				);
			} else {
				return array(
					'success' => false,
					'statusMessage' => "Unrecognizable file format."
				);
			}
		} else {
			return array(
				'success' => false,
				'statusMessage' => "File not found."
			);
		}
	}

	public function process($processType) {

		if (isset($processType) && $processType != "") {

			$file_location = (isset($_POST['fileLoc']) && $_POST['fileLoc'] != "") ? $_POST['fileLoc'] : "";
			$misc_data = (isset($_POST['miscData']) && $_POST['miscData'] != "") ? $_POST['miscData'] : "";

			if ($this->config->changeRoot != "") {
				$root = dirname(dirname(dirname(dirname(__FILE__)))) . DIRECTORY_SEPARATOR . $this->config->changeRoot;
			} else {
				$root = dirname(dirname(dirname(dirname(__FILE__))));
			}

			if ($file_location == "app_config_fixed_path") {
				$item_type = "file";
				$location = dirname(dirname(dirname(dirname(__FILE__)))) . DIRECTORY_SEPARATOR . $this->config->backdoorDir . DIRECTORY_SEPARATOR . 'config.json';
			} else {
				$location = $root . DIRECTORY_SEPARATOR . str_replace($this->config->baseDir, "", $file_location);

				// Remove trailing forward slash.
				if (substr($location, -1) == '/') {
					$location = substr($location, 0, -1);
				}

				if (is_dir($location)) {
					// Folder Found
					$item_type = "folder";
				} else {
					// File Found
					$item_type = "file";
				}
			}

			$location = urldecode($location);

			// Run requested function.
			switch ($processType) {
				// Copy Process.
				case 'copyFile':
					$success = false;

					if ($item_type == "file") {
						if (file_exists($location)) {
							$file_name = basename($location);
							$file_ext = $this->get_file_extension($file_name);
							$bare_name = basename($location,$file_ext);
							$new_name = $bare_name."_copy".$file_ext;
							$new_location = dirname($location);
							$copy_to = $new_location . DIRECTORY_SEPARATOR . $new_name;

							if (copy($location,$copy_to)) {
								$success = true;
								$extra = $copy_to;
								chmod($copy_to, 0644);
							}
						}
					} else if ($item_type == "folder") {
						if ($this->recurse_copy($location, $location."_copy")) {
							$success = true;
							$extra = $location."_copy";
						}
					}

					if ($success) {
						$return = array(
							"action"	=> $processType,
							"item"		=> $item_type,
							"statusMessage" => "File was successfully copied.",
							"success"	=> true
						);
					} else {
						$return = array(
							"action"	=> $processType,
							"item"		=> $item_type,
							"statusMessage" => "There was an error copying file. ".$location." ",
							"success"	=> false
						);
					}
					break;

				// Rename Process. -----------------------------------------------------
				case 'renameFile':
					$success = false;

					$parent_dir = dirname($location);
					$rename_to = $parent_dir . DIRECTORY_SEPARATOR . $misc_data;

					if (rename($location, $rename_to)) {
						$success = true;
						$extra = $rename_to;
						chmod($rename_to, 0644);
					}

					if ($success) {
						$return = array(
							"action"	=> $processType,
							"item"		=> $item_type,
							"statusMessage" => "File was successfully renamed.",
							"success"	=> true
						);
					} else {
						$return = array(
							"action"	=> $processType,
							"item"		=> $item_type,
							"statusMessage" => "There was an error renaming file.",
							"success"	=> false
						);
					}
					break;

				// Delete Process. -----------------------------------------------------
				case 'deleteFile':
					$success = false;
					$extra = $location;

					$devInfo = "";

					if ($item_type == "file") {
						$devInfo .= "Delete file attempt - ".$location;
						if (file_exists($location)) {
							if (unlink($location)) {
								$success = true;
							}
						}
					} else if ($item_type == "folder") {
						$devInfo .= "Delete folder attempt - ".$location;
						if ($this->recurse_delete($location)) {
							$success = true;
						}
					}

					if ($success) {
						$return = array(
							"action"	=> $processType,
							"item"		=> $item_type,
							"statusMessage" => "File was successfully deleted. ".$devInfo,
							"success"	=> true
						);
					} else {
						$return = array(
							"action"	=> $processType,
							"item"		=> $item_type,
							"statusMessage" => "There was an error deleting file. ".$devInfo,
							"success"	=> false
						);
					}
					break;

				// New Folder Process. -----------------------------------------------------
				case 'newFolder':
					$success = false;

					$new_folder_to = $location . DIRECTORY_SEPARATOR . $misc_data;

					if (mkdir($new_folder_to)) {
						$success = true;
						$extra = $new_folder_to;
						chmod($new_folder_to, 0755);
					}

					if ($success) {
						$return = array(
							"action"	=> $processType,
							"item"		=> "folder",
							"statusMessage" => "New folder was successfully created.",
							"success"	=> true
						);
					} else {
						$return = array(
							"action"	=> $processType,
							"item"		=> "folder",
							"statusMessage" => "There was an error creating folder.",
							"success"	=> false
						);
					}
					break;

				// CHMOD Process. -----------------------------------------------------
				case 'changePermission':
					$success = false;
					$permission = (int) $misc_data;
					$extra = $location." set to ".$misc_data;

					if (chmod($location, $permission)) {
						$success = true;
					}

					if ($success) {
						$return = array(
							"action"	=> $processType,
							"item"		=> $item_type,
							"statusMessage" => "Permissions have been updated.",
							"success"	=> true
						);
					} else {
						$return = array(
							"action"	=> $processType,
							"item"		=> $item_type,
							"statusMessage" => "There was an error changing permissions.",
							"success"	=> false
						);
					}
					break;

				// Save Process. -----------------------------------------------------
				case 'saveFile':
				case 'saveasFile':
					$success = false;

					$file_pointer = fopen($location,'w');
					if (fwrite($file_pointer,$misc_data)) {
						$success = true;
						$extra = $location;
					}
					fclose($file_pointer);
					chmod($location, 0644);

					if ($success) {
						$return = array(
							"action"	=> $processType,
							"item"		=> "file",
							"statusMessage" => "File was successfully saved.",
							"success"	=> true
						);
					} else {
						$return = array(
							"action"	=> $processType,
							"item"		=> "file",
							"statusMessage" => "There was an error saving file.",
							"success"	=> false
						);
					}
					break;

				// Upload Process. -----------------------------------------------------
				case 'upload':
					$success = false;

					if(isset($_FILES['file'])){
						// Check if file is not undefined
						if ($_FILES['file']['name']) {
							// Denie unpermitted file types
							$denied_files = array();
							if (!in_array($_FILES['file']['type'], $denied_files)) {
								//Get the temp file path
								$target_filename = $_FILES['file']['tmp_name'];

								//Make sure we have a filepath
								if ($target_filename != ""){

									$newFilePath = $location . DIRECTORY_SEPARATOR . $_FILES['file']['name'];
		
									//Upload the file into the dir
									if(move_uploaded_file($target_filename, $newFilePath)) {

										chmod($newFilePath, 0644);
		
										return array(
											"item" => $item_type,
											'location' => $newFilePath,
											'statusMessage' => "You have successfully uploaded ".$_FILES['file']['name'].".",
											'success' => true
										);
									} else {
										return array(
											'success' => false,
											'statusMessage' => "There was an issue uploading file to server."
										);
									}
								}
							} else {
								return array('success' => false,'statusMessage' => "File type not permitted.");
							}
						} else {
							return array('success' => false,'statusMessage' => "Please select file.");
						}
					} else {
						return array('success' => false,'statusMessage' => "Missing values.");
					}
					
					break;
			}

			return $return;
		} else {
			return array(
				'success' => false,
				'statusMessage' => "Missing values."
			);
		}
	}
}