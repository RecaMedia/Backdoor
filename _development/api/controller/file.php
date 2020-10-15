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

class File extends Controller {

	public function index(){

		if ($this->api_key && $this->api_member_key) {
			$fm = $this->loadModel('filemanagement');
			$return = $fm->get();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function copy(){

		if ($this->api_key && $this->api_member_key) {
			$fm = $this->loadModel('filemanagement');
			$return = $fm->process('copyFile');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function rename(){

		if ($this->api_key && $this->api_member_key) {
			$fm = $this->loadModel('filemanagement');
			$return = $fm->process('renameFile');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function delete(){

		if ($this->api_key && $this->api_member_key) {
			$fm = $this->loadModel('filemanagement');
			$return = $fm->process('deleteFile');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function create($type){

		if ($this->api_key && $this->api_member_key) {
			$fm = $this->loadModel('filemanagement');
			if ($type == "folder") {
				$return = $fm->process('newFolder');
			// } else if ($type == "folder") {
			// 	$return = $fm->process('newFolder');
			} else {
				$return = array('success' => false,'statusMessage' => 'Type not provided.');
			}
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function permission(){

		if ($this->api_key && $this->api_member_key) {
			$fm = $this->loadModel('filemanagement');
			$return = $fm->process('changePermission');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function save(){

		if ($this->api_key && $this->api_member_key) {
			$fm = $this->loadModel('filemanagement');
			$return = $fm->process('saveFile');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function upload(){

		if ($this->api_key && $this->api_member_key) {
			$fm = $this->loadModel('filemanagement');
			$return = $fm->process('upload');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function viewimage(){
		
		$fm = $this->loadModel('filemanagement');
		$return = $fm->viewImage();

		echo json_encode($return);
	}
}
