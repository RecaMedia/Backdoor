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

class ConfigManagement extends Controller{

	function __construct($db,$domain,$config) {
		$this->db = $db;
		$this->domain = $domain;
		$this->config = $config;
  }
  
  private function configEncrypt(){
    $config_array = (array)$this->config;

    // Note: MCRYPT_RIJNDAEL_128 is compatible with AES (all key sizes)
    // $iv = mcrypt_create_iv(mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC), MCRYPT_RAND);
    // $ciphertext = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, "Kx#MX!83@1zQ2oC4", json_encode($config_array), MCRYPT_MODE_CBC, $iv);
    
    // return array(
    //   "part1" => base64_encode($iv),
    //   "part2" => base64_encode($ciphertext)
    // );

    return array(
      "config" => base64_encode(json_encode($config_array))
    );
  }

	public function getConfig(){
		return $this->configEncrypt();
	}
}
