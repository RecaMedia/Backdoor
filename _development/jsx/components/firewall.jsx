import React from 'react';
import Cookies from 'js-cookie';
import store from '../store';

import Signin from './signin';
import mixin from '../mixins/global';

class Firewall extends React.Component {
	
	constructor(props) {
		super(props);

		this.app_state = store.getState();

		this.setHeader = this.setHeader.bind(this);
		this.checkIfUserIsSignedIn = this.checkIfUserIsSignedIn.bind(this);

		this.isSignedIn = false;
	}

	componentDidMount() {
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();

			if (this.app_state.global.lastAction == "CHECK_SIGNIN" || this.app_state.global.lastAction == "CHECK_SIGNOUT") {
				this.checkIfUserIsSignedIn();
			}

			if (this.app_state.global.lastAction == "APP_READY") {
				// Once header is set, we can allow children components to load which use the header for API calls.
				this.isSignedIn = true;
				this.forceUpdate();
			}
		});

		this.checkIfUserIsSignedIn();
	}

	componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
	}

	setHeader() {
		store.dispatch({
			type: "SET_HEADER",
			key: this.app_state.global.key,
			nextType: "APP_READY"
		});
	}

	checkIfUserIsSignedIn() {
		var url = "api/session/signedin";
		var myHeaders = new Headers();
		
		myHeaders.append("session", this.app_state.global.session);
		myHeaders.append("bd2-api-key", this.app_state.global.config.apiKey);
		
		// Check session.
		fetch(url,{
      method: 'POST',
			headers: myHeaders
    }).then((response) => {
      return response.json();
    }).then((data) => {
			// If session matches cookie, set state to true.
			if (this.app_state.global.key == data.key) {
				// Set header for global use when successful signin.
				this.setHeader();
			} else {
				this.isSignedIn = false;
				this.forceUpdate();
			}
    }).catch((error) => {
      mixin.processErrors(error);
    });
	}

	render() {
		var page;

		if (this.isSignedIn) {
			page = this.props.children
		} else {
			page = <Signin/>
		}

		return (
			<div>
				{page}
			</div>
		)
	}
}

export default Firewall;