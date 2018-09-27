import React from 'react';
import {findDOMNode} from 'react-dom';
import $ from 'jquery';
import _ from 'lodash';
import store from '../store';

// Get Global Functions
import mixin from '../mixins/global';

import ErrorBoundary from './errorBoundary';

class RLI extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<li data-type={this.props.datatype} data-path={this.props.datapath}>
				{this.props.children}
			</li>
		)
	}
}

class RI extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		let className = "fa " + this.props.icon;
		return (
			<i className={className}>{this.props.filename}</i>
		)
	}
}

class RBTN extends React.Component {
	constructor(props) {
		super(props);
		this.clickEvent = this.clickEvent.bind(this);
	}

	componentDidMount() {
		const button = findDOMNode(this.refs.button);
		this.button = $(button);
	}

	contextMenu() {
		store.dispatch({
			type: "STORE_FILE_OBJECT",
			browserObj: this.props.browserObj,
			nextType: "OPEN_CONTEXT_MENU"
		})
	}

	clickEvent() {
		this.app_state = store.getState();
		var btnIcon = this.button.find('.fa').first();
		
		if (this.props.loadFile) {

			// var is_open = _.findWhere(this.app_state.files.views, {viewid: this.props.browserObj.path});
			
			var is_open = false;
			
			is_open = _.find(this.app_state.files.views, (view) => {
				if (_.matches(view)({viewid: this.props.browserObj.path})) {
					return true;
				}
			});

			if (!is_open) {
				store.dispatch({
					type: "STORE_FILE_OBJECT",
					browserObj: this.props.browserObj,
					nextType: "LOAD_FILE",
					headers: this.app_state.global.headers,
					appUrl: this.app_state.global.config.backdoorFullUrl
				});
			} else {
				store.dispatch({
					type: "STORE_FILE_OBJECT",
					browserObj: this.props.browserObj,
					nextType: false
				});
				store.dispatch({
					type: "NOW_ACTIVE",
					viewid: this.props.browserObj.path
				});
			}

			if (this.button.parent().hasClass('highlight-file')) {
				this.button.parent().removeClass('highlight-file');
			} else {
				$('.file-browser .highlight-file').removeClass('highlight-file');
				this.button.parent().addClass('highlight-file');
			}
		}

		if (typeof this.props.getDir === 'function') {
			this.button.parent().addClass('highlight-dir')
			btnIcon.removeClass('fa-folder').addClass('fa-folder-open');
			this.props.getDir(this.props.browserObj['path']);
		} else if (typeof this.props.setDir === 'function') {
			
			if (this.button.parent().hasClass('hide-dir')) {
				this.button.parent().removeClass('hide-dir').addClass('highlight-dir');
				btnIcon.removeClass('fa-folder').addClass('fa-folder-open');
				this.props.setDir(this.props.browserObj['path']);
			} else {
				this.button.parent().addClass('hide-dir').removeClass('highlight-dir');
				btnIcon.removeClass('fa-folder-open').addClass('fa-folder');
				this.props.setDir(this.props.browserObj['path'],true);
			}
		}
	}

	render() {
		return (
			<button ref="button" onClick={() => this.clickEvent()} onContextMenu={() => this.contextMenu()}>
				{this.props.children}
			</button>
		)
	}
}

class FileBrowser extends React.Component {
		
	constructor(props) {
		super(props);
		
		this.app_state = store.getState();

		this.setDir = this.setDir.bind(this);
		this.getDir = this.getDir.bind(this);
		this.updateDir = this.updateDir.bind(this);
		this.buildDir = this.buildDir.bind(this);

		this.backdoor_dir = null;
		this.dirObj = null;

		// initial state
		this.state = {
			fileBrowser: "Loading..."
		}
	}

	componentDidMount() {
		// subscribe to store to update when a file is created or changed
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();
			if (this.app_state.global.lastAction == "UPDATE_FILEBROWSER") {
				this.getDir(this.app_state.files.activeDir);
			}
		});

		// Get root directory by default
		this.getDir("");
	}
	
	componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
	}

	setDir(path, goBack = false) {
		// If we're going back a directory from only one child depth, default to root
		if (goBack) {
			var paths = path.split('/');
			paths.pop();
			if (paths.length > 0) {
				path = paths.join('/');
			} else {
				path = "";
			}
		}
		// Set current directory
		store.dispatch({
			type: "SET_DIR",
			directory: path
		});
	}

	getDir(path) {
		// Only folder clicks with invoke this method which is why we're setting the "dir" parameter
		var _self = this;
		var url = this.app_state.global.config.backdoorFullUrl + '/api/dir/';

		let formData = new FormData();
		formData.append('dir',path);

		// Set current active directory
		this.setDir(path);

		// Get dir data
		fetch(url, {
			method: 'POST',
			headers: this.app_state.global.headers,
			body: formData
		}).then((response) => {
			return response.json();
		}).then(function(data) {
			if (data.success) {
				_self.updateDir(path,data.directory.files);
			} else {
				store.dispatch({
					type: "ALERT",
					message: data.statusMessage
				});
				_self.setState({
					fileBrowser: "Unable to load directory. Session has possibly expired."
				})
			}
		}).catch((error) => {
      mixin.processErrors(error);
    });
	}

	updateDir(path,obj) {
		// On init, if null, set obj to the data received on ajax request
		if (this.dirObj == null) {
			this.dirObj = obj;
		} else {
			// If not root
			if (path != "") {
				// Else, set obj 'content' property value to the obj being passed in for the designated path
				var paths = path.split('/');
				var newPath = paths.join('.content.')+'.content';
				_.set(this.dirObj, newPath, obj);
			} else {
				this.dirObj = obj;
			}
		}

		// Build html of folder directory
		var dir_list = this.buildDir(this.dirObj);
		// Set html within FileBrowser
		this.setState({
			fileBrowser: dir_list
		});
	}

	buildDir(obj) {
		var _self = this;
		var ul = [];
		var type = [];
		var path = [];
		var complete_ul

		for (var key in obj) {
			let thisObj = obj[key];
			var li;
			// Icon component
			var i = <RI icon={thisObj['icon']} filename={' '+thisObj['filename']}/>
			
			if (thisObj['isfolder']) {
				// Is folder
				type.push("folder");
				path.push(thisObj['path']);
				var thisUl = "";
				var button;

				// Button function depends on condition result
				if (thisObj.hasOwnProperty('content')) {
					// If property content exist, we simply need to build the UL using the same method
					thisUl = this.buildDir(thisObj['content']);
					button = <RBTN setDir={this.setDir} browserObj={thisObj} type="folder">
						{i}
					</RBTN>
				} else {
					// User is now requesting for this directory and we need retrieve it
					button = <RBTN getDir={this.getDir} browserObj={thisObj} type="folder">
						{i}
					</RBTN>
				}

				// Add button with subdir UL
				li = <div>
					{button}
					{thisUl}
				</div>
			} else {
				// Is file
				type.push("file");
				path.push(thisObj['path']);

				// Add button
				li = <RBTN loadFile={true} browserObj={thisObj} type="file">
					{i}
				</RBTN>
			}

			// Add li content
			ul.push(li)
		}

		// Return complete UL
		return <ul>
			{ul.map((li,i) => 
				<RLI datapath={path[i]} datatype={type[i]} key={i}>
					{li}
				</RLI>
			)}
		</ul>;
	}

	contextMenu() {
		store.dispatch({
			type: "OPEN_CONTEXT_MENU"
		})
	}

	render() {
		return (
			<ErrorBoundary>
				<div className="file-browser" onContextMenu={() => this.contextMenu()}>
					{this.state.fileBrowser}
				</div>
			</ErrorBoundary>
		)
	}
}

export default FileBrowser;