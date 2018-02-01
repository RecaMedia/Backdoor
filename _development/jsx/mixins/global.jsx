import $ from 'jquery';
import store from '../store';

// Global Functions
const GlobalFunctions = {

	// Save File Process
	processSave: function(saveAs = null) {
		try {
			// Get centralized state.
			var state = store.getState();
			// Get active view/file object.
			let fileObj = this.getCurrentFileData(state);

			if (fileObj) {
				// Create form data with file path and code.
				let formData = new FormData();
				formData.append('fileLoc',fileObj.filepath);
				formData.append('miscData',fileObj.code);

				// Save As should only prompt dialog if its a new file or user wants to save under new file name.
				if (
					typeof state.files.workingOnView === 'number' && fileObj.filepath !='app_config_fixed_path' || 
					saveAs && fileObj.filepath != 'app_config_fixed_path'
				) {
					// Save As dialog.
					swal({
						title: "Save As",
						text: "Please enter file path and name.",
						type: "input",
						showCancelButton: true,
						confirmButtonColor: "#ff004a",
						confirmButtonText: "Save",
						inputValue: "Untitled"
					}, function(inputValue){
						// Input returned a value, so set new location and file name.
						if (inputValue !== false) {
							// Update file object with new data.
							if (state.files.activeDir == "") {
								fileObj.filepath = inputValue;
							} else {
								fileObj.filepath = state.files.activeDir + "/" + inputValue;
							}
							fileObj.filename = inputValue;
							// Update form object with new data.
							formData.set('fileLoc',state.files.activeDir + "/" + inputValue);
							// Now lets save the file.
							saveDoc(formData,fileObj);
						}			
					});
				} else {
					// Else, we just save the file.
					saveDoc(formData,fileObj);
				}
			}
		} catch (e) {
			this.processErrors(e)
		}
		
		// Save function
		function saveDoc(post,fileObj) {
			store.dispatch({
				type: "SAVE_FILE",
				post,
				fileObj,
				headers: state.global.headers,
				appUrl: state.global.config.backdoorFullUrl
			});
		}
	},

	// Rename File Process
	processRename: function(path) {
		let _self = this;
		// Get centralized state
		var state = store.getState();
		// Check if file that is being renamed is also opened, if so, we'll update that view as well
		let fileObj = this.isFileDataOnView(path, state);
		
		// Create form data with file path and view id
		let formData = new FormData();
		formData.append('fileLoc',path);

		// Save Rename dialog
		swal({
			title: "Rename File",
			text: "Please enter new file name.",
			type: "input",
			showCancelButton: true,
			confirmButtonColor: "#ff004a",
			confirmButtonText: "Rename",
			inputValue: "Untitled"
		}, function(inputValue){
			// Set new file name and path
			if (inputValue !== false) {
				// Update form data
				formData.set('miscData',inputValue);

				// Update file object if opened
				if (fileObj) {
					fileObj.filename = inputValue;
				}

				// Rename file
				store.dispatch({
					type: "RENAME_FILE",
					data: formData,
					fileObj,
					path,
					headers: state.global.headers,
					appUrl: state.global.config.backdoorFullUrl
				});
			}			
		});
	},

	processFolder: function(path = null) {
		let _self = this;
		// Get centralized state
		var state = store.getState();
		// Create form data with folder path and name
		let formData = new FormData();

		// Save Rename dialog
		swal({
			title: "Folder Name",
			text: "Please enter new folder name.",
			type: "input",
			showCancelButton: true,
			confirmButtonColor: "#ff004a",
			confirmButtonText: "Create",
			inputValue: ""
		}, function(inputValue){
			// Set new file name and path
			if (inputValue !== false) {

				if (path != null) {
					// Path is provided, meaning it is a folder, so we pass in the path to be added to the folder name.
					inputValue = path + "/" + inputValue;
				}

				// Update form data
				formData.set('miscData',inputValue);

				// Rename file
				store.dispatch({
					type: "CREATE_FOLDER",
					data: formData,
					headers: state.global.headers,
					appUrl: state.global.config.backdoorFullUrl
				});
			}			
		});
	},

	processPermission: function() {
		let _self = this;
		// Get centralized state
		var state = store.getState();
		// Create form data with folder path and name
		let formData = new FormData();
		formData.append('fileLoc', state.files.contextData.path);

		// Save Rename dialog
		swal({
			title: "Set Permissions",
			text: "Please enter chmod value.",
			type: "input",
			showCancelButton: true,
			confirmButtonColor: "#ff004a",
			confirmButtonText: "Change Permissions",
			inputValue: state.files.contextData.permission
		}, function(inputValue){
			// Set new file name and path
			if (inputValue !== false) {

				if (inputValue.length == 4 && Number.isInteger(Number(inputValue)) ) {

					// Update form data
					formData.set('miscData',inputValue);

					// Rename file
					store.dispatch({
						type: "CHANGE_PERMISSIONS",
						data: formData,
						headers: state.global.headers,
						appUrl: state.global.config.backdoorFullUrl
					});
				} else {
					store.dispatch({
						type: "ALERT",
						message: "ERROR - You need to enter a four digit value."
					});
				}
			}
		});
	},

	processErrors: function(error_msg) {
		var state = store.getState();

		let permission = (state.global.settings!=null?state.global.settings.bkdr_send_errors:false);

		if (permission) {
			// Record errors.
		}
		console.error(error_msg);
	},

	checkForAppUpdate: function(manual = false) {
		let state = store.getState();
		
		fetch('https://api.github.com/repos/RecaMedia/Backdoor-Release/tags', {
			method: 'GET'
		}).then((response) => {
			return response.json();
		}).then((data) => {
			console.log(data[0].name);
			if (data[0].name != state.global.settings.bkdr_version) {
				swal({
					title: "New Update Available",
					text: "Would you like to update now?",
					type: "info",
					showCancelButton: true,
					confirmButtonColor: "#ff004a",
					confirmButtonText: "Update"
				}, (isConfirm) => {
					if (isConfirm) {
						this.updateApp(data[0].zipball_url);
					}			
				});
			} else {
				if (manual) {
					store.dispatch({
						type: "ALERT",
						message: "There are no updates."
					});
				}
			}
		}).catch((error) => {
			this.processErrors(error);
		});
	},

	updateApp: function(downloadUrl) {
		var state = store.getState();
		let url = state.global.config.backdoorFullUrl + '/api/update/';
		
		let formData = new FormData();
		formData.append('downloadUrl', downloadUrl);

		fetch(url, {
			method: 'POST',
			headers: state.global.headers,
			body: formData
		}).then((response) => {
			return response.json();
		}).then(function(data) {
			if (data.success) {
				store.dispatch({
					type: "ALERT",
					message: data.statusMessage
				});
				swal({
					title: "Update Complete",
					text: "Would you like to reload Backdoor?",
					type: "info",
					showCancelButton: true,
					confirmButtonColor: "#ff004a",
					confirmButtonText: "Reload"
				}, (isConfirm) => {
					if (isConfirm) {
						location.reload(true);
					}			
				});
			} else {
				store.dispatch({
					type: "ALERT",
					message: data.statusMessage
				});
			}
		}).catch((error) => {
			this.processErrors(error);
		});
	},

	// General Functions
	getCurrentFileData: function(state) {
		var current_file = false;

		// Find which file is the current focus.
		state.files.views.map((file,i) => {
			if (state.files.workingOnView == file.viewid) {
				current_file = file; 
			}
		});

		return current_file;
	},

	isFileDataOnView: function(path, state) {
		var current_file = false;

		// Find which file is the current focus.
		state.files.views.map((file,i) => {
			if (path == file.filepath) {
				current_file = file; 
			}
		});

		return current_file;
	},
};

module.exports = GlobalFunctions;