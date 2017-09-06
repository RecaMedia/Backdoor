# Backdoor - Browser Based Code Editor

Backdoor is a standalone browser based code editor that operates on a LAMP server, providing all basic development tools with the ability of adding new features via extensions and services.

![Backdoor][screenshot]

----

### Local Development

To work locally, you must first open terminal, cd to the repo's directory and run `npm install`. You will need [NodeJS](https://nodejs.org/en/) installed prior to doing this.

Next, you will need to [determine the URL](#pointing-url) you want to use for **Backdoor**.

Once all the dependencies have been installed, in terminal run `gulp dev` to start watching file changes. This will compile the file changes uncompressed, which makes the development process easier. When you're ready for production, run `gulp` instead which will minify the file changes.

### Pointing URL

The `release` folder is the actual software. To setup your URL, open and modify the `/release/config.json` file. Assuming your domain is pointing to `http://localhost`, use the instructions below:

```javascript
// If you want:
http://localhost

// Set the following properties to:
"backdoorDir": "",
"backdoorDomain": "http://localhost",
"domainIsBackdoorApp": true,

// If you want:
http://localhost/release

// Set the following properties to:
"backdoorDir": "release",
"backdoorDomain": "http://localhost",
"domainIsBackdoorApp": false,
```

### Ready for Production

The `release` folder contains all the files needed to run **Backdoor** on the server. Rename and copy the `release` folder to the root directory within your server. By default, Backdoor will use this directory as the root. You can change this by modifying the `release/config.json` file.

```javascript
// If you want point to "foo" subdirectory:
"changeRoot": "/foo",

// If you want point to a parent directory:
"changeRoot": "../",
```

----

### License

Backdoor is licensed under the AGPL license by default. Any contributors that submit work and is accepted by the author, must agree to the [CLA](https://github.com/RecaMedia/Backdoor/blob/master/CLA.md) provided in this repository. Please contact the author for more information regarding licensing.

### Copyright

Copyright (C) 2017 Shannon Reca

[screenshot]: /screenshot_v2-2.png "Backdoor v2"
