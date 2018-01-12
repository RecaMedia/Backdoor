<?php
require 'api/config.php';
require 'api/access.php';

$access = new Access();

if ($access->api_key && $access->api_member_has_key) {
	echo json_encode(array(
		'success' => true,
		'statusMessage' => "You have access."
	));
} else {
	echo json_encode(array('success' => false,'statusMessage' => 'Access denied.'));
}