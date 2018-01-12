import _ from 'lodash';
import mixin from '../mixins/global';

var app_state = null;
var new_count = 0;
const active_limit = 3;

const addActive = function(state,active_view) {
	if (state.actives.indexOf(active_view) === -1) {
		if (state.actives.length >= active_limit) {
			state.actives.shift();
		}

		state.actives.push(active_view);
	}
	
	return state;
}

const replaceActive = function(state,active_view = null) {
	state.actives = [];

	if (active_view != null) {
		state.actives.push(active_view);
	}
	
	return state;
}

const removeActive = function(state,active_view) {
	var index = state.actives.indexOf(active_view);
	
	if (index !== -1) {
		state.actives.splice(index,1);
	}
	
	return state;
}

const fileAPICall = function(settings) {
	return fetch(settings.appUrl + settings.url, {
		method: settings.method,
		headers: settings.headers,
		body: settings.data
	}).catch((error) => {
		mixin.processErrors(error);
	});
}

const files = function(state = {}, action) {

	if (typeof action.getState === 'function') {
		app_state = action.getState();
	}

	switch (action.type) {
		case "NEW_FILE" : {

			// Set vars and take current state of open files
			var d = new Date();
			var viewid = d.getTime();
			var tmp = state;

			// Set all open files to `active = false`.
			tmp.views.map((file, i) => file.active = false);

			// Add new file object to views array.
			tmp.views.push({
				active: true,
				code: "",
				createdDate: "",
				filename: "Untitled "+new_count,
				filepath: "/",
				options: {
					mode: "htmlmixed",
					wrap: true
				},
				position: (tmp.count + 1),
				size: "",
				viewid
			});

			// Increment file count.
			tmp.count++;
			new_count++;

			// Update current view new file.
			tmp.workingOnView = viewid;

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "LOAD_FILE" : {

			// Get browser object data from context menu.
			var browserObj = state.contextData;

			// Create new post data.
			let formData = new FormData();
			formData.append('fileLoc',browserObj.url);
			
			let post = fileAPICall({
				url: '/api/file/',
				method: 'POST',
				data: formData,
				headers: action.headers,
				appUrl: action.appUrl
			});

			post.then((response) => {
				return response.json();
			}).then(function(data) {
				if (data.success) {
					browserObj['data'] = data.file
					action.asyncDispatch({
						type: "OPEN_FILE",
						browserObj
					});
				} else {
					action.asyncDispatch({
						type: "ALERT",
						message: data.statusMessage
					});
				}
			});

			break;
		}

		case "OPEN_FILE" : {

			var tmp = state;
			var viewid = action.browserObj.path;
			var is_open = false;

			// Set all open files to active=false
			tmp.views.map((file, i) => {
				file.active = false;	
				if (file.viewid == viewid) {
					is_open = true;
					file.active = true;
				}
			});

			// If file is NOT already open.
			if (!is_open) {
				tmp.views.map((file, i) => file.active = false);

				// Add new file object to views array with provided data.
				tmp.views.push({
					active: true,
					code: action.browserObj.data.content,
					createdDate: action.browserObj.lastmodified,
					filename: action.browserObj.filename,
					filepath: action.browserObj.path,
					options: {
						mode: action.browserObj.data.format,
						wrap: true
					},
					position: (tmp.count + 1),
					size: action.browserObj.size,
					viewid
				});

				// Increment file count.
				tmp.count++;
				new_count++;
			}

			// Update current view to file.
			tmp.workingOnView = viewid;

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "SAVE_FILE" : {

			var tmp = state;
			
			let post = fileAPICall({
				url: '/api/file/save/',
				method: 'POST',
				data: action.post,
				headers: action.headers,
				appUrl: action.appUrl
			});

			post.then((response) => {
				return response.json();
			}).then(function(data) {
				// Store response.
				tmp.response = data;

				// Gather all async dispatches.
				let asyncCalls = [];

				// Check if successful.
				if (data.success) {
					// Update file browser.
					asyncCalls.push({
						type: "UPDATE_FILEBROWSER"
					});
					// Update file object regardless of Save As or just Save.
					asyncCalls.push({
						type: "UPDATE_FILENAME",
						file: action.fileObj,
						path: action.fileObj.filepath
					})
				}

				// Prompt response message.
				asyncCalls.push({
					type: "ALERT",
					message: data.statusMessage
				});

				// Make an asyncDispatch.
				action.asyncDispatch(asyncCalls);
			});

			// Update current view, in case there was a file name change.
			tmp.workingOnView = action.fileObj.viewid;

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "RENAME_FILE" : {

			var tmp = state;
			
			let post = fileAPICall({
				url: '/api/file/rename/',
				method: 'POST',
				data: action.data,
				headers: action.headers,
				appUrl: action.appUrl
			});

			post.then((response) => {
				return response.json();
			}).then(function(data) {
				// Store response.
				tmp.response = data;

				// Gather all async dispatches.
				let asyncCalls = [];

				// Check if successful.
				if (data.success) {
					// Update file browser.
					asyncCalls.push({
						type: "UPDATE_FILEBROWSER"
					});
					// Update file object if provided.
					if (action.fileObj) {
						asyncCalls.push({
							type: "UPDATE_FILENAME",
							file: action.fileObj,
							path: action.path
						});
					}
				}

				// Prompt response message.
				asyncCalls.push({
					type: "ALERT",
					message: data.statusMessage
				});

				action.asyncDispatch(asyncCalls);
			});

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "DELETE_FILE" : {

			var tmp = state;

			// If item is being deleted in root, then set root prior to deletion.
			if (tmp.activeDir.search("/") == -1) {
				tmp.activeDir = "";
			} else {
				var paths = tmp.activeDir.split('/');
				paths.pop();
				tmp.activeDir = paths.join('/');
			}

			let formData = new FormData();
			formData.append('fileLoc',action.path);
			
			let post = fileAPICall({
				url: '/api/file/delete/',
				method: 'POST',
				data: formData,
				headers: action.headers,
				appUrl: action.appUrl
			});

			post.then((response) => {
				return response.json();
			}).then(function(data) {
				// Store response.
				tmp.response = data;

				// Gather all async dispatches.
				let asyncCalls = [];

				// Check if successful.
				if (data.success) {
					// Update file browser.
					asyncCalls.push({
						type: "UPDATE_FILEBROWSER"
					});
				}

				// Prompt response message.
				asyncCalls.push({
					type: "ALERT",
					message: data.statusMessage
				});

				action.asyncDispatch(asyncCalls);
			});

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "CHANGE_PERMISSIONS" : {

			var tmp = state;
			
			let post = fileAPICall({
				url: '/api/file/permission/',
				method: 'POST',
				data: action.data,
				headers: action.headers,
				appUrl: action.appUrl
			});

			post.then((response) => {
				return response.json();
			}).then(function(data) {
				// Store response.
				tmp.response = data;

				// Gather all async dispatches.
				let asyncCalls = [];

				// Check if successful.
				if (data.success) {
					// Update file browser.
					asyncCalls.push({
						type: "UPDATE_FILEBROWSER"
					});
				}

				// Prompt response message.
				asyncCalls.push({
					type: "ALERT",
					message: data.statusMessage
				});

				action.asyncDispatch(asyncCalls);
			});

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "NOW_ACTIVE" : {

			// Set vars.
			var tmp = state;

			// Check for multi-view.
			if (tmp.multiView) {
				if (tmp.actives.indexOf(action.viewid) !== -1) {
					tmp = removeActive(tmp, action.viewid);
				} else {
					tmp = addActive(tmp, action.viewid);
				}	
			} else {
				tmp.views.map((file, i) => {
					file.active = false;	
					if (file.viewid == action.viewid) {
						file.active = true;
					}
				});
			}

			// Set current view.
			tmp.workingOnView = action.viewid;

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "CREATE_FOLDER" : {

			var tmp = state;
			
			let post = fileAPICall({
				url: '/api/file/create/folder',
				method: 'POST',
				data: action.data,
				headers: action.headers,
				appUrl: action.appUrl
			});

			post.then((response) => {
				return response.json();
			}).then(function(data) {
				// Store response.
				tmp.response = data;

				// Gather all async dispatches.
				let asyncCalls = [];

				// Check if successful.
				if (data.success) {
					// Update file browser.
					asyncCalls.push({
						type: "UPDATE_FILEBROWSER"
					});
				}

				// Prompt response message.
				asyncCalls.push({
					type: "ALERT",
					message: data.statusMessage
				});

				action.asyncDispatch(asyncCalls);
			});

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "SET_DIR" : {

			state = Object.assign({}, state, {
				activeDir: action.directory
			})

			break;
		}

		case "REORDER" : {

			// Set vars
			var tmp = state;
			var new_order_state = [];

			// Set specific file to active
			action.order.map((id, index) => {
				tmp.views.map((file, i) => {
					if (file.viewid == id) {
						file.active = false;
						file.position = (index + 1);
						if (file.viewid == action.viewid) {
							file.active = true;
						}
						new_order_state.push(file);
					}
				});
			});

			// Set current view.
			tmp.workingOnView = action.viewid;

			// Update array.
			tmp.views = new_order_state;

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "UPDATE_FILENAME" : {

			// Set vars
			var tmp = state;

			// Set specific file to active
			tmp.views.map((file, i) => {
				if (file.viewid == action.file.viewid) {
					file.filename = action.file.filename;

					var paths = action.path.split('/');
					paths.pop();
					if (paths.length > 0) {
						file.filepath = paths.join('/') + "/" + action.file.filename;
					} else {
						file.filepath = action.file.filename;
					}

					file.viewid = file.filepath;
				}
			});

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "UPDATE_OPTIONS" : {

			// Set vars
			var tmp = state;

			// Set specific file to active
			tmp.views.map((file, i) => {
				if (file.viewid == action.view.viewid) {
					file.options.mode = action.options.mode;
					file.options.wrap = (action.options.wrap == "true");
				}
			});

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}
		
		case "UPDATE_CODE" : {

			// Set vars
			var tmp = state;
			var viewid = action.current;

			// Set specific file to active
			tmp.views.map((file, i) => {
				if (file.viewid == viewid) {
					file.code = action.payload;
				}
			});

			tmp.workingOnView = viewid;

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "REMOVE_FILE" : {

			// Set vars
			var tmp = state;
			var this_view = action.viewid;
			var need_active = false;

			if (tmp.multiView) {
				tmp = removeActive(tmp, this_view);
			}

			// Remove file
			tmp.views.map((file, i) => {
				if (file.viewid == this_view) {
					if (file.active) {
						need_active = true;
					}
					tmp.views.splice(i, 1);
				}
			});

			tmp.views = _.sortBy(tmp.views, 'position');

			tmp.views.map((file, i) => {
				file.position = (i + 1);
			});

			// Set another file as active
			if (need_active && tmp.views.length) {
				tmp.views[0].active = true;
				tmp.workingOnView = tmp.views[0].viewid;
			}

			tmp.count = tmp.views.length;

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "STORE_FILE_OBJECT" : {

			// Store browser object from context menu.
			state = Object.assign({}, state, {
				contextData: action.browserObj
			})

			// Check for another dispatch.
			if (action.nextType != false) {
				// Default dispatch.
				let dispatch = {
					type: action.nextType
				}

				// If headers are provided for ajax call, modify dispatch.
				if (action.headers != undefined && action.appUrl != undefined) {
					dispatch = Object.assign({}, dispatch, {
						headers: action.headers,
						appUrl: action.appUrl
					})
				}

				// Dispatch call.
				action.asyncDispatch(dispatch);
			}

			break;
		}

		case "TURN_OFF_MULTI" : {

			// Set vars
			var tmp = state;
			tmp.multiView = false;

			tmp = replaceActive(tmp);

			tmp.views.map((file, i) => {
				file.active = false;	
				if (file.viewid == tmp.workingOnView) {
					file.active = true;
				}
			});

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}

		case "TURN_ON_MULTI" : {

			// Set vars
			var tmp = state;
			tmp.multiView = true;

			tmp.views.map((file, i) => {
				if (file.active) {
					tmp = replaceActive(tmp, file.viewid);
				}
			});

			// Assign new state.
			state = Object.assign({}, state, tmp);

			break;
		}
		
	}
	return state;
}

export default files;