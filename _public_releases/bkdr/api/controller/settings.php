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

class Settings extends Controller {

	public function index(){

		if ($this->api_key && $this->api_member_key) {
			$se = $this->loadModel('settingsmanagement');
			$return = $se->getSettings();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function open(){

		if ($this->api_key) {
			$se = $this->loadModel('settingsmanagement');
			$return = $se->getOpenSettings();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function update() {
		
		if ($this->api_key && $this->api_member_key) {
			$se = $this->loadModel('settingsmanagement');
			$return = $se->updateSettings();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}
}