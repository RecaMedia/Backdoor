import React from 'react';
import Cookies from 'js-cookie';
import $ from 'jquery';
import store from '../store';

import mixin from '../mixins/global';

// Get Global Functions
import GlobalFunctions from './../mixins/global';

class Navbar extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = store.getState();

		this.admin = this.app_state.user.admin;

		this.buttons = null;
		this.navbar = null;
		this.topButtons = null;

		this.closeMenus = this.closeMenus.bind(this);
		this.menuAction = this.menuAction.bind(this);
		this.insertView = this.insertView.bind(this);
		this.toggleSplit = this.toggleSplit.bind(this);
		this.openConfig = this.openConfig.bind(this);
		this.checkVersion = this.checkVersion.bind(this);

		this.state = {
			multiView: this.app_state.files.multiView
		};
	}

	componentDidMount() {
		var _self = this;
		this.navbar = $('.nav-bar');
		this.topButtons = this.navbar.find('.nav-bar__menu > li > button');
		this.buttons = this.navbar.find('.nav-bar__menu > li > ul button');

		this.topButtons.on('click', function(){
			var _parent = $(this).parent();
			if (_parent.hasClass('nav-bar__menu--open')) {
				_self.closeMenus();
			} else {
				_self.closeMenus();
				_parent.addClass('nav-bar__menu--open');
			}
		});

		this.buttons.on('click', function(e){
			if ($(this).siblings('ul').length) {
				$(this).parent().toggleClass('nav-bar__menu--open');
			} else {
				_self.closeMenus();
			}
		});

		$(document).on("click", function(e) {
			var found = $(e.target).closest('.nav-bar').length;
			if (!found) {
				_self.closeMenus();
			}
		}).on("contextmenu", function(e) {
			var found = $(e.target).closest('.nav-bar').length;
			if (!found) {
				_self.closeMenus();
			}
		});

		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();
			if (this.refs.navbar) {
				this.setState({
					multiView: this.app_state.files.multiView
				});
			}
		});
	}

	componentWillUnmount() {
		$(document).unbind();
		this.topButtons.unbind();
		this.buttons.unbind();
		// Unsubscribe
		this.unsubscribe();
	}

	closeMenus() {
		this.navbar.find('.nav-bar__menu--open').removeClass('nav-bar__menu--open');
	}

	insertView(view) {
		if (typeof this.props.insertView === 'function') {
			this.props.insertView(view);
		}
	}

	toggleSplit() {
		var state = store.getState();
		this.closeMenus();

		if (state.files.multiView) {
			store.dispatch({
				type: "TURN_OFF_MULTI"
			});
		} else {
			store.dispatch({
				type: "TURN_ON_MULTI"
			});
		}
	}

	openConfig() {
		let url = this.app_state.global.config.backdoorFullUrl + '/api/file/';
		var config_path = 'app_config_fixed_path';

		let formData = new FormData();
		formData.append('fileLoc',config_path);
		formData.append('usercode',this.app_state.user.code);

		// Get dir data
		fetch(url, {
			method: 'POST',
			headers: this.app_state.global.headers,
			body: formData
		}).then((response) => {
			return response.json();
		}).then(function(data) {
			if (data.success) {
				var obj = {
					data: data.file,
					filename: 'configuration',
					lastmodified: '',
					path: config_path,
					size: ''
				}
				store.dispatch({
					type: "OPEN_FILE",
					browserObj: obj
				});
			} else {
				store.dispatch({
					type: "ALERT",
					message: data.statusMessage
				});
			}
		}).catch((error) => {
			mixin.processErrors(error);
		});
	}

	checkVersion() {
		mixin.checkForAppUpdate(true);
	}

	menuAction(type) {
		var _self = this;

		switch(type) {
			case "NEW_FILE": {
				store.dispatch({
					type: "NEW_FILE"
				});
				break;
			}
			case "CONFIG": {
				this.openConfig();
				break;
			}
			case "ACCOUNT": {
				this.insertView(type);
				break;
			}
			case "USERS": {
				this.insertView(type);
				break;
			}
			case "SETTINGS": {
				this.insertView(type);
				break;
			}
			case "SAVE": {
				mixin.processSave();
				break;
			}
			case "SAVE_AS": {
				mixin.processSave(true);
				break;
			}
			case "CLOSE": {
				Cookies.remove('bdmemberkey');
				Cookies.remove('bduserdata');
				store.dispatch({
					type: "SET_SIGNOUT"
				});
				break;
			}
		}
		this.closeMenus();
	}

	render() {
		let multiview_class = ""
		let config_option = null;
		let manage_users_option = null;

		if (this.state.multiView) {
			multiview_class = "button-active"
		}
		if (this.admin) {
			config_option = <li>
				<button onClick={() => this.menuAction("CONFIG")}>Configurations</button>
			</li>;
			manage_users_option = <li>
				<button onClick={() => this.menuAction("USERS")}>Manage Users</button>
			</li>
		}

		return (
			<nav ref="navbar" className="nav-bar">
				<ul className="nav-bar__menu">
					<li>
						<button>BKDR</button>
						<ul>
							<li>
								<label>Backdoor - {this.app_state.global.settings.bkdr_version}</label>
							</li>
							<li>
								<button onClick={() => this.menuAction("SETTINGS")}>App Settings</button>
							</li>
							<li>
								<a href="https://recamedia.github.io/Backdoor/" target="_blank">Visit BKDR</a>
								<ul>
									<li>
										<a href="https://github.com/RecaMedia/Backdoor" target="_blank">Developer Repo</a>
									</li>
									<li>
										<a href="https://github.com/RecaMedia/Backdoor-Release" target="_blank">Release Repo</a>
									</li>
									<li>
										<a href="https://github.com/RecaMedia/Backdoor/issues" target="_blank">Issue Tracker</a>
									</li>
								</ul>
							</li>
							<li>
								<button onClick={() => this.checkVersion()}>Check for Updates</button>
							</li>
							<li>
								<button onClick={() => this.menuAction("CLOSE")}>Exit Backdoor</button>
							</li>
						</ul>
					</li>
					<li>
						<button>File</button>
						<ul>
							<li>
								<button onClick={() => this.menuAction("NEW_FILE")}>New</button>
							</li>
							<li>
								<button onClick={() => this.menuAction("SAVE")}>Save</button>
							</li>
							<li>
								<button onClick={() => this.menuAction("SAVE_AS")}>Save As</button>
							</li>
							{config_option}
						</ul>
					</li>
					<li>
						<button>User Management</button>
						<ul>
							<li>
								<button onClick={() => this.menuAction("ACCOUNT")}>Account Settings</button>
							</li>
							{manage_users_option}
						</ul>
					</li>
					<li className="nav-bar__spacer"></li>
				</ul>
				<ul className="nav-bar__menu">
					<li>
						<button title="Multiview" className={multiview_class} onClick={() => this.toggleSplit()}><i className="fa fa-columns" aria-hidden="true"></i></button>
					</li>
				</ul>
			</nav>
		)
	}
}

export default Navbar;