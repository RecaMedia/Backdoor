# Backdoor - Browser Based Code Editor

Backdoor is a standalone browser based code editor that operates on a LAMP server, providing all basic development tools with the ability of adding new features via extensions and services. This is the Backdoor-Release __*COMPILED*__ version of Backdoor. For the development version of Backdoor, please visit the [Backdoor Repo](https://github.com/RecaMedia/Backdoor).

![Backdoor][screenshot]

----

### Installation

To begin installation, goto the URL that points to the Backdoor directory. For example, http://localhost/bkdr/ or http://bkdr.mydomain.com/. The installation wizard should prepopulate some of the inputs for you. Make sure the folder name of the Backdoor application is correct as this may effect some functionality. The default folder name is `bkdr`, unless you change it.

### Requirements

Make sure you have the following PHP modules installed: __*Sqlite3, Mcrypt*__. The www-data user would need writing permission for this application to work properly. Also, __*.htacces*__ files will need to be allowed to redirect within the /bkdr directory and subdirectories. You can use the following sample for your vhost to allow .htaccess redirects:
```
<Directory /var/www/>
	Options Indexes FollowSymLinks
	AllowOverride None
	Require all granted
</Directory>
```

### Reporting

Please visit the [Issues](https://github.com/RecaMedia/Backdoor-Release/issues) tab if you've run into any problems with installation. If you're unable to find answers regarding your issue, feel free to open a new issue and I'll do my best to help resolve the problem. This project is being maintained, however, there is only one contributor so responses may not be as rapid.

### License

GNU Affero General Public License v3.0

### Copyright

Copyright (C) 2017 Shannon Reca

[screenshot]: /screenshot_v2-2.png "Backdoor v2"
