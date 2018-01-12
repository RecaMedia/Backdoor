<?php
/*
@category   CMS
@package    Backdoor - Your Online Companion Editor
@author     Shannon Reca | shannonreca.com
@copyright  2018 Shannon Reca
@usage      For more information visit https://github.com/RecaMedia/Backdoor
@license    https://github.com/RecaMedia/Backdoor/blob/master/LICENSE
@version    v2.0.4
@since      01/12/18
*/

class Users extends Controller {

	public function index(){

		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->getUser($this->api_member_code);
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function signin() {
		
		if ($this->api_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->userSignin();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function all($code) {

		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->getUsers($code);
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function get($code) {

		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->getUser($code);
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function add() {

		if ($this->api_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->createUser();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function update() {

		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->updateUser();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function updatepass() {

		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->updateUserPass();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function remove($code) {

		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->deleteUser($_SESSION['bdmembercode'],$code);
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function getall($code) {

		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->getUsers($code);
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function activate() {
		
		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->activateUser();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function setadmin() {
		
		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('usermanagement');
			$return = $um->makeUserAdmin();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}
}
