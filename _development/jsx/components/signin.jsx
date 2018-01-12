import React from 'react';
import store from '../store';

import AccountForm from './accountForm';
import SigninForm from './signinForm';
import InstallForm from './installForm';

class Signin extends React.Component {
	
	constructor(props) {
    super(props);

    this.toggleReg = this.toggleReg.bind(this);

    this.app_state = store.getState();

    this.state = {
      showReg: false
    }
  }

  componentDidMount() {
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();
			if (this.app_state.global.lastAction == "USER_SUCCESSFULLY_CREATED") {
				this.setState({
          showReg: false
        })
			}
		});
	}

	componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
	}
  
  toggleReg(e) {
    e.preventDefault();
    if (this.state.showReg) {
      this.setState({
        showReg: false
      });
    } else {
      this.setState({
        showReg: true
      });
    }
  }

	render() {
    let open_reg_link = "";
    let form_class;
    let form_type;
    
    if (this.app_state.global.config.installed) {
      if (this.app_state.global.settings.bkdr_open_reg) {
        if (this.state.showReg) {
          open_reg_link = <div className="center-text">
            <span>Return to <a href="#" onClick={(e) => this.toggleReg(e)}>sign-in</a> form.</span>
          </div>;
        } else {
          open_reg_link = <div className="center-text">
            <span>Register an <a href="#" onClick={(e) => this.toggleReg(e)}>account</a> for Backdoor access.</span>
          </div>;
        }
      }

      if (this.state.showReg) {
        form_class = "form-signin form-signin--reg";
        form_type = <AccountForm/>;
      } else {
        form_class = "form-signin";
        form_type = <SigninForm/>;
      }
    } else {
      form_class = "form-install";
      form_type = <InstallForm/>;
    }

		return (
			<div className={form_class}>
        {form_type}
        {open_reg_link}
      </div>
		)
	}
}

export default Signin;