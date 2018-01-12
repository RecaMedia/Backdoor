import React from 'react';
import Cookies from 'js-cookie';
import store from '../store';

import mixin from '../mixins/global';

class SigninForm extends React.Component {
	
	constructor(props) {
    super(props);
    
    this.signin = this.signin.bind(this);

    this.app_state = store.getState();
  }
  
  signin(e) {
    e.preventDefault();
    var email = this.refs.email.value;
    var password = this.refs.password.value;

    var myHeaders = new Headers();
    myHeaders.append("session", this.app_state.global.session);
    myHeaders.append("bd2-api-key", this.app_state.global.config.apiKey);

    var form_data = new FormData();
    form_data.append("email", email);
    form_data.append("password", btoa(password));
    
    fetch(this.app_state.global.config.backdoorFullUrl + '/api/users/signin/',{
      method: 'POST',
      headers: myHeaders,
      body: form_data
    }).then((response) => {
      return response.json();
    }).then((data) => {
      
      if (data.success) {

        Cookies.set('bdmemberkey', data.key, {
          expires: 1,
          path: '/'
        });

        store.dispatch({
          type: "SET_SIGNIN",
          key: data.key,
          user: data.user
        })
      } else { 
        store.dispatch({
          type: "ALERT",
          message: "Failed Sign-in!"
        })
      }
    }).catch((error) => {
      mixin.processErrors(error);
    });
  }

	render() {

		return (
			<form className="form" onSubmit={(e) => this.signin(e)}>
        <div className="group center-text">
          <img className="sign-in-logo" src={this.app_state.global.config.backdoorFullUrl + '/assets/img/bkdr_logo_pro_black.svg'}/>
        </div>
        <div className="group">      
          <input ref="email" type="email" id="EmailLogIn" autoComplete="off" required/>
          <span className="highlight"></span>
          <span className="bar"></span>
          <label>Email</label>
        </div>
        <div className="group">      
          <input ref="password" type="password" id="PassLogIn" autoComplete="off" required/>
          <span className="highlight"></span>
          <span className="bar"></span>
          <label>Password</label>
        </div>
        <div className="group center">
          <button className="form-button" type="submit">Log In</button>
        </div>
			</form>
		)
	}
}

export default SigninForm;