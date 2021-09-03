# Backdoor - Browser Based Code Editor

Backdoor is a standalone browser based code editor that operates on a LASP (Linux, Apache, SQLite, PHP) server, providing all basic development tools with the ability of adding new features via extensions and services. This is the Backdoor-Release __*COMPILED*__ version of Backdoor. For the development version of Backdoor, please visit the [Backdoor Repo](https://github.com/RecaMedia/Backdoor).

![Backdoor][screenshot]

----

### Requirements

Make sure you have the following PHP modules installed and functioning: `Sqlite3`, `Mcrypt`. The `.htacces*` files will need to be allowed to redirect within the `bkdr` directory and subdirectories, check your vhost configuration to allow this. **PLEASE NOTE** this was originally intended to work off of Apache. However, if you're using **Nginx**, you will have to modify the server.conf file to reflect the configurations found in `/bkdr/api/.htaccess`, by using a [converter](https://winginx.com/en/htaccess) tool.

Once you've uploaded the `bkdr` directory to your server, you'll need to change ownership and permissions so the application can function properly. Use the following commands to do this:

`chown -R www-data:www-data /path/to/bkdr`

`chmod 775 -R /path/to/bkdr`

### Installation

To begin installation, visit the URL which will point you to the `bkdr` directory (__http://localhost/bkdr/__ or __http://bkdr.mydomain.com/__). The installation wizard should prepopulate some of the inputs for you. Make sure the folder name of the Backdoor application is correct as this may effect some functionality. The default folder name is `bkdr`, unless you change it. Add the super user email address as required. Only change the root path *IF* the root directory in which *bkdr* live in, is not the directory you wish Backdoor to access. If this is the case, you'll need to start your relative path from the parent directory of `bkdr`. Once you're done, submit the form and you'll be notified if installation was successful. If you have errors, please look at your server logs for details.

### Reporting

Please visit the [Issues](https://github.com/RecaMedia/Backdoor-Release/issues) tab if you've run into any problems with installation. If you're unable to find answers regarding your issue, feel free to open a new issue and I'll do my best to help resolve the problem. This project is being maintained, however, there is only one contributor at the moment so responses may not be as rapid.

### License

GNU Affero General Public License v3.0

### Copyright

Copyright (C) 2017 Shannon Reca

[screenshot]: /screenshot_v2-2.png "Backdoor v2"
