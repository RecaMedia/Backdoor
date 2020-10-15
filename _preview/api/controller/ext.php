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

class Ext extends Controller {

	public function index(){

		if ($this->api_key && $this->api_member_key) {
			$em = $this->loadModel('extmanagement');
			$return = $em->get();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function toggle(){

		if ($this->api_key && $this->api_member_key) {
			$em = $this->loadModel('extmanagement');
			$return = $em->toggleExt();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function html(){

		if ($this->api_key && $this->api_member_key) {
			$em = $this->loadModel('extmanagement');
			$return = $em->getExtHtml();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function remove(){

		if ($this->api_key && $this->api_member_key) {
			$em = $this->loadModel('extmanagement');
			$return = $em->removeExt();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}
}