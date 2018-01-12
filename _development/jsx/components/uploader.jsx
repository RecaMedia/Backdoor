import React from 'react';
import _ from 'underscore';
import $ from 'jquery';
import store from '../store';

import ErrorBoundary from './errorBoundary';

import mixin from '../mixins/global';

class UploadItem extends React.Component {
	
	constructor(props) {
		super(props);

		this.removeItem = this.removeItem.bind(this);
	}

	removeItem() {
		if (typeof this.props.removeItem === 'function') {
			this.props.removeItem(this.props.file);
		}
	}

	render() {
		// Show progress bar if property is provided.
		var progress = "";
		if (this.props.progress != undefined) {
			var style = {
				width: this.props.progress+"%"
			}
			progress = <div className="uploader-queue__item__bar">
				<div className="uploader-queue__item__bar__progress" style={style}></div>
			</div>;
		}

		return (
			<li id={"FileItem_"+this.props.idkey+"_"+this.props.file.size} className="uploader-queue__item">
				<button className="uploader-queue__item__close" onClick={() => this.removeItem()}><i className="fa fa-close"></i></button>
				{progress}
				<div className="uploader-queue__item__text">
					{this.props.file.name}
				</div>
			</li>
		)
	}
}

class Uploader extends React.Component {

	constructor(props) {
		super(props);

		this.selectedFiles = this.selectedFiles.bind(this);
		this.formSubmit = this.formSubmit.bind(this);
		this.uploadFiles = this.uploadFiles.bind(this);
		this.uploadComplete = this.uploadComplete.bind(this);
		this.removeItem = this.removeItem.bind(this);
		this.clearAll = this.clearAll.bind(this);

		this.app_state = store.getState();

		this.state = {
			fileList: [],
			items: []
		}
	}

	componentDidMount() {
		this.fileBrowserInput = document.getElementById("fileBrowser");
	}

	selectedFiles() {
		var items = [];

		// Getting all fileList objects from input.
		for (var i = 0; i < this.fileBrowserInput.files.length; ++i) {
			var fileData = this.fileBrowserInput.files[i];

			items.push({
				lastModified: fileData.lastModified,
				name: fileData.name,
				progress: 0,
				size: fileData.size,
				type: fileData.type
			});
		}

		// Update state with file list.
		this.setState({
			fileList: Array.from(this.fileBrowserInput.files),
			items
		});

		// Clear input field.
		this.fileBrowserInput.value = '';
	}

	formSubmit() {
		var _self = this;

		// On submit, upload is done individually per file.
		$.each(this.state.fileList, function(key, file) {
			_self.uploadFiles(key+"_"+file.size,file,file.name);
		});
	}

	uploadFiles(key, file, name) {
		var _self = this;
		var formData = new FormData();
		formData.append("fileLoc", this.app_state.files.activeDir);
		formData.append("file", file, name);

		// Set up the request.
		var xhr = new XMLHttpRequest();
		// Open the connection.
		xhr.open("POST", this.app_state.global.config.backdoorFullUrl + "/api/file/upload/", true);
		// Set headers.
		xhr.setRequestHeader("session", this.app_state.global.session);
		xhr.setRequestHeader("bd2-api-key", this.app_state.global.config.apiKey);
		xhr.setRequestHeader("member-api-key", this.app_state.global.key);
		// Set up a handlers.
		xhr.upload.addEventListener("progress", function(event){
			_self.uploadProgress(key,event);
		}, false);

		xhr.onload = function () {
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				try {
					_self.uploadComplete(data);
				} catch(error) {
					mixin.processErrors(error);
				}
			} else {
				response = {
					success: false,
					statusMessage: "Error making request."
				};
			}
		};
		
		// Send the Data.
		xhr.send(formData);
	}

	uploadProgress(k,e) {
		if (e.lengthComputable) {
			var percentComplete = (e.loaded / e.total) * 100;
			var barId = '#FileItem_'+k;
			$(barId+' .uploader-queue__item__bar__progress').css('width',percentComplete+'%');
		}
	}

	uploadComplete(response) {
		store.dispatch({
			type: "UPDATE_FILEBROWSER"
		});

		store.dispatch({
			type: "ALERT",
			message: response.statusMessage
		});
	}

	removeItem(fileObj) {
		var newFileList = this.state.fileList.filter(function(obj) {
			return obj.name !== fileObj.name;
		});

		var newItem = this.state.items.filter(function(obj) {
			return obj.name !== fileObj.name;
		});

		this.setState({
			fileList: newFileList,
			items: newItem
		})
	}

	clearAll() {
		this.fileBrowserInput.value = '';

		this.setState({
			fileList: [],
			items: []
		})
	}
	
	render() {
		return (
			<ErrorBoundary>
				<div className="uploader">

					<form id="uploadForm" formEncType="multipart/form-data">

						<div className="uploader-browse">
							<i className="fa fa-folder-open-o"></i> Browse Files
							<input id="fileBrowser" type="file" multiple name="up_files" onChange={() => {this.selectedFiles()}}/>
						</div>	

						<div className="uploader-btn-group">
							<button className="uploader-upload" type="button" onClick={() => this.formSubmit()}>
								<i className="fa fa-upload"></i> Upload
							</button>
							<button className="uploader-clear" type="button" onClick={() => this.clearAll()}>
								<i className="fa fa-eraser"></i> Clear
							</button>
						</div>

					</form>

					<ul className="uploader-queue">
						{
							this.state.items.map((file,i) => {
								return <UploadItem key={i} idkey={i} progress={file.progress} file={file} removeItem={this.removeItem}/>;
							})
						}
					</ul>
				</div>
			</ErrorBoundary>
		)
	}
}

export default Uploader;