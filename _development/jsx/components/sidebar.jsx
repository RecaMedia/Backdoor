import React from 'react';
// import $ from 'jquery';
// import 'jquery-ui';
import store from '../store';

import FileBrowser from './fileBrowser';
import Uploader from './uploader';
import ExtensionManager from './extensionManager';
import Extension from './extension';

class Sidebar extends React.Component {

  constructor(props) {
    super(props);

		this.app_state = store.getState();
		
		this.defaultViews = [
			{
				icon: "fa-files-o",
				view: <FileBrowser/>
			},
			{
				icon: "fa-upload",
				view: <Uploader/>
			},
			{
				icon: "fa-puzzle-piece",
				view: <ExtensionManager/>
			}
		];

    this.state = {
			currentView: 0,
			sidebarViews: this.defaultViews
		}
  }

	componentDidMount() {
		$('#SideBarContainer').resizable({
			handles: 'e'
		});
		
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();

			if (this.app_state.global.lastAction == "UPDATE_EXTENSIONS" || this.app_state.global.lastAction == "INSERT_CLASS") {
				this.addExtensions(this.app_state.ext);
			}
    });
    
    this.addExtensions(this.app_state.ext);
  }

  componentWillUnmount() {
		$('#SideBarContainer').resizable("destroy");
		// Unsubscribe
		this.unsubscribe();
	}
	
	addExtensions(extensions) {

		let temp_array = [];

		Object.keys(extensions).map((ext, i) => {
			if (extensions[ext].data.active) {
				temp_array.push({
					icon: extensions[ext].data.icon,
					view: <Extension ext={extensions[ext]} location="side"/>
				});
			}
		});

		let new_views = this.defaultViews.concat(temp_array);

		this.setState({
			sidebarViews: new_views
		})
	}

	newFile() {
		store.dispatch({
			type: "NEW_FILE"
		});
	}

	showView(key) {
		this.setState({
			currentView: key
		});
	}

	render() {
		return (
			<aside className="side-bar">
				<ul>
					<li>
						<button onClick={() => this.newFile()}><i className="fa fa-file-code-o" aria-hidden="true"></i></button>
					</li>
					{
						this.state.sidebarViews.map((item,i) => {
							return <li key={i}>
								<button onClick={() => this.showView(i)}><i className={"fa " + item.icon} aria-hidden="true"></i></button>
							</li>;
						})
					}
				</ul>
				<div id="SideBarContainer" className="side-bar__container">
					{
						this.state.sidebarViews.map((item,i) => {
							let showView = "";
							if (this.state.currentView == i) {
								showView = "side-bar__container__view--show";
							}
							return <div className={"side-bar__container__view " + showView} key={i}>
								{item.view}
							</div>;
						})
					}
				</div>
			</aside>
		)
	}
};

export default Sidebar;