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

class Dir extends Controller {

	public function index(){

		if ($this->api_key && $this->api_member_key) {
			$dm = $this->loadModel('directorymanagement');
			$return = $dm->get();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}
}