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
		$this->open('core.db');
	}
}

// DB access.
$db = new DB();
// Defaults.
$status = array();
$cleanInstall = true;


// Items within API index.
$post_api_key   = $_POST['local_api_key'];
$post_email     = $_POST['default_email'];
// Items within config.
$post_bkdr_dir  = $_POST['bkdr_dir'];
$post_root_dir  = $_POST['root_dir'];
$post_domain    = $_POST['domain'];
$post_pointed   = $_POST['domain_pointed'];
// Items within database.
$post_open_reg  = $_POST['bkdr_open_reg'];
$post_send_err  = $_POST['bkdr_send_errors'];


// Prepare config...
$config_data = array(
  "backdoorDir" => $post_bkdr_dir,
  "backdoorDomain" => urldecode($post_domain),
  "changeRoot" => $post_root_dir,
  "defaultTheme" => "monokai",
  "domainIsBackdoorApp" => $post_pointed,
  "fontSize" => "14px",
  "lineWrapping" => true,
  "multiViewColors" => array("#007fff","#04ff00","#ff8300"),
  "tabSize" => 2
);
// Create config file.
$config_file_path = '../config.json';
$config_file = fopen($config_file_path, 'w');
$json_string = json_encode($config_data, JSON_PRETTY_PRINT);
if (fwrite($config_file, $json_string) === false) {
  $status[] = 'There was an error creating configuration file.';
  $cleanInstall = false;
} else {
  $status[] = 'Configuration file has been created.';
}
fclose($config_file);


// Default values for new super user.
$code = hash('sha256', $post_email.date("Y-m-d H:m:s"));
$pass = base64_encode('admin');
// Creat user account.
$createUser = $db->prepare("INSERT INTO Users (Code,Fname,Lname,Email,Password,Confirm,Admin) VALUES (:code,:fname,:lname,:email,:pass,1,:admin)");
$createUser->bindValue(':code', $code);
$createUser->bindValue(':fname', 'First');
$createUser->bindValue(':lname', 'Last');
$createUser->bindValue(':email', $post_email);
$createUser->bindValue(':pass', $pass);
$createUser->bindValue(':admin', 1);
$user_result = $createUser->execute();
if ($user_result) {
  $status[] = 'Super user has been created.';
} else {
  $status[] = 'There was an error creating super user.';
  $cleanInstall = false;
}


// Update settings for Open Reg.
$settingsQuery1 = $db->prepare("UPDATE Settings SET SettingValue=:value WHERE SettingType=:type");
$settingsQuery1->bindValue(':value',$post_open_reg);
$settingsQuery1->bindValue(':type','bkdr_open_reg');
$setting1_result = $settingsQuery1->execute();
if ($setting1_result) {
  $status[] = 'Setting for Open Registration has been applied.';
} else {
  $status[] = 'There was an error applying settings for Open Registration.';
  $cleanInstall = false;
}


// Update settings for Sending Errors.
$settingsQuery2 = $db->prepare("UPDATE Settings SET SettingValue=:value WHERE SettingType=:type");
$settingsQuery2->bindValue(':value',$post_send_err);
$settingsQuery2->bindValue(':type','bkdr_send_errors');
$setting2_result = $settingsQuery2->execute();
if ($setting2_result) {
  $status[] = 'Setting for Sending Errors has been applied.';
} else {
  $status[] = 'There was an error applying settings for Sending Erros.';
  $cleanInstall = false;
}


// Prepare final message.
if ($cleanInstall) {
  $finalMessage = "Installation process has been completed.";
} else {
  $finalMessage = "Installation process has been completed with errors.";
}


// Complete full status message.
$statusMessage = ''.implode(" ",$status).'

'.$finalMessage.'

Your default login credentials are USER: (The email provided), PASS: admin.';


// Return.
echo json_encode(array(
  'success' => $cleanInstall,
  'statusMessage' => $statusMessage
));
?>