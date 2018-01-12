import React from 'react';
import store from '../store';

import mixin from '../mixins/global';

// Get Global Functions
import GlobalFunctions from '../mixins/global';

class ContextMenu extends React.Component {
		
	constructor(props) {
		super(props);
		
		this.app_state = store.getState();

		this.closeContext = this.closeContext.bind(this);
		this.openContext = this.openContext.bind(this);

		this.state = {
			context: {
        y: 0,
        x: 0,
        menu: ""
      },
			contextFlag: false
		};
	}

  componentDidMount() {
    let _self = this;

    $(document).on("click", function(e) {
			let found = $(e.target).closest('.context-menu').length;
			if (_self.state.contextFlag && !found) {
				_self.closeContext();
			}
		});

    document.addEventListener('contextmenu', function(ev) {
			ev.preventDefault();

			let x = ev.clientX;
			let y = ev.clientY;
			let target = $(ev.target);
			
			let browserFolder = target.closest('li[data-type="folder"]');
			let browserFile = target.closest('li[data-type="file"]');
			let context;
			var menu;

			if (browserFolder.length) {
				// is folder
				menu = <ul>
					<li><button onClick={() => _self.openContext("RENAME_FILE",browserFolder.attr('data-path'))}>Rename</button></li>
					<li><button onClick={() => _self.openContext("COPY_FILE",browserFolder.attr('data-path'))}>Copy</button></li>
					<li><button onClick={() => _self.openContext("DELETE_FILE",browserFolder.attr('data-path'))}>Delete</button></li>
					<li><button onClick={() => _self.openContext("CHANGE_PERMISSIONS")}>Permissions</button></li>
					<li><button onClick={() => _self.openContext("NEW_FOLDER",browserFolder.attr('data-path'))}>Add Folder</button></li>
				</ul>
			} else if (browserFile.length) {
				// is file
				menu = <ul>
					<li><button onClick={() => _self.openContext("LOAD_FILE")}>Open</button></li>
					<li><button onClick={() => _self.openContext("RENAME_FILE",browserFile.attr('data-path'))}>Rename</button></li>
					<li><button onClick={() => _self.openContext("COPY_FILE",browserFile.attr('data-path'))}>Copy</button></li>
					<li><button onClick={() => _self.openContext("DELETE_FILE",browserFile.attr('data-path'))}>Delete</button></li>
					<li><button onClick={() => _self.openContext("CHANGE_PERMISSIONS")}>Permissions</button></li>
				</ul>
			} else if (target.closest('.file-browser').length) {
				// is file browser
				menu = <ul>
					<li><button onClick={() => _self.openContext("NEW_FOLDER")}>New Folder</button></li>
					<li><button onClick={() => _self.openContext("NEW_FILE")}>New File</button></li>
				</ul>
			/* } else if (target.closest('.view--active').length) {
				// is active view
				menu = <ul>
					<li><button>Save</button></li>
					<li><button>Save As</button></li>
					<li><button>Close</button></li>
				</ul> */
			} else if (target.closest('.main-container').length) {
				// is view area
				menu = <ul>
					<li><button onClick={() => _self.openContext("NEW_FILE")}>New File</button></li>
					<li><button>Close Backdoor</button></li>
				</ul>
			}

			_self.setState({
				context: {y,x,menu}
			});

			return false;
		}, false);

		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();
			if (this.app_state.global.lastAction == "OPEN_CONTEXT_MENU") {
				this.setState({
					contextFlag: true
				});
			}
		});
	}
	
	componentWillUnmount() {
		$(document).unbind();
		document.removeEventListener('contextmenu',function(){});
		// Unsubscribe
		this.unsubscribe();
	}

  closeContext() {
		this.setState({
			context: {
        y: 0,
        x: 0,
        menu: ""
      },
			contextFlag: false
		});
	}

	openContext(type,misc = null) {
		switch(type) {
			case "NEW_FOLDER": {
				mixin.processFolder(misc);
				break;
			}
			case "NEW_FILE": {
				store.dispatch({
					type
				});
				break;
			}
			case "LOAD_FILE": {
				store.dispatch({
					type,
					headers: this.app_state.global.headers,
					appUrl: this.app_state.global.config.backdoorFullUrl
				});
				break;
			}
			case "RENAME_FILE": {
				mixin.processRename(misc);
				break;
			}
			case "COPY_FILE": {
				store.dispatch({
					type,
					path: misc
				});
				break;
			}
			case "DELETE_FILE": {
				store.dispatch({
					type,
					path: misc,
					headers: this.app_state.global.headers,
					appUrl: this.app_state.global.config.backdoorFullUrl
				});
				break;
			}
			case "CHANGE_PERMISSIONS": {
				mixin.processPermission();
				break;
			}
		}
		this.closeContext();
	}

	render() {
		let style = {
			top: this.state.context.y,
			left: this.state.context.x
		}

		return (
			<div style={style} className={this.state.contextFlag?"context-menu show-context":"context-menu"}>
				{this.state.context.menu}
			</div>
		)
	}
}

export default ContextMenu;