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

class Controller{
	public $db = null;
	public $config = null;
	public $domain = null;

	public $api_key = false;
	public $api_member_has_key = false;
	public $api_member_code = false;
	public $api_member_key = null;

	private $base_dir = null;
	private $access = null;

	public function __construct(){
		global $base_dir;
		global $configurations;
		$this->base_dir =& $base_dir;
		$this->config =& $configurations;
		$this->access = new Access();

		$this->db = $this->access->db;

		$this->api_key = $this->access->api_key;
		$this->api_member_key = $this->access->api_member_key;

		$this->sess = $this->access->sess;
	}

	/*------------- Basic -------------*/
	public function encrypt($String){
		return base64_encode($String);
	}

	public function decrypt($String){
		return base64_decode($String);
	}

	/*------------- Other -------------*/
	public function loadModel($model_name){
		require $this->base_dir.'/models/' . strtolower($model_name) . '.php';
		// return new model (and pass the database connection to the model)
		return new $model_name($this->db,$this->domain,$this->config);
	}
}