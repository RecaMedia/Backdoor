var _ = require('underscore');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var JsDiff = require('diff');
var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('bdprosub.db');
var clients = [];
var start_params = process.argv.slice(3);
var slug = start_params.join('/'); // Unique ID
var port = 3000 + Number(process.argv[2]); // Custom Port #
var socket = null;
var opened_files = {};

var BPI = io.of('/' + slug);

function log(text,content) {
	console.log("");
	console.log("--------------------------------------------------------------");
	console.log(text+": ");
	console.log("");
	console.log(content);
	console.log("--------------------------------------------------------------");
	console.log("");
}

function userOpenedFile(code_obj) {
	// If file does not exist, then add.
	if (opened_files[code_obj.viewid] == undefined) {
		// Create temp obj then set properties.
		let tmp = {};
		tmp[code_obj.viewid] = {};
		tmp[code_obj.viewid][code_obj.author] = code_obj;
		tmp[code_obj.viewid].container = code_obj.code;
		tmp[code_obj.viewid].queue = [];
		tmp[code_obj.viewid].container = code_obj.code;
		tmp[code_obj.viewid].timer = null;
		// Merge temp obj with files object.
		opened_files = Object.assign({}, opened_files, tmp);
	} else {
		// File already exist so return latest data.
		BPI.emit('receive_view_update', {
			code: opened_files[code_obj.viewid].container,
			viewid: code_obj.viewid
		});
	}
}

function viewUpdate(code_obj) {
	log("Update",code_obj);
	// Cache current file.
	let current_file = opened_files[code_obj.viewid];
	// Clear timer in case update happens quickly.
	clearTimeout(current_file.timer);
	// Update users file object version.
	current_file[code_obj.author] = code_obj;
	// Add code to queue.
	current_file.queue.push(code_obj.code);
	// Merge file if timer isn't interupted.
	current_file.timer = setTimeout(function(){
		// Update view with latest code
		mergeFiles(code_obj);
	}, 250);
}

function mergeFiles(code_obj) {
	let current_file = opened_files[code_obj.viewid];

	current_file.queue.map((code,i) => {
		var patch = JsDiff.createPatch(null, current_file.container, code, null, null);
		current_file.container = JsDiff.applyPatch(current_file.container, patch);
	})
	
	current_file.queue = [];

	BPI.emit('receive_view_update', {
		code: current_file.container,
		viewid: code_obj.viewid,
		author: code_obj.author
	});
}

function storeClient(data) {
	// Merge socket id if app id for each user
	var clientInfo = Object.assign({}, data, {
		clientId: socket.id
	})

	// Add to array
	clients.push(clientInfo);

	// Return client list
	BPI.emit('update_users', clients);
}

function onDisconnect() {
	var instanceId = null;
	// Remove disconnected user
	for( var i=0, len=clients.length; i<len; ++i ){
		var c = clients[i];
		if(c.clientId == socket.id){
			instanceId = c.instanceId;
			clients.splice(i,1);
			break;
		}
	}

	// Remove user's file objects
	for (file in opened_files) {
		delete opened_files[file][instanceId];
	}

	// Return new client list
	BPI.emit('update_users', clients);
}

BPI.on('connection', function(s){
	// Set socket to global var.
	socket = s;

	log("User Connected",s.id);

	// Get client domain.
	var client_domain = socket.request.headers.origin;

	// Callbacks after connection
	socket.on('opened_view', function(code_obj) {
		userOpenedFile(code_obj);
	});
	socket.on('send_view_update', function(code_obj) {
		viewUpdate(code_obj);
	});
	socket.on('store_client_info', function(data) {
		storeClient(data);
	});
	socket.on('disconnect', function() {
		onDisconnect()
	});
});

http.listen(port, function(){
	console.log("Server Listening on " + port);
});