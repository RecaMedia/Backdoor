<?php
/*
@category   Code Editor
@package    Backdoor Code Editor
@author     Shannon Reca
@copyright  2018 RM Digital Services
@usage      For installation visit https://github.com/RecaMedia/Backdoor-Release
@license    https://github.com/RecaMedia/Backdoor-Release/blob/master/LICENSE
@version    build-092618 v2.0.5
*/

// Defaults.
$codemirror_font_size = "14px";
$config_file = "./config.json";

// Check if config exist.
if (file_exists($config_file)) {
  // Get config settings.
  $public_config = json_decode(file_get_contents($config_file), true);
  // If config is provided, proceed.
  if ($public_config != null) {
    // Set font size.
    $codemirror_font_size = $public_config["fontSize"];
  }
}
?>
<!DOCTYPE html>
<html>
  <head>
    <title>Backdoor v2</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <link rel="icon" href="assets/img/favicon.ico"/>
    <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
    <meta name="robots" content="noindex,nofollow"/>
    <meta name="robots" content="noarchive"/>
    <meta name="robots" content="noodp"/>
    <meta name="robots" content="noydir"/>
    <link rel="stylesheet" href="assets/css/main.css"/>
    <style>
      .CodeMirror {font-size: <?php echo $codemirror_font_size;?>;}
    </style>
  </head>
  <body>
    <div id="Backdoor"></div>
    <script src="https://code.jquery.com/jquery-3.0.0.min.js" integrity="sha256-JmvOoLtYsmqlsWxa7mDSLMwa6dZ9rrIdtrrVYRnDRH0=" crossorigin="anonymous"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
    <script src="assets/js/bkdr.js"></script>
  </body>
</html>