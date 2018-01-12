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

class DB extends SQLite3 {
	function __construct() {
		global $base_dir;
		$this->open($base_dir.'/core.db');
	}
}

class Access {
	public $db = null;
	public $config = null;

	public $api_key = false;
	public $api_member_key = false;

	public $sess = null;

	private $keys = null;
	private $base_dir = null;

	public function __construct(){
		global $base_dir;
		global $configurations;
		$this->base_dir =& $base_dir;
		$this->config =& $configurations;

		// Set API access.
		if (!function_exists('apache_request_headers')) {
			$headers = $this->apache_request_headers();
		} else { 
			$headers = apache_request_headers();
		}

		// Kill API if key doesn't match.
		if (isset($headers["bd2-api-key"])) {
			if ($headers["bd2-api-key"] != $this->config->apiKey) {
				$return = array('success' => false,'statusMessage' => 'Error with API access.');
				$error = json_encode($return);
				die($error);
			} else {
				$this->api_key = true;
			}
		}

		if (isset($headers["session"])) {
			$this->sess = $headers["session"];
			session_id($this->sess);
			session_start();
		} else {
			session_start();
			$this->sess = session_id();
		}

		session_save_path('/');
		
		// open db connection, set domain var and login key.
		$this->openDatabaseConnection();

		if (
			isset($_SESSION['bdmemberkey']) && isset($headers["member-api-key"]) && 
			$_SESSION['bdmemberkey'] == $headers["member-api-key"]
		) {
			$this->api_member_key = true;
		}
	}

	/*------------- Private -------------*/
	private function apache_request_headers() {
		$arh = array();
		$rx_http = '/\AHTTP_/';
		foreach($_SERVER as $key => $val) {
			if( preg_match($rx_http, $key) ) {
				$arh_key = preg_replace($rx_http, '', $key);
				$rx_matches = array();
				$rx_matches = explode('_', $arh_key);
				if( count($rx_matches) > 0 and strlen($arh_key) > 2 ) {
					foreach($rx_matches as $ak_key => $ak_val) $rx_matches[$ak_key] = ucfirst($ak_val);
					$arh_key = implode('-', $rx_matches);
				}
				$arh[$arh_key] = $val;
			}
		}
		return( $arh );
	}

	private function openDatabaseConnection(){
		$this->db = new DB();
	}
}
?>