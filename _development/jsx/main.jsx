import React from 'react';
import {findDOMNode} from 'react-dom';
import {Provider} from 'react-redux';
import store from './store';

import LoadScreen from './components/loadscreen';
import Firewall from './components/firewall';
import ContextMenu from './components/contextmenu';
import Navbar from './components/navbar';
import Sidebar from './components/sidebar';
import View from './components/view';
import ViewAccount from './components/viewAccount';
import ViewSettings from './components/viewSettings';
import ViewUsers from './components/viewUsers';
import BottomPanel from './components/bottomPanel';
import Footer from './components/footer';

// Get Global Functions
import mixin from './mixins/global';

class Main extends React.Component {
	
	constructor(props) {
		super(props);
		
		this.app_state = store.getState();

		this.setSocket = this.setSocket.bind(this);
		this.checkForSession = this.checkForSession.bind(this);
		this.getExtensions = this.getExtensions.bind(this);
		this.checkVersion = this.checkVersion.bind(this);
		this.insertView = this.insertView.bind(this);
		
		this.state = {
			isReady: false,
			page: null
		};
	}

	componentDidMount() {
		let _self = this;

		// Get configurations from file.
		store.dispatch({
			type: "GET_CONFIG"
		});
		
		// Listen for Ctrl+S to save.
		document.addEventListener('keydown', (function(e) {
			if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
				e.preventDefault();
				mixin.processSave();
			}
		}), false);

		// Listen to dispatches.
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();

			if (this.app_state.global.lastAction == "UPDATE_GLOBAL") {
				this.setSocket();
			}

			if (this.app_state.global.lastAction == "UPDATE_SESSION") {
				this.checkForSession();
			}

			if (this.app_state.global.lastAction == "APP_READY") {
				this.getSettings();
				this.getExtensions();
				this.checkVersion();
			}
		});
	}

	componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
	}

	setSocket() {

		if (this.app_state.global.socket != null) {
			this.socket = this.app_state.global.socket;
	
			// Connect to socket and return users that are connected.
			this.socket.on('connect', function(){
				var user_data = Object.assign({}, _self.app_state.user, {
					ip: 0
				});
				_self.socket.emit('store_client_info', user_data);
				console.log('Connected to Backdoor 2 Pro Server.');
			}).on('update_users', function(users){
				store.dispatch({
					type: "UPDATE_USERS",
					payload: users
				});
			});
		}
		
		// Check for session id.
		this.checkForSession();
	}

	checkForSession() {
		var url = 'api/session/';
		var myHeaders = new Headers();

		myHeaders.append("bd2-api-key", this.app_state.global.config.apiKey);
		
		if (this.app_state.global.session == undefined || this.app_state.global.session == null) {
			// Get session id if not already provided.
			fetch(url,{
				method: 'POST',
				headers: myHeaders
			}).then((response) => {
				return response.json();
			}).then((data) => {
				store.dispatch({
					type: "UPDATE_SESSION",
					session: data.session
				});
			}).catch((error) => {
				mixin.processErrors(error);
			});
		} else {
			this.getSettings(true);
		}
	}

	getExtensions() {
		var _self = this;
		var url = this.app_state.global.config.backdoorFullUrl + '/api/ext';

		// Get dir data
		fetch(url, {
			method: 'POST',
			headers: this.app_state.global.headers
		}).then((response) => {
			return response.json();
		}).then(function(data) {
			if (data.success) {
				store.dispatch({
					type: "UPDATE_EXTENSIONS",
					extlist: data.extensions
				});
			}
		}).catch((error) => {
			mixin.processErrors(error);
		});
	}

	getSettings(open = false) {
		let url;
		let headers;
		
		if (open) {
			url = 'api/settings/open/';
			headers = new Headers();
			headers.append("bd2-api-key", this.app_state.global.config.apiKey);
		} else {
			url = this.app_state.global.config.backdoorFullUrl + '/api/settings/';
			headers = this.app_state.global.headers;
		}
		
		// Get dir data
		fetch(url, {
			method: 'GET',
			headers
		}).then((response) => {
			return response.json();
		}).then((data) => {
			if (data.success) {
				store.dispatch({
					type: "SET_SETTINGS",
					settings: data.settings
				});
				if (!this.state.isReady) {
					this.setState({
						isReady: true
					});
				}
			} else {
				store.dispatch({
					type: "ALERT",
					settings: data.statusMessage
				});
			}
		}).catch((error) => {
			mixin.processErrors(error);
		});
	}

	checkVersion() {
		if (this.app_state.global.settings.bkdr_check_updates) {
			mixin.checkForAppUpdate();
		}
	}

	ec(error = null) {
		if (error != null) {
			mixin.processErrors(error);
		}
	}

	insertView(view) {
		switch(view) {
			case "SETTINGS": {
				this.setState({
					page: <ViewSettings clearView={this.insertView}/>
				});
				break;
			}
			case "ACCOUNT": {
				this.setState({
					page: <ViewAccount clearView={this.insertView}/>
				});
				break;
			}
			case "USERS": {
				this.setState({
					page: <ViewUsers clearView={this.insertView}/>
				});
				break;
			}
			default: {
				this.setState({
					page: null
				});
			}
		}
	}

	render() {

		var content;
		
		if (this.state.isReady) {
			content = <Firewall>
				<ContextMenu/>
				<header id="header" role="header" className="header">
					<Navbar insertView={this.insertView}/>
				</header>
				<main role="main" className="main">
					<Sidebar/>
					<div className="main-container">
						<View/>
						<div id="ViewPriority" className="main-container__priority">
							{this.state.page}
						</div>
						<BottomPanel/>
					</div>
				</main>
				<Footer/>
			</Firewall>;
		} else {
			content = <LoadScreen/>;
		}

		return (
			<div id="Main">
				<div id="AlertBox" className="alert"></div>
				{content}
			</div>
		)
	}
}

export default Main;