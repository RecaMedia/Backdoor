<?php
 class Config extends Controller { public function index(){ $cm = $this->loadModel('configmanagement'); echo json_encode($cm->getConfig()); } } ?>