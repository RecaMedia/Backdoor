import React from 'react';
import store from '../store';

import UserOptions from './userOptions';

import mixin from '../mixins/global';

class UserManager extends React.Component {
	
	constructor(props) {
		super(props);

		this.app_state = store.getState();

		this.getUserList = this.getUserList.bind(this);

		this.state= {
			list: []
		}
	}

	componentDidMount() {
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();
			if (this.app_state.global.lastAction == "UPDATE_USER_LIST") {
				this.getUserList();
			}
		});

		this.getUserList();
	}

	componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
	}

	getUserList() {
		let url = this.app_state.global.config.backdoorFullUrl + '/api/users/getall/' + this.app_state.user.code;

		fetch(url,{
      method: 'POST',
      headers: this.app_state.global.headers
    }).then((response) => {
      return response.json();
    }).then((data) => {
      if (data.success) {
				let list;
				if (data.list.length) {
					list = data.list.map((user,i) => {
						return <UserOptions key={i} i={i} user={user}/>
					});
				} else {
					list = "No users found.";
				}
				this.setState({list});
      } else {
				this.setState({
					list: "No users found."
				});
				store.dispatch({
					type: "ALERT",
					message: data.statusMessage
				});
			}
    }).catch((error) => {
      mixin.processErrors(error);
    });
	}

	render() {

		return (
			<div className="user-list">
				{this.state.list}
			</div>
		)
	}
}

export default UserManager;