import React from 'react';
import store from '../store';

import ErrorBoundary from './errorBoundary';

class AccountForm extends React.Component {

  constructor(props) {
    super(props);
    
    this.updateUser = this.updateUser.bind(this);
    this.updatePass = this.updatePass.bind(this);
    this.register = this.register.bind(this);
		
    this.app_state = store.getState();

    this.state = {
      fname: "",
      lname: "",
      email: ""
    }
    
    if (this.props.type == "update") {
      this.state = {
        fname: this.app_state.user.fname,
        lname: this.app_state.user.lname,
        email: this.app_state.user.email
      }
    }
  }

  componentDidMount() {
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();
			if (this.app_state.global.lastAction == "PASS_UPDATED") {
				this.refs.newpass.value = "";
				this.refs.confirmpass.value = "";
			}
		});
	}

	componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
	}

	updateUser() {
		let user = Object.assign({}, this.app_state.user, {
			fname: this.refs.fname.value,
			lname: this.refs.lname.value,
			email: this.refs.email.value	
		});

		store.dispatch({
			type: "UPDATE_USER",
			user,
			headers: this.app_state.global.headers,
			appUrl: this.app_state.global.config.backdoorFullUrl
		});
	}

	updatePass() {
		let user = Object.assign({}, this.app_state.user, {
			newpass: this.refs.newpass.value,
			confirmpass: this.refs.confirmpass.value
    });
    
    if (user.newpass == user.confirmpass) {
      store.dispatch({
        type: "UPDATE_USER_PASS",
        user,
        headers: this.app_state.global.headers,
        appUrl: this.app_state.global.config.backdoorFullUrl
      });
    } else {
      store.dispatch({
        type: "ALERT",
        message: "Passwords do not match."
      });
    }
  }

  register() {
    let user = Object.assign({}, this.app_state.user, {
			fname: this.refs.fname.value,
			lname: this.refs.lname.value,
      email: this.refs.email.value,
      pass: this.refs.newpass.value,
			confirmpass: this.refs.confirmpass.value
    });

    delete user.active;
    delete user.admin;
    delete user.instanceId;

    var headers = new Headers();
    headers.append("bd2-api-key", this.app_state.global.config.apiKey);

    if (user.pass == user.confirmpass) {
      store.dispatch({
        type: "CREATE_USER",
        user,
        headers,
        appUrl: this.app_state.global.config.backdoorFullUrl
      });
    } else {
      store.dispatch({
        type: "ALERT",
        message: "Passwords do not match."
      });
    }
  }
  
  render() {
    let
    title,
    accountUpdate,
    passUpdate,
    regBtn;

    if (this.props.type == "update") {
      accountUpdate = <div className="group">
        <button className="form-button" onClick={() => this.updateUser()}>Update Account</button>
      </div>;
      passUpdate = <div className="group">
        <button className="form-button" onClick={() => this.updatePass()}>Change Password</button>
      </div>;
    } else {
      title = <div className="row">
        <div className="col-xs-12">
          <h2>Create User Account</h2>
        </div>
      </div>;
      regBtn = <div className="row">
        <div className="col-xs-12">
          <div className="group">
            <button className="form-button" onClick={() => this.register()}>Create Account</button>
          </div>
        </div>
      </div>;
    }

    return (
      <ErrorBoundary>
        <div className="form">
          {title}
          <div className="row">
            <div className="col-xs-12 col-sm-6">
              <div className="group">      
                <input ref="fname" type="text" autoComplete="off" defaultValue={this.state.fname} required/>
                <span className="highlight"></span>
                <span className="bar"></span>
                <label>First Name</label>
              </div>
              <div className="group">      
                <input ref="lname" type="text" autoComplete="off" defaultValue={this.state.lname} required/>
                <span className="highlight"></span>
                <span className="bar"></span>
                <label>Last Name</label>
              </div>
              <div className="group">      
                <input ref="email" type="email" autoComplete="off" defaultValue={this.state.email} required/>
                <span className="highlight"></span>
                <span className="bar"></span>
                <label>Email</label>
              </div>
              {accountUpdate}
            </div>
            <div className="col-xs-12 col-sm-6">
              <div className="group">      
                <input ref="newpass" type="password" autoComplete="off" required/>
                <span className="highlight"></span>
                <span className="bar"></span>
                <label>Password</label>
              </div>
              <div className="group">      
                <input ref="confirmpass" type="password" autoComplete="off" required/>
                <span className="highlight"></span>
                <span className="bar"></span>
                <label>Confirm Password</label>
              </div>
              {passUpdate}
            </div>
          </div>
          {regBtn}
        </div>
      </ErrorBoundary>
    )
  }
}

export default AccountForm;