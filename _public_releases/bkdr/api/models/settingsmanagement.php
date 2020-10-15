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

class SettingsManagement extends Controller{

	function __construct($db,$domain,$config) {
		$this->db = $db;
		$this->domain = $domain;
		$this->config = $config;
	}

	public function getSettings(){
		$settingsQuery = $this->db->prepare("SELECT * FROM Settings");
    $result = $settingsQuery->execute();
    $allSettings = array();

		while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
			$this_value = $row['SettingValue'] == "false" ? false : ($row['SettingValue'] == "true" ? true : $row['SettingValue']);
			$allSettings[$row['SettingType']] = $this_value;

		}

		return array(
      'success' => true,
      'statusMessage' => "Retrieved all settings.",
      'settings' => $allSettings
    );
	}

	public function getOpenSettings(){
		$settingsQuery = $this->db->prepare("SELECT * FROM Settings WHERE Open=1");
    $result = $settingsQuery->execute();
    $allSettings = array();

		while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
			$this_value = $row['SettingValue'] == "false" ? false : ($row['SettingValue'] == "true" ? true : $row['SettingValue']);
			$allSettings[$row['SettingType']] = $this_value;
		}

		return array(
      'success' => true,
      'statusMessage' => "Retrieved all settings.",
      'settings' => $allSettings
    );
	}

	public function updateSettings(){
		$type = (isset($_POST['type']) ? $_POST['type']:"");
		$value = (isset($_POST['value']) ? $_POST['value']:"");

		$settingsQuery = $this->db->prepare("UPDATE Settings SET SettingValue=:value WHERE SettingType=:type");
		$settingsQuery->bindValue(':value',$value);
		$settingsQuery->bindValue(':type',$type);
		$result = $settingsQuery->execute();

		if ($result) {
			return array(
				'success' => true,
				'statusMessage' => "Settings successfully updated.",
				'settings' => $this->getSettings()['settings']
			);
		} else {
			return array(
				'success' => false,
				'statusMessage' => "There was an error updating settings."
			);
		}
	}
}
