# Backdoor (BKDR) | Browser Based Code Editor

Backdoor is a standalone browser based code editor that operates on a LASP (Linux, Apache, SQLite, PHP) server, providing all basic development tools with the ability of adding new features via extensions and services.

![Backdoor][screenshot]

----

## Want to Contribute?

First read our [contributing](https://github.com/RecaMedia/Backdoor/blob/master/CONTRIBUTING.md) readme file prior to starting. With that said, keep in mind all development files live under the `/_development` folder. The `/_preview_` folder serves as a local build directory for testing **Backdoor**.  If you have prepared your local environment, begin by following the steps below.

### Development Setup

#### Folder Structure

| Folder          | Description  |
|:----------------|:-------------|
| **\_demo-root** | This is the directory where your local development copy of BKDR is pointed to for testing file creation and modification. |
| **\_development**     | All development will be done here. |
| **\_preview** | This is where your build gets compiled for localized testing. You would point your Wamp or Mamp to this folder. |
| **\_public-release** | Running _gulp release_ will put all the minified files here. This is a submodule of [https://github.com/RecaMedia/Backdoor-Release](https://github.com/RecaMedia/Backdoor-Release)|
| **docs** | The front-end for [https://recamedia.github.io/Backdoor/](https://recamedia.github.io/Backdoor/). |

#### Installation Steps

* Make sure you have [Node JS](https://nodejs.org/en/), [Gulp JS](https://gulpjs.com/), and Apache/PHP (suggested for [Mac](https://www.mamp.info/en/) or [Windows](http://www.wampserver.com/en/download-wampserver-64bits/)) installed locally.
* Clone this project to your local environment. Note that `_public_releases` directory may contain files. However, since this directory is being used as a submodule, it's best to do a separate pull for this directory from [https://github.com/RecaMedia/Backdoor-Release](https://github.com/RecaMedia/Backdoor-Release). You may need to delete file within the directory prior to doing this.
* Run `npm install` within the root directory to install dependencies.
* **Backdoor** development uses `dev.backdoor.local` URL for local testing. If you decide you would like to use another URL, make sure you also modify the URL within `/_preview/config.json` file to match your new URL.
* Modify your host file to include the following:

**Add URL to host file**

`127.0.0.1	dev.backdoor.local`

**Mac**

`/private/etc/hosts`

**Windows**

`\Windows\System32\drivers\etc\hosts`

* Next, you'll have to modify your vhost file to redirect the dev URL to the appropriate folder.

```sh
<VirtualHost *:80>
	ServerName dev.backdoor.local
	DocumentRoot "c:/path/to/your/repo/directory/_preview"
  ErrorLog "c:/path/to/your/repo/directory/_preview/error.log"
	<Directory  "c:/path/to/your/repo/directory/_preview/">
		Options +Indexes +Includes +FollowSymLinks +MultiViews
		AllowOverride All
		Require local
	</Directory>
</VirtualHost>
```

* You can now start running your Apache/PHP environment. You should be able to access `http://dev.backdoor.local` within your browser and start using the **Backdoor** code editor.
* Use the following command to watch local changes `gulp`. You will have to refresh the page to see the changes take effect.
* To create a final compiled release, use `gulp release`.
* If you're interested in testing your _released_ version, you would have to repeat the process of adding another URL to your host & vhost file, that points to `/_public_releases`. For example: if you decided to use `backdoor.local`, you would access **Backdoor** via `http://backdoor.local/bkdr/`.


### Extension Docs

You can read the basic [extension documentation](https://backdoor.gitbooks.io/extensions/content/) to develop your own extensions.

### License

GNU Affero General Public License v3.0

### Copyright

Copyright (C) 2020 Shannon Reca

[screenshot]: /screenshot_v2-2.png "Backdoor v2"
