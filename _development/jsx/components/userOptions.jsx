import React from 'react';
import store from '../store';

import InputCheckbox from './inputCheckbox';

class UserOptions extends React.Component {
	
	constructor(props) {
    super(props);

    this.app_state = store.getState();

    this.updateUser = this.updateUser.bind(this);
    this.removeUser = this.removeUser.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    
    this.state = {
      is_admin: this.props.user.admin,
      is_active: this.props.user.active,
      isCurrentUser: (this.app_state.user.code == this.props.user.code ? true : false),
      viewable: false
    }
  }
  
  updateUser(input_state) {
    let url;
    var form_data = new FormData();
    form_data.append("admincode", this.app_state.user.code);

    if (input_state.is_admin != undefined && input_state.is_admin != this.state.is_admin) {
      url = this.app_state.global.config.backdoorFullUrl + '/api/users/setadmin/';
      form_data.append("usercode", this.props.user.code);
      form_data.append("makeadmin", (input_state.is_admin?1:0));
    } else if (input_state.is_active != undefined && input_state.is_active != this.state.is_active) {
      url = this.app_state.global.config.backdoorFullUrl + '/api/users/activate/';
      form_data.append("usercode", this.props.user.code);
      form_data.append("confirm", (input_state.is_active?1:0));
    }

    fetch(url,{
      method: 'POST',
      headers: this.app_state.global.headers,
      body: form_data
    }).then((response) => {
      return response.json();
    }).then((data) => {
      if (data.success) {
        this.setState(input_state);
      }
      store.dispatch({
        type: "ALERT",
        message: data.statusMessage
      })
    }).catch((error) => {
      mixin.processErrors(error);
    });
  }

  removeUser() {
    let url = this.app_state.global.config.backdoorFullUrl + '/api/users/remove/'+this.props.user.code+'/';

    fetch(url,{
      method: 'GET',
      headers: this.app_state.global.headers
    }).then((response) => {
      return response.json();
    }).then((data) => {
      store.dispatch({
        type: "ALERT",
        message: data.statusMessage
      });
      if (data.success) {
        store.dispatch({
          type: "UPDATE_USER_LIST"
        });
      }
    }).catch((error) => {
      mixin.processErrors(error);
    });
  }

  toggleSettings() {
    if (this.state.viewable) {
      this.setState({
        viewable: false
      });
    } else {
      this.setState({
        viewable: true
      });
    }
  }

	render() {
    let rowClass = "user-list__row";
    let disableInput = false;
    let userName = this.props.user.fname + " " + this.props.user.lname;
    let deleteBtn = <button className="form-button" onClick={() => this.removeUser()}>Delete User</button>;

    if (this.state.isCurrentUser) {
      userName = "You";
      deleteBtn = null;
    }

    if (this.state.viewable) {
      rowClass = "user-list__row user-list__row--open";
    }

    if (this.props.user.superadmin) {
      disableInput = true;
    }

		return (
      <div className={rowClass}>
        <div className="user-list__header">
          <p className="user-list__name">
            {userName} ({this.props.user.email})
          </p>
          <button className="user-list__toggle" onClick={() => this.toggleSettings()}>
            <i className="fa fa-chevron-down"></i>
          </button>
        </div>
        <div className="user-list__settings form">
          <div className="row">
            <div className="col-xs-12 col-sm-4">
              <InputCheckbox title="User Admin" name="is_admin" value={this.state.is_admin} disabled={disableInput} handleChange={this.updateUser}/>
            </div>
            <div className="col-xs-12 col-sm-4">
              <InputCheckbox title="Activate" name="is_active" value={this.state.is_active} disabled={disableInput} handleChange={this.updateUser}/>
            </div>
            <div className="col-xs-12 col-sm-3 col-sm-offset-1">
              {deleteBtn}
            </div>
          </div>
        </div>
      </div>
		)
	}
}

export default UserOptions;