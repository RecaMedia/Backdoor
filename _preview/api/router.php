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

class Router extends Controller {

	private $url_controller = null;
	private $url_action = null;
	private $url_parameter_1 = null;
	private $url_parameter_2 = null;
	private $url_parameter_3 = null;

	public function __construct(){

		// create array with URL parts in $url
		$this->processUrl();

		// check for controller: does such a controller exist ?
		if (file_exists('./controller/'.$this->url_controller.'.php')) {

			// if so, then load this file and create this controller
			// example: if controller would be "car", then this line would translate into: $this->car = new car();
			require './controller/' . $this->url_controller . '.php';
			$this->url_controller = new $this->url_controller();

			// check for method: does such a method exist in the controller ?
			if (method_exists($this->url_controller, $this->url_action)) {

				// call the method and pass the arguments to it
				if (isset($this->url_parameter_3)) {
					// will translate to something like $this->home->method($param_1, $param_2, $param_3);
					$this->url_controller->{$this->url_action}($this->url_parameter_1, $this->url_parameter_2, $this->url_parameter_3);
				} elseif (isset($this->url_parameter_2)) {
					// will translate to something like $this->home->method($param_1, $param_2);
					$this->url_controller->{$this->url_action}($this->url_parameter_1, $this->url_parameter_2);
				} elseif (isset($this->url_parameter_1)) {
					// will translate to something like $this->home->method($param_1);
					$this->url_controller->{$this->url_action}($this->url_parameter_1);
				} else {
					// if no parameters given, just call the method without parameters, like $this->home->method();
					$this->url_controller->{$this->url_action}();
				}
			} else {
				// default/fallback: call the index() method of a selected controller
				if (isset($this->url_action)) {
					$this->url_controller->index($this->url_action);
				} else {
					$this->url_controller->index();
				}
			}
		}else{
			$return = array('success' => false,'statusMessage' => 'Error making request.');

			echo json_encode($return);
		}
	}

	// Get and process the URL
	private function processUrl(){
		if (isset($_GET['request'])){

			// split URL
			$url = rtrim($_GET['request'], '/');
			$url = filter_var($url, FILTER_SANITIZE_URL);
			$url = explode('/', $url);

			// Put URL parts into according properties
			// By the way, the syntax here is just a short form of if/else, called "Ternary Operators"
			// @see http://davidwalsh.name/php-shorthand-if-else-ternary-operators
			$this->url_controller = (isset($url[0]) ? $url[0] : null);
			$this->url_action = (isset($url[1]) ? $url[1] : null);
			$this->url_parameter_1 = (isset($url[2]) ? $url[2] : null);
			$this->url_parameter_2 = (isset($url[3]) ? $url[3] : null);
			$this->url_parameter_3 = (isset($url[4]) ? $url[4] : null);
		}
	}
}
