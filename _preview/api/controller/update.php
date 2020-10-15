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

class Update extends Controller {

	public function index(){

		if ($this->api_key && $this->api_member_key) {
			$um = $this->loadModel('updatemanagement');
			$return = $um->processUpdate();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}
}